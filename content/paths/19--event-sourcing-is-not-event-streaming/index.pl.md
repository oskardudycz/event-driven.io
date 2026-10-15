---
title: Event Sourcing to nie Event Streaming
icon: 🌊
description: "Event Sourcing i event streaming to różne wzorce. Zobaczysz, czym się różnią i czemu wiele historii o trudnym Event Sourcingu dotyczy w praktyce Kafki."
cover: 2021-12-01-cover.png
articles:
  - event_streaming_is_not_event_sourcing
---

Event Sourcing i event streaming operują na zdarzeniach, więc łatwo je pomylić. W Event Sourcingu zdarzenia są stanem. Czytasz stream encji, odtwarzasz z niego aktualny stan, uruchamiasz logikę biznesową i dopisujesz nowe zdarzenia z kontrolą optymistycznej współbieżności. Narzędzia do streamingu, takie jak Kafka, przenoszą zdarzenia z miejsca na miejsce i takich gwarancji nie dają.

Artykuł odpowiada na popularny tekst „Don't Let the Internet Dupe You, Event Sourcing is Hard”. Pokazuje, że większość opisanych tam problemów, np. podejmowanie decyzji na nieaktualnych danych, bierze się z używania narzędzia do streamingu jako event store'a.

Jeśli dopiero zaczynasz, zacznij od [podstaw Event Sourcingu](/pl/guides/event-sourcing-foundations/).
