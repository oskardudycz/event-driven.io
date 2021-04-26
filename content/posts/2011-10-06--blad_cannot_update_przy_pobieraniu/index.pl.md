---
title: Błąd "Cannot update a parent row a foreign key constraint fails" przy pobieraniu rekordów w NHibernate
category: ".NET"
cover: 2011-10-06-cover.png
author: oskar dudycz
disqusId: 32 http://oskar-dudycz.pl/2011/10/06/bad-cannot-update-przy-pobieraniu/
---

![cover](2011-10-06-cover.png)

Dzisiaj kolejny krótki wpis, ponownie dotyczący NHibernate'a.

Jak pewnie zdążyliście zauważyć jest to coś co ostatnio sprawia mi najwięcej problemów.

Próbując pobrać rekordy przy pomocy zwykłego selecta zawężonego o kryteria w NHibernate, otrzymałem zaskakujący błąd.

```
"Cannot update a parent row: a foreign key constraint fails"
```

Pierwsza moja myśl była: *"Pobieram rekordy, a on chce robić update? Jak to, zgłupiał?!"*.

Miałem klasę zdefiniowaną jako:

```csharp
public class KontoBankowe
{
    public virtual int    Id                 { get; set; }
    public virtual int    Oprocentowanie     { get; set; }
    public virtual int    IdBanku            { get; set; }
}
```

oraz mapowanie klasy jako:

```csharp
public class KontoBankoweMapowanie : ClassMap<KontoBankowe>
{
    public KontoBankoweMapowanie()
    {
        Table("KontoBankowe");
        Id(e => e.Id);
        Map(e => e.Oprocentowanie, "Nazwisko").Not.Nullable();
        Map(e => e.IdBanku , "IdBanku ");
    }
}
```

Widzicie już co jest źle? Jeżeli tak, to bardzo Wam gratuluję, bo mnie to chwilę zajęło.

Dla równie opornych na wiedzę jak ja, tłumaczenie:
1. Pobieramy wiersze konta bankowego.
2. Wśród rekordów mamy wiersze, które w kolumnie IdBanku mają nulle (tabela i mapowanie na to pozwalają).
3. Po pobraniu nulla NHibernate ustawia wartość właściwości IdBanku klasy KontoBankowe jako domyślna wartość typu int, czyli 0.
4. Ponieważ encja pobrana przez nas jest różna od tej, która jest w bazie (0, zamiast null) to NHibernate przy wywołaniu metody Session.Flush() próbuje uaktualnić pobrany rekord. Nie istnieje, żaden bank o id równym 0, więc update wyrzuca błąd na kluczu obcym łączącym tabelę KontoBankowe z tabelą Bank.

Rozwiązanie problemu jest proste. Wystarczy w klasie KontoBankowe ustawić pole IdBanku jako *int ?*. Po poprawkach klasa będzie wyglądała:

```csharp
public class KontoBankowe
{
    public virtual int    Id                 { get; set; }
    public virtual int    Oprocentowanie     { get; set; }
    public virtual int ?  IdBanku            { get; set; }
}
```

Do zapamiętania: Zawsze sprawdzać czy ustalone pole jako nullable jest typem, który może przyjąć wartości null (ze szczególnym uwzględnieniem typów prostych i struktur).