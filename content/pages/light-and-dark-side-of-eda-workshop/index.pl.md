---
title: "Architektury oparte na zdarzeniach: ciemne i jasne strony"
description: Czterodniowy warsztat online w formule kohortowej o tym, jak przejść od wymagań biznesowych przez model procesu do działającego systemu opartego na zdarzeniach, z właściwymi gwarancjami dostarczenia, kolejności i spójności.
cover: workshop.jpg
---

**Architektury oparte na zdarzeniach pomagają odzwierciedlić proces biznesowy w kodzie i ułatwiają współpracę z biznesem. Mogą też ograniczyć zależności między częściami systemu, ale tylko wtedy, gdy system jest dobrze podzielony.**

**Bez dobrej pracy modelarskiej dostajemy zależności najgorszego rodzaju: ukryte.** Usługi wyglądają na niezależne, a mimo to zmiana w jednej psuje drugą.

Dobry model to jednak dopiero połowa pracy. Karteczki z EventStormingu nie powiedzą Ci, czy potrzebujesz kolejki ani co się stanie, gdy wiadomość przyjdzie dwa razy albo w złej kolejności.

Nie powiedzą Ci też, jak zmienić kontrakt, żeby nie zepsuć usługi innego zespołu. Zespół razem omawia proces biznesowy, a potem każda osoba wraca do kodu i sama decyduje, jak koordynować proces, jakiej kolejki użyć i jak zapewnić dostarczenie, kolejność, spójność oraz idempotentność. Skutki tych decyzji widać zwykle dopiero na produkcji, gdy wiadomości giną, dublują się albo są przetwarzane w złej kolejności.

Na szkoleniu przejdziemy całą drogę od wymagań biznesowych, przez model procesu i model techniczny, aż po implementację. Krok po kroku sprawdzimy, jak wymagania wpływają na rozwiązanie techniczne. Jak podzielić system, żeby zależności między jego częściami były jawne? Kiedy kolejka pomaga, a kiedy tylko komplikuje system? Jak zapewnić gwarancje, których naprawdę potrzebuje biznes? Jak testować przepływ i wykrywać niekompatybilne zmiany w kontraktach, zanim zauważy je inny zespół?

Przez całe szkolenie pracujemy nad jednym rozproszonym procesem biznesowym, od pierwszej karteczki po działający kod. Niektóre zagadnienia omawiamy też na mniejszych, osobnych przykładach.

**Nie będzie długich wykładów.** Będzie dużo małych zadań i praca w grupach. EventStorming i inne techniki modelowania nie są tu celem, tylko narzędziem do rozmowy o procesie i o tym, jak zamienić model w działający system. Uczestnicy wcześniejszych edycji najczęściej wskazywali właśnie to przejście, od EventStormingu do przykładów w kodzie, jako najbardziej przydatną część szkolenia.

Po drodze sprawdzimy też, w czym GenAI pomaga przy modelowaniu i implementacji, a gdzie jego wyniki trzeba dokładnie weryfikować.

![](./workshop.jpg)

**23 i 24 listopada oraz 30 listopada i 1 grudnia 2026 r., online, po angielsku, 3000 PLN + VAT.**

**[![Zapisz się!](./zapisz-sie.png)](https://forms.gle/YxfhZ9wUQetX9iue8)**

## Czego się nauczysz?

**Po warsztatach będziesz wiedzieć, jak:**
- rozumieć, czym naprawdę są architektury oparte na zdarzeniach, a czym nie są,
- pracować z wymaganiami i rozmawiać z biznesem tak, żeby zrozumieć proces, a nie tylko spisać listę funkcji,
- odkrywać domenę krok po kroku za pomocą EventStormingu i Example Mappingu, zamiast modelować wszystko od razu,
- modelować pełny przepływ procesu i wyznaczać w nim granice tak, żeby zależności między częściami systemu były jawne,
- patrzeć na proces raz z bliska, raz z daleka i skupiać się na tym, co w danej chwili najważniejsze,
- wskazywać na modelu problemy ze spójnością i współbieżnością oraz rozmawiać o nich,
- symulować działanie systemu na osiach czasu i przykładach, zanim powstanie kod,
- ocenić, czy potrzebujesz kolejki, a jeśli tak, to jakiej i z jakimi konsekwencjami,
- zapewnić dostarczenie wiadomości, właściwą kolejność i idempotentność, między innymi za pomocą wzorca Outbox,
- koordynować proces w kodzie za pomocą Sagi albo Process Managera,
- testować przepływy oparte na zdarzeniach i wykrywać niekompatybilne zmiany w kontraktach,
- wpasować rozwiązanie w architekturę aplikacji, na przykład w CQRS albo architekturę heksagonalną.

## Czy to szkolenie jest dla Ciebie?

**Tak, jeśli widzisz w swoim projekcie któryś z tych problemów:**
- po sesji EventStormingu zostaje pełna tablica, ale nikt nie wie, jak przełożyć ją na kod,
- kolejki trafiają do systemu, bo „tak się robi”, a nie dlatego, że ich potrzebujecie,
- usługi miały być niezależne, a każda większa zmiana wymaga wdrożenia kilku z nich naraz,
- wiadomości giną, dublują się albo przychodzą w innej kolejności, niż zakłada kod,
- zmiana w jednym zdarzeniu psuje usługę innego zespołu, a dowiadujecie się o tym na produkcji,
- rozmowy o gwarancjach dostarczenia i spójności kończą się na „jakoś to będzie” albo „Kafka to załatwi”,
- proces biznesowy jest rozbity na kilka usług i nikt nie widzi go w całości.

Szkolenie jest dla programistek i programistów, tech leadów oraz architektek i architektów, którzy projektują systemy oparte na zdarzeniach, zaczynają je budować albo muszą je utrzymywać. Ćwiczenia przygotowałem w Javie, TypeScripcie i C#, więc pracujesz w języku, który znasz.

**To nie jest szkolenie dla Ciebie**, jeśli szukasz kursu obsługi konkretnego brokera wiadomości albo wykładu z definicji.

## Zasady gry

**Szkolenie opiera się na praktyce, a nie na wykładach.** Teorię poznasz, rozwiązując zadania. Są krótkie i jest ich dużo. Każde kończy się dyskusją i decyzją, od której zaczynamy następne. Do większości problemów pokażę kilka rozwiązań, bo w architekturach opartych na zdarzeniach rzadko istnieje jedno słuszne.

- **Formuła kohortowa.** Spotykamy się przez dwa tygodnie, po dwa dni w każdym, od 9:00 do 15:00. Szkolenie jest intensywne i wymagające, więc przerwa między tygodniami daje Ci czas, żeby wszystko sobie poukładać i wrócić z pytaniami.
- **Grupa na Discordzie.** Przez całe szkolenie masz dostęp do grupy dla uczestników. Ja też tam jestem i odpowiadam na pytania na bieżąco.
- **Mała grupa, od 5 do 12 osób**, żebym mógł pracować z każdym zespołem. Szkolenie ruszy, gdy zapisze się co najmniej 5 osób.
- **Online, na Zoomie, po angielsku.** Modelujemy na wspólnej tablicy Miro. Szkolenie nie będzie nagrywane.
- **Po szkoleniu dostaniesz** repozytorium z kodem, dostęp do tablicy Miro z efektami naszej pracy, ebooka o modelowaniu przepływów opartych na zdarzeniach i materiały dodatkowe pogrupowane tematycznie.

**[![Zapisz się!](./zapisz-sie.png)](https://forms.gle/YxfhZ9wUQetX9iue8)**

![](./workshop-online.png)

## Agenda

**Dzień 1: Proces biznesowy**

1. Praca z wymaganiami i z biznesem: jak zrozumieć proces, a nie tylko spisać listę funkcji
2. EventStorming i Example Mapping: odkrywanie domeny krok po kroku i rozmowa o procesie
3. Proces jako punkt wyjścia do EDA: dobry model ułatwia implementację, a implementacja pokazuje, czego w modelu brakuje

**Dzień 2: Od procesu do modelu**

1. Modelowanie pełnego przepływu procesu
2. Wyznaczanie granic i koordynacja
3. Przybliżanie i oddalanie: jak skupić się na procesie, nad którym pracujesz, nie tracąc z oczu całości
4. Spójność i współbieżność na modelu: jak je pokazać i jak o nich dyskutować
5. Symulowanie działania systemu przed implementacją: Temporal Modelling i praca na przykładach

**Dzień 3: Implementacja**

1. Style implementacji procesów, w tym Saga i Process Manager
2. Gwarancje dostarczenia, kolejność i idempotentność w kodzie
3. Outbox i inne techniczne sposoby zachowania gwarancji
4. Rodzaje kolejek (RabbitMQ, Kafka, rozwiązania chmurowe i inne), konsekwencje ich wyboru i topologia

**Dzień 4: Niezawodność i architektura**

1. Testowanie przepływów opartych na zdarzeniach
2. Kontrakty i wykrywanie niekompatybilnych zmian
3. Osadzenie rozwiązania w architekturze: CQRS i architektura heksagonalna

## O mnie

![Oskar Dudycz](./oskar.png)

**Jestem niezależnym architektem i konsultantem. Projektuję i buduję systemy biznesowe od ponad 18 lat.** Pomagam zespołom projektować systemy oparte na zdarzeniach i prowadzę szkolenia z Event Sourcingu, CQRS i architektur opartych na zdarzeniach. Stosowałem te podejścia we własnych projektach. Widziałem, jak ułatwiają skalowanie i utrzymanie systemów, ale też gdzie przestają się opłacać.

Procesy biznesowe rzadko są proste do zrozumienia. Wiedza o nich jest rozproszona między wiele osób, a wymagania przychodzą we fragmentach. Architektury oparte na zdarzeniach pomagają je uporządkować i odzwierciedlić w kodzie. Nawet gdy uda się je dobrze zamodelować, trzeba jeszcze przełożyć model na architekturę i implementację, a to osobne wyzwanie. Na tym szkoleniu zajmujemy się jednym i drugim.

Problemy, o których mówię na szkoleniu, znam także od strony narzędzi. Stworzyłem [Emmetta](https://event-driven-io.github.io/emmett/), jestem jednym z maintainerów [Martena](https://martendb.io/) i współtworzyłem [EventStoreDB](https://developers.eventstore.com/). Na [GitHubie](https://github.com/oskardudycz/) udostępniam przykłady i ćwiczenia w .NET, Node.js i Javie.

O tematach szkolenia regularnie piszę na tym blogu i w newsletterze [Architecture Weekly](https://www.architecture-weekly.com/), na przykład o:
- [wzorcach Outbox i Inbox oraz gwarancjach dostarczenia](/pl/outbox_inbox_patterns_and_delivery_guarantees_explained/),
- [koordynacji procesów za pomocą Sagi i Process Managera](/pl/saga_process_manager_distributed_transactions/),
- [obsłudze zdarzeń przychodzących w nieznanej kolejności](/pl/strict_ordering_in_event_handling/) i [idempotentnej obsłudze komend](/pl/idempotent_command_handling/),
- [wersjonowaniu schematu zdarzeń](/pl/simple_events_versioning_patterns/) i [testowaniu kontraktów wiadomości](/pl/announcing-strictland-contract-testing/),
- [Example Mappingu](/pl/intro_to_example_mapping/).

## 📆 Terminy

**Tydzień 1:** 23 i 24 listopada 2026 r.

**Tydzień 2:** 30 listopada i 1 grudnia 2026 r.

Wszystkie sesje trwają od 9:00 do 15:00. Szkolenie prowadzę po angielsku.

**Koszt: 3000 PLN + VAT.**

Liczba miejsc: 12. Szkolenie ruszy, gdy zapisze się co najmniej 5 osób.

**[![Zapisz się!](./zapisz-sie.png)](https://forms.gle/YxfhZ9wUQetX9iue8)**

## Co zyskasz?

**Mniej zgadywania przy implementacji.** Z modelu procesu odczytasz, czy potrzebujesz kolejki, jakiej i z jakimi gwarancjami. Te decyzje zapadną na etapie projektu, a nie po pierwszej awarii.

**Mniej błędów, które wychodzą na jaw dopiero na produkcji.** Zgubione i zdublowane wiadomości, zła kolejność przetwarzania czy zepsute kontrakty między usługami rzadko widać w testach jednostkowych. Nauczysz się przewidywać je na modelu i wyłapywać w testach.

**Model, o którym porozmawiasz i z biznesem, i z zespołem.** Wynik EventStormingu staje się wspólnym źródłem wiedzy o procesie. Biznes widzi w nim swój proces, a zespół punkt wyjścia do implementacji.

**Argumenty zamiast opinii.** Na przeglądzie architektury wyjaśnisz, co zespół zyskuje, a co traci, wybierając konkretną kolejkę, styl koordynacji albo poziom spójności, zamiast mówić „tak się robi”.

**Łatwiej ocenisz, co wygenerowało AI.** Gdy wiesz, jakich gwarancji potrzebuje proces, wiesz też, gdzie w wygenerowanym kodzie szukać problemów.

**Zabierzesz ze sobą narzędzia, nie tylko notatki.** Kod z warsztatu i tablicę Miro możesz od razu wykorzystać we własnym projekcie i zespole.

**[![Zapisz się!](./zapisz-sie.png)](https://forms.gle/YxfhZ9wUQetX9iue8)**

## Referencje

Zobacz, co uczestnicy mówią o moich warsztatach:

![rekomendacja](./ro-08.png)

![rekomendacja](./rk-01.png)

![rekomendacja](./ro-06.png)

![rekomendacja](./rk-02.png)

![rekomendacja](./ro-05.png)

![rekomendacja](./rk-03.png)

![rekomendacja](./ro-04.png)

**To co, przekonałem Cię?**

**[![Zapisz się!](./zapisz-sie.png)](https://forms.gle/YxfhZ9wUQetX9iue8)**

## Najczęściej zadawane pytania

**Czy mogę dostać fakturę?**

Tak. Wystawiam faktury VAT, więc bez problemu rozliczysz szkolenie przez firmę.

**W jakim języku prowadzone jest szkolenie?**

Po angielsku. Nie musisz mówić bezbłędnie. Wystarczy, że swobodnie czytasz dokumentację i potrafisz się dogadać w dyskusji.

**Jakie doświadczenie jest potrzebne?**

Szkolenie przygotowałem z myślą o osobach na poziomie mid i senior. Jeśli masz już za sobą budowanie systemów, odnajdziesz się bez problemu.

**W jakim języku programowania będę pracować?**

Wybierasz jeden z trzech: Javę, TypeScript lub C#. Ćwiczenia przygotowałem w każdym z nich, więc pracujesz w tym, którego używasz na co dzień.

**Dlaczego szkolenie trwa dwa tygodnie, a nie cztery dni pod rząd?**

Materiału jest dużo, a uczestnicy wcześniejszych edycji mówili, że trzeba go sobie poukładać w głowie. Przerwa między tygodniami daje Ci na to czas. Pytania, które się pojawią, możesz zadać na Discordzie albo na początku drugiego tygodnia.

**Jak wygląda praca online?**

Spotykamy się na Zoomie, a modelujemy razem na wspólnej tablicy Miro. Większość czasu pracujesz w grupach, a ja zaglądam do nich, pomagam i odpowiadam na pytania.

**Czy szkolenie będzie nagrywane?**

Nie, ale zostanie Ci sporo materiałów, do których możesz wracać: repozytorium z kodem, tablica Miro, ebook i materiały dodatkowe.

**Ile osób weźmie udział?**

Od 5 do 12. To wystarczająco dużo, żeby pracować w grupach, i na tyle mało, żebym miał czas dla każdej osoby.

**Co się stanie, jeśli nie zbierze się 5 osób?**

Nic nie ryzykujesz. Płatności zbieram dopiero wtedy, gdy zapisze się co najmniej 5 osób. Gdyby szkolenie mimo to się nie odbyło, oddam całą kwotę.

**Kiedy i jak zapłacę?**

Najpierw się zapisujesz. Gdy potwierdzę, że grupa jest skompletowana, wyślę Ci dane do przelewu. Do tego czasu nic nie płacisz.

**Czy są zniżki, na przykład dla kilku osób z jednej firmy?**

Nie. Cena jest taka sama dla wszystkich, niezależnie od tego, czy zapisujesz tylko siebie, czy cały zespół.

**Czy mogę zrezygnować?**

Tak, jeśli coś losowego uniemożliwi Ci udział, na przykład choroba. Napisz do mnie, a jeśli powód będzie zasadny, zwrócę pieniądze.

**Czy dostanę zaświadczenie o ukończeniu szkolenia?**

Tak, dostaniesz je po szkoleniu.
