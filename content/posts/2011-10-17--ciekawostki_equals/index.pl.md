---
title: Ciekawostki - Equals
category: ".NET"
cover: 2011-10-17-cover.png
author: oskar dudycz
disqusId: 31 http://oskar-dudycz.pl/2011/10/17/ciekawostki-cz-1/
---

![cover](2011-10-17-cover.png)

 Dzisiaj będę się chwalił się swoją niewiedzą. Kilka dni temu kolega zadał mi pytanie, którym skutecznie mnie zagiął. Ponieważ uważam, że głupotą nie jest brak wiedzy co raczej udawanie, że się ją posiada, czym prędzej się Wam tym pytaniem chwalę. 

Co zostanie wyświetlone po takim kodzie i dlaczego? 

```csharp
string string1 = "Test";

string string2 = string1;
string string3 = "Test";

Console.WriteLine(Equals(string1, string2)); // 1.
Console.WriteLine(Equals(string1, string3)); // 2.
Console.WriteLine(ReferenceEquals(string1, string2)); //3.
Console.WriteLine(ReferenceEquals(string1, string3)); //4.
```

## Odpowiedź

Pierwsze i drugie porównanie pokażą oczywiście true - Equals porównujący stringi o tej samej wartości zawsze pokaże true

Drugi i trzeci pokażą również true - tutaj był mój błąd. Uznałem, że skoro string nie jest typem referencyjnym to przy przepisaniu skopiuje on wartość, a nie przepisze referencję. W teorii tak powinno być, ale w tym momencie do gry wchodzi Optymalizator Kompilacji. Ten byt czuwa nad tym, aby nasz program działał jak najszybciej maskując ile się da nasze błędy. W tym przypadku zauważył, że nie ma sensu tworzyć nie wiadomo ile obiektów, skoro i tak string ma przeładowaną metodę Equals i operatoror porównywania. Zamiast generować kolejne obiekty poprzypinał on referencje do jednego obiektu.

Optymalizator jest na tyle sprytny, że potrafi się obronić przed takimi trikami:

```csharp
string string4 = string1 + String.Empty;

Console.WriteLine(ReferenceEquals(string1, string4));
```

Dla powyższego kodu również wyświetli *true*.

Dopiero coś takiego potrafi go wprawić w konsternację i każe mu wyświetlić upragniony *false*:

```csharp
string string5 = (string3 + "a").Replace("a", String.Empty);

Console.WriteLine(ReferenceEquals(string1, string5));
```
