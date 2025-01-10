import type { Collection, MongoClient, WithId } from 'mongodb';

export * from './eventStore';

type StreamType = string;
type StreamName<T extends StreamType = StreamType> = `${T}:${string}`;

type Event = {
  type: string;
  data: unknown;
  metadata: {
    streamName: StreamName;
  };
};

type Stream<
  Type extends StreamType = StreamType,
  Name extends StreamName<StreamType> = StreamName<StreamType>,
> = {
  streamName: Name;
  events: Event[];
  metadata: {
    streamId: string;
    streamType: Type;
    streamPosition: number;
    createdAt: Date;
    updatedAt?: Date;
  };
};

function fromStreamName<T extends StreamType>(
  streamName: StreamName<T>,
): StreamNameParts<T> {
  const parts = streamName.split(':') as [T, string];
  return {
    streamType: parts[0],
    streamId: parts[1],
  };
}

type StreamNameParts<T extends StreamType = StreamType> = {
  streamType: T;
  streamId: string;
};

interface EventStore {
  readStream(streamName: StreamName): Promise<ReadStreamResult>;

  appendToStream(
    streamName: StreamName,
    events: Event[],
    options?: AppendToStreamOptions,
  ): Promise<AppendToStreamResult>;
}

type ReadStreamResult = { currentStreamPosition: number; events: Event[] };

type AppendToStreamOptions = { expectedStreamPosition: number };
type AppendToStreamResult = { nextStreamPosition: number };

type CollectionPerStreamTypeStorageOptions = {
  type: 'COLLECTION_PER_STREAM_TYPE';
  databaseName?: string;
};

type SingleCollectionStorageOptions = {
  type: 'SINGLE_COLLECTION';
  collectionName?: string;
  databaseName?: string;
};

type CollectionResolution = {
  databaseName?: string;
  collectionName: string;
};

type CustomStorageOptions = {
  type: 'CUSTOM';
  collectionFor: <T extends StreamType>(streamType: T) => CollectionResolution;
};

type StorageOptions =
  | SingleCollectionStorageOptions
  | CollectionPerStreamTypeStorageOptions
  | CustomStorageOptions;

function resolveCollectionAndDatabase<T extends StreamType>(
  streamType: T,
  options: StorageOptions,
): CollectionResolution {
  switch (options.type) {
    case 'SINGLE_COLLECTION':
      return {
        collectionName: options.collectionName ?? defaultCollectionName,
        databaseName: options.databaseName,
      };

    case 'COLLECTION_PER_STREAM_TYPE':
      return {
        collectionName: streamType,
        databaseName:
          typeof options === 'object' ? options.databaseName : undefined,
      };

    case 'CUSTOM':
      return options.collectionFor(streamType);
  }
}

function collectionFor<T extends StreamType>(
  streamType: T,
  client: MongoClient,
  options: StorageOptions,
): Collection<Stream<T>> {
  const { collectionName, databaseName } = resolveCollectionAndDatabase(
    streamType,
    options,
  );

  const db = client.db(databaseName);

  return db.collection<Stream<T>>(collectionName);
}

const defaultCollectionName = 'streams';

type MongoDBEventStoreOptions = {
  client: MongoClient;
  storage: StorageOptions;
};

function getEventStore(options: MongoDBEventStoreOptions): EventStore {
  const { client, storage } = options;

  const appendToStream = async <T extends StreamType = StreamType>(
    streamName: StreamName<T>,
    events: Event[],
    options?: AppendToStreamOptions,
  ): Promise<AppendToStreamResult> => {
    const now = new Date();

    const { streamId, streamType } = fromStreamName(streamName);

    // Resolve collection
    const collection = collectionFor<T>(streamType, client, storage);

    let expectedStreamPosition: number;
    if (options?.expectedStreamPosition) {
      // 1.a. Use provided expected stream position, or...
      expectedStreamPosition = options.expectedStreamPosition;
    } else {
      // 1.b. Get the current stream version
      const currentStream = await collection.findOne<
        WithId<Pick<Stream<T>, 'metadata'>>
      >(
        { streamName: { $eq: streamName } },
        {
          // just reading the stream position
          projection: {
            'metadata.streamPosition': 1,
          },
        },
      );

      // and use it as the expected one
      expectedStreamPosition = currentStream?.metadata.streamPosition ?? 0;
    }

    const nextStreamPosition = expectedStreamPosition + events.length;

    // 3. Append events upserting the document
    const updatedStream = await collection.updateOne(
      {
        streamName: { $eq: streamName },
        'metadata.streamPosition': expectedStreamPosition,
      },
      {
        // append events
        $push: { events: { $each: events } },
        // set default metadata
        $setOnInsert: {
          streamName,
          'metadata.streamId': streamId,
          'metadata.streamType': streamType,
          'metadata.createdAt': now,
        },
        // update metadata
        $set: {
          'metadata.streamPosition': nextStreamPosition,
          'metadata.updatedAt': now,
        },
      },
      { upsert: true },
    );

    // 3. In case of expected version mismatch, throw an error
    if (updatedStream.upsertedCount === 0) {
      throw new Error(`Stream version doesn't match`);
    }

    return { nextStreamPosition };
  };

  const readStream = async <T extends StreamType = StreamType>(
    streamName: StreamName<T>,
  ): Promise<ReadStreamResult> => {
    const { streamType } = fromStreamName(streamName);

    // Resolve collection
    const collection = collectionFor<T>(streamType, client, storage);

    // Read events from the stream document
    const stream = await collection.findOne<
      WithId<Pick<Stream<T>, 'events' | 'metadata'>>
    >(
      {
        streamName: { $eq: streamName },
      },
      {
        // just reading events
        projection: {
          events: 1,
          'metadata.streamPosition': 1,
        },
      },
    );
    return {
      events: stream?.events ?? [],
      currentStreamPosition: stream?.metadata.streamPosition ?? 0,
    };
  };

  return {
    appendToStream,
    readStream,
  };
}
