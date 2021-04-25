---
title: Multiplatforomowe aplikacje w .NET, Silverlight i Windows Phone Cz.3 – Konfiguracja komunikacji socketami
category: ".NET"
cover: 2012-02-05-cover.png
author: oskar dudycz
disqusId: 22 http://oskar-dudycz.pl/2012/02/05/multiplatforomowe-aplikacje-w-net_05/
---

![cover](2012-02-05-cover.png)

## Wstęp

W poprzednich dwóch wpisach, przedstawiłem ogólne zasady tworzenia aplikacji multiplatformowych, pokazałem jak można zapisywać i odczytywać dane z socketów. Oparłem się przy tym mocno na [przykładzie Johna Papa](http://channel9.msdn.com/Shows/SilverlightTV/Silverlight-TV-70-Sockets-Unplugged). W tym przykładzie pójdę dalej tym tropem i pokażę jak można uruchomić komunikację klient serwer. Jak sprawić, żeby sockety zaczęły nasłuchiwać i ze sobą rozmawiać.

## Odczyt/zapis socketa

W poprzednim wpisie przedstawiłem dwie klasy do odczytywania poleceń przesyłanych przez sockety (kody źródłowe dostępne są [tutaj](http://joomanji.no-ip.org/blog/multiplatform02.zip)), Ponieważ nasze sockety będą miały komunikować się dwustronnie dla uproszczenia sprawy wprowadźmy jeszcze dodatkową klasę opakowującą CommandReaderWriter.

```csharp
public class CommandReaderWriter
{
    public Socket Socket { get; protected set; }
    public delegate void OnConnectedDelegate(object sender, SocketAsyncEventArgs e);

    public event OnConnectedDelegate OnConnectedEvent = delegate { };

    public CommandReader Reader { get; protected set; }
    public CommandWriter Writer { get; protected set; }

    public CommandReaderWriter()
    {

    }

    public CommandReaderWriter(Socket socket)
    {
        InitializeConnection(socket);
    }

    /// <summary>
    /// Metoda inicjująca połączenie z konkretnym socketem
    /// </summary>
    /// <param name="socket"></param>
    public void InitializeConnection(Socket socket)
    {
        Reader = new CommandReader(socket);
        Writer = new CommandWriter(socket);
    }

    /// <summary>
    /// Metoda inicjująca połączenie z socketem
    /// znajdującym się pod wskazany adresem i portem
    /// </summary>
    /// <param name="serverName">adres serwera</param>
    /// <param name="port">port</param>
    public void InitializeConnection(string serverName, int port)
    {
        var s = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        var e = new SocketAsyncEventArgs
                {
                    RemoteEndPoint = new DnsEndPoint(serverName, port)
                };
        e.Completed += OnConnected;
        s.ConnectAsync(e);
    }

    /// <summary>
    /// Metoda obsługująca zdarzenie połączenia się z socketem
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    private void OnConnected(object sender, SocketAsyncEventArgs e)
    {
        Socket s = (Socket)sender;
        if (e.SocketError != SocketError.Success)
        {
            throw new Exception("Nie udało się połączyć!");
        }

        InitializeConnection(s);

        OnConnectedEvent(this, e);
    }

    /// <summary>
    /// Metoda zakańczająca nasłuchiwanie socketu
    /// </summary>
    public void StopReading()
    {
        Reader.StopReading();
    }

    /// <summary>
    /// Metoda rozpoczynająca nasłuchiwanie socketu
    /// </summary>
    /// <param name="h"></param>
    public void StartListening(ICommandHandler h)
    {
        Reader.StartListening(h);
    }

    /// <summary>
    /// Metoda wysyłająca polecenie poprzez socket
    /// przekazany w konstruktorze
    /// </summary>
    /// <param name="command">polecenie</param>
    public void Write(Command command)
    {
        Writer.Write(command);
    }

    public void DoCommand(CommandReader r, Command cmd)
    {
        //tutaj dodana zostanie obsługi polecenia
    }
}
```
Klasa ta oprócz opakowania metod CommandReader i CommandWriter posiada też metody odpowiedzialne za jego inicjalizację. Ta z adresem i numerem portu powinna być używana przez aplikację kliencką, ta z Socketem w aplikacji serwerowej.

Mamy już tak naprawdę komplet klas, które pozwolą nam na odczytywanie i zapisywanie z socketów. Musimy teraz utworzyć klasy, które je nam wywołają.

## Konfiguracja klienta

Zacznijmy od sprawy prostszej – konfiguracji klienta. Otwórzmy definicję głównego okna aplikacji Multiplatform.Client.Silverlight – MainPage.xaml.cs i zmodyfikujmy je następująco:

```csharp
public partial class MainPage : UserControl, ICommandHandler
{
    private CommandReaderWriter _commandReaderWriter;

    public MainPage()
    {
        InitializeComponent();

        InitializeNetworkConnection();
    }

    /// <summary>
    /// Metoda inicjująca połączenie z serwerem
    /// </summary>
    private void InitializeNetworkConnection()
    {
        _commandReaderWriter = new CommandReaderWriter();
        _commandReaderWriter.InitializeConnection("localhost", 4529);
        _commandReaderWriter.OnConnectedEvent += CommandReaderWriter_OnConnectedEvent;
    }

    /// <summary>
    /// Metoda przechwytująca zdarzenie połączenia z serwerem
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    void CommandReaderWriter_OnConnectedEvent(object sender, SocketAsyncEventArgs e)
    {
        //skoro udało się połączyć, to rozpocznij nasłuchiwanie
        _commandReaderWriter.StartListening(this);
    }

    public void DoCommand(CommandReader r, Command cmd)
    {
        //tutaj będzie obsługa poleceń
    }
}
```

Dodaliśmy do niego zainicjowanie połączenia z serwerem poprzez podanie adresu oraz numeru portu, na którym będziemy nasłuchiwać. Klasa ta implementuje również interfejs ICommandHandler, dzięki czemu może obsługiwać polecenia wysłane przez serwer.

Dokładnie to samo moglibyśmy zrobić w przypadku MainWindow aplikacji WPF oraz MainPage w aplikacji na Phone'a, z małym wyjątkiem w przypadku tego ostatniego. Nie możemy podać jako adres serwera "localhost", gdyż emulator telefonu potraktuje to jako odwołanie się do siebie, a nie do naszego komputera. Możemy to łatwo obejść wpisując zamiast "localhost" nazwę sieciową naszego komputera. Należy uważać też na numer portu, ale o tym szerzej w kolejnym punkcie.

## Konfiguracja serwera

Serwer w swoim zachowaniu będzie zbliżony do klienta, poza tym, że będzie musiał rozpocząć nasłuchiwanie na połączenie z klientem, a nie łączyć się bezpośrednio z nim. Utwórzmy nowy katalog solucji "Server" oraz nowy projekt "Multiplatform.Server" typu "Class Library". Dodajmy klasę ServerProgram – będzie ona odpowiadała za rozpoczęcie nasłuchiwania oraz obsługę poleceń od klienta. Powinna ona wyglądać następująco:

```csharp
public class ServerProgram : ICommandHandler
{
    readonly TcpListener _server = new TcpListener(IPAddress.Any, 4529);

    private CommandReaderWriter _commandReaderWriter;

    void Run()
    {
        _server.Start();
        while (true)
        {
            Socket s = _server.AcceptSocket();

            _commandReaderWriter = new CommandReaderWriter(s);
            _commandReaderWriter.StartListening(this);
        }
    }

    /// <summary>
    /// Statyczna metoda tworząca nową instancję serwera
    /// </summary>
    public static void Start()
    {
        Console.WriteLine("Starting PictureHunt Server on port 4529");
        var p = new ServerProgram();
        p.Run();
    }

    /// <summary>
    /// Metoda obsługująca polecenie od klienta
    /// </summary>
    /// <param name="r"></param>
    /// <param name="cmd"></param>
    public void DoCommand(CommandReader r, Command cmd)
    {
        //tutaj będziemy obsługiwać polecenie
    }
}
```

Utwórzmy jeszcze projekt Multiplatform.Server.Host w katalogu solucji Server, który będzie uruchamiał metodę Start naszego Servera w swojej metodzie Main (oszczędzę sobie trudu wklejania, a Wam czytania tej jakże zawiłej klasy).

## Wprawiamy to wszystko w ruch

Mamy już zatem 3 rodzaje klientów – WPF, Silverlight, Phone oraz serwer. Co prawda jest to póki co dosyć oszukany serwer bo może obsłużyć, ale zawsze… 

Wypadało by teraz zrobić jakąś własną komendę, dzięki której będziemy mogli przetestować czy nasz szkielet, ma już mięśnie, czy dalej odmawia uczynienia choćby małego ruchu. Zróbmy klasę we współdzielonym projekcie TextCommand, będzie ona pozwalała na przesłanie tekstu.

```csharp
public class TextCommand : Command
{
    public string Text { get; set; }

    public TextCommand()
    {
        CommandType = 1;
    }

    public TextCommand(string text) : this()
    {
        Text = text;

        // tutaj powinna być serializacja binarna
        // obiektu Text i przypisanie do tablicy Data
    }
}
```

Jak widzimy jest to bardzo prosta klasa. Dziedziczy po klasie Command, ma konstruktor domyślny oraz przyjmujący parametr z tekstem, który chcemy przesłać. Na pewno was zastanawia dlaczego nie zrobiłem tutaj standardowej serializacji przy pomocy BinaryFormattera. Otóż nie mogłem tego zrobić, bo z nieznanych mi powodów w Silverlight tej klasy nie ma. Można kombinować i robić [hacki stosując serializację WCFową](http://www.eggheadcafe.com/tutorials/xaml/96487d4c-d92f-4ca5-85b7-0fef6f42d6c3/silverlight-binary-serialization-and-compression-with-wcf-services.aspx), ja jednak polecam użycie Open Source'owej biblioteki [SharpSerializer](http://www.sharpserializer.com/en/index.html). Pozwala ona na całkiem sprawną i szybką serializację zarówno w zwykłych projektach .NETowych jak i Silverlight, Windows Phone.

Po pobraniu i dołączeniu plików dll do projektów dodajmy klasę opakowującą do dla tej biblioteki.

```csharp
public static class BinaryUtils
{
    private static readonly SharpSerializer SharpSerializer = new SharpSerializer(true);

    public static byte[] Serialize(object obj)
    {
        using (var memoryStream = new MemoryStream())
        {
            SharpSerializer.Serialize(obj, memoryStream);

            return memoryStream.GetBuffer();
        }
    }

    public static object Deserialize(byte[] bytes)
    {
        using (var memoryStream = new MemoryStream(bytes))
        {
            return SharpSerializer.Deserialize(memoryStream);
        }
    }
}
```

Jak widać, użycie biblioteki jest banalnie proste, nie wymaga specjalnego tłumaczenia. Mając to już gotowe, możemy dodać serializację tekstu w konstruktorze naszej klasy TextCommand. Ostatecznie wygląda on:

```csharp
public TextCommand(string text) : this()
{
    Text = text;

    Data = BinaryUtils.Serialize(Text);
}
```

Dodajmy więc prostą funkcjonalność przesyłania tej komendy pomiędzy klientem a serwerem i odwrotnie. Klient po nawiązaniu połączenia wyśle wiadomość "Ping", serwer mu odpowie wiadomością "Pong". Musimy dokonać zmian w obsłudze Poleceń zarówno po stronie klienckiej ja i stronie serwerowej.

Klasa okna klienta wyglądało będzie po zmianach:

```csharp
public partial class MainWindow : Window, ICommandHandler
{
    private CommandReaderWriter _commandReaderWriter;

    public MainWindow()
    {
        InitializeComponent();

        InitializeNetworkConnection();
    }

    /// <summary>
    /// Metoda inicjująca połączenie z serwerem
    /// </summary>
    private void InitializeNetworkConnection()
    {
        _commandReaderWriter = new CommandReaderWriter();
        _commandReaderWriter.InitializeConnection("localhost", 4529);
        _commandReaderWriter.OnConnectedEvent += CommandReaderWriter_OnConnectedEvent;
    }

    /// <summary>
    /// Metoda przechwytująca zdarzenie połączenia z serwerem
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    void CommandReaderWriter_OnConnectedEvent(object sender, SocketAsyncEventArgs e)
    {
        //skoro udało się połączyć, to rozpocznij nasłuchiwanie
        _commandReaderWriter.StartListening(this);
        _commandReaderWriter.Write(new TextCommand("Ping!")); // 1.
    }

    public void DoCommand(CommandReader r, Command cmd)
    {
        switch (cmd.CommandType)
        {
            case 1:
                string text = (string)BinaryUtils.Deserialize(cmd.Data); //2
                Debug.WriteLine(text);
                break;
        }
    }
}
```

Dodałem przesłanie polecenia z tekstem po nawiązaniu połączenia z serwerem (oznaczone numerem 1) oraz przechwycenie polecenia z serwera i obsłużenie go (oznaczone numerem 2). Analogicznie klasa serwera po zmianach będzie wyglądała:

```csharp
public class ServerProgram : ICommandHandler
{
    readonly TcpListener _server = new TcpListener(IPAddress.Any, 4529);

    private CommandReaderWriter _commandReaderWriter;

    void Run()
    {
        _server.Start();
        while (true)
        {
            Socket s = _server.AcceptSocket();

            _commandReaderWriter = new CommandReaderWriter(s);
            _commandReaderWriter.StartListening(this);
        }
    }

    /// <summary>
    /// Statyczna metoda tworząca nową instancję serwera
    /// </summary>
    public static void Start()
    {
        Console.WriteLine("Starting PictureHunt Server on port 4529");
        var p = new ServerProgram();
        p.Run();
    }

    /// <summary>
    /// Metoda obsługująca polecenie od klienta
    /// </summary>
    /// <param name="r"></param>
    /// <param name="cmd"></param>
    public void DoCommand(CommandReader r, Command cmd)
    {
        switch (cmd.CommandType)
        {
            case 1:
                string text = (string)BinaryUtils.Deserialize(cmd.Data);
                Console.WriteLine(text);
                //odpowiedz klientowi "Pong!"
                _commandReaderWriter.Write(new TextCommand("Pong!"));
                break;
        }
    }
}
```

Pozostało nam tylko dodać jeszcze obsługę naszego polecenia w CommandReaderze w metodzie TransformData.

```csharp
private void TransformData(SocketAsyncEventArgs e)
{
    // (...)
    while (data.Length >= 12)
    {
        // (...)

        //zainicjuj obiekt polecenia
        Command cmd = null;
        switch (opcode)
        {
            case 1:
                cmd = new TextCommand {Data = newData};
                break;
            default:
                cmd = new Command{Data = newData};
                break;
        }

        // (...)
    }
}
```
Możecie śmiało odpalić serwer, i jedną z aplikacji klienckich, wszędzie zadziała dobrze oprócz Silverlighta. Dlaczego? Wytłumaczenie znajdziecie w kolejnym punkcie…

## Silverlight i Sockety

 Silverlight jako chyba najbardziej irytująca technologia Microsoftu i tutaj musi utrudniać programistom życie. Oczywiście celem jest dobro i bezpieczeństwo użytkowników końcowych. Ja jednak nie do końca ufam i nie do końca wierzę tym tłumaczeniom, skoro w Windows Phone nie ma już takich utrudnień związanych z socketami.

Szczegółowo można przeczytać na ten temat w artykule [Network Security Access Restrictions in Silverlight na MSDN](http://msdn.microsoft.com/en-us/library/cc645032%28VS.95%29.aspx) – ja postaram się to skrócić w kilku zdaniach. Aby zachować bezpieczeństwo i wygodę użytkowników w Silverlight można łączyć się z Socketami tylko z zakresu 4502-4534. Dodatkowo aplikacja Silverlightowa łącząca się z serwerem na zadanym adresie i zadanym porcie najpierw próbuje połączyć się z tym adresem z portem 943. Oczekuje, że na tym porcie będzie wystawiona usługa, która mu dostarczy plik xml z informacjami o zasadach bezpieczeństwa (tzw. "policy file").

Jeżeli nie odnajdzie tej usługi i nie pobierze tego pliku, to automatycznie ignoruje połączenie uznając, że jest ono niebezpieczne. Wszystko dla naszego dobra, oczywiście.

Nie będę tutaj wklejał tego kodu, jest on dostępny w przedstawionym wcześniej artykule, oraz w kodach źródłowych na końcu artykułu. Należy pamiętać, żeby usługa ta była zawsze uruchomiona na tym samym adresie co nasz serwer.

## Podsumowanie

W tym artykule pokazałem już jak wprawić w ruch machinę komunikacji socketami pomiędzy klientem a serwerem i serwerem a klientem. W kolejnych artykułach przedstawię jak zrobić serwer obsługujący wielu użytkowników oraz jak ukryć za fasadą tą niezbyt elegancką obsługę komend.

Kody źródłowe możecie pobrać [stąd](http://joomanji.no-ip.org/blog/Multiplatform03.zip). 