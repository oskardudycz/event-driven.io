---
title: Jak zacząć z Open Source?
category: "Open Source"
cover: 2020-10-01-cover.png
author: oskar dudycz
disqusId: 1154 https://oskar-dudycz.pl/?p=1154
---

![cover](2020-10-01-cover.png)

Cześć!

Zaczyna się [HactoberFest](https://hacktoberfest.digitalocean.com/), więc kiedy jak nie teraz zacząć swoją przygodę z Open Source?

Jak pewnie wiesz działam trochę w tym temacie. Od około dwóch lat jestem "maintainerem" całkiem dojrzałej i względnie popularnej biblioteki .NET – [Marten](https://martendb.io/). Pozwala ona zamienić Postgres w bazę dokumentową.

Jak do tego doszło? Mógłbym powiedzieć najprościej: normalnie. Przeszedłem drogę od użytkownika, przez kontrybutora, aż do maintainera. A jak konkretnie?

1. **Użytkownik** – 4 lata temu zacząłem pracować nad modułem finansowym, kolega powiedział, żebym spróbował zrobić go w **Event Sourcing** z racji, że ważna jest audytowalność, dokładna analiza itd. Zaproponował użycie [Martena](https://martendb.io/). Pierwsze zderzenie było trudne. Miałem podstawy teoretyczne, ale teoria, teorią, praktyka swoje. Sam [Marten](https://martendb.io/) nie miał wtedy jeszcze wybitnej dokumentacji (teraz uważam, że ma bardzo przyzwoitą). To co mnie motywowało, żeby dać szansę tej bibliotece to osoba [Jeremy'ego D. Millera](https://twitter.com/jeremydmiller) – weterana Open Source – twórcy m.in. Structure Map.
2. **Pierwszy PR** – pracując z Martenem, pewnych rzeczy zaczęło mi brakować, więc stwierdziłem, "czemu nie – spróbuję! Sam dorzucę zmiany." – no i wyjechałem z mega grubym PRem na początek https://github.com/JasperFx/marten/pull/841. Nie było  to najbardziej rozważne posunięcie. To tak jak wejście z buta do salonu w amerykańskim westernie. Na szczęście nieco się przygotowałem, bo zrobiłem dobry opis PRa, po dłuższej dyskusji, byciu asertywnym udało mi się mieć wmerdżowany PR do projektu Open Source! [Jeeej!](http://home.spsostrov.cz/~ettlja/cviceni/obr/giphy.gif)
3. **Kontrybutor** – po pierwszym PR już poszło z górki. Dorzucałem kolejne PRy (niekoniecznie takie wielkie, ale zdarzały się i większe). Dołączyłem do [kanału Martena na gitter](https://gitter.im/JasperFx/marten). Okazało się, że ludzie zadają pytania i mają takie problemy z jakimi sam się ścierałem. Zacząłem podrzucać swoje rozwiązania – pomagać. Wrosłem w tę społeczność. Ta społeczność jest też wg mnie jedną z największych wartości [Martena](https://martendb.io/). Ludzie są życzliwi, otwarci i pomocni co jest bardzo ważne.
4. **Maintainer** – jakieś dwa lata temu Jeremy doszedł do wniosku, że sam nie będzie w stanie wszystkiego samemu ogarniać, widząc też zaangażowanie [Babu](https://twitter.com/mysticmindB), [Joona-Pekka](https://joonapekka.fi/) oraz mnie niżej podpisanego – zaprosił nas do zostania maintainerami [Martena](https://martendb.io/). Dla mnie to było wielkie wyróżnienie. Jeeej! Ale też odpowiedzialność. Będąc kontrybutorem sam wybierałem sobie to co dla mnie ciekawe i czym się zajmę. Będąc maintainerem muszę bardziej skupiać się na tym czego potrzebują inni użytkownicy. Czyli jak w każdym projekcie – bugfixing, tłumaczenie, objaśnianie, analiza pull requestów. Trzeba być konsekwentnym i dobrze trzymać balans, żeby się nie zagrzebać.

Jakie mam zatem **porady na start** pracy z **Open Source**?

1. **Zacznij od czegoś małego.** Nie wjeżdżaj z buta jak ja. Ryzykujesz wtedy, że spotkasz się z postawą defensywną u maintainerów lub po prostu nie trafisz w konwencję repozytorium. Dobrze opisz swój PR, nie wrzucaj po prostu samego kodu. Najlepiej to zgłoś issue i dodaj, że chętnie zrobisz PRa i poproś o wskazówki. Maintainerzy naprawdę uwielbiają małe, drobne zmiany, szczególnie do dokumentacji np. [takie](https://github.com/JasperFx/marten/pull/1344). Zaczynając w ten sposób możesz nawet zostać [kontrybutorem .NET core](https://github.com/dotnet/corefx/pull/37611). Na większe rzeczy przyjdzie czas. Nie wiesz co dorzucić? Przeszukaj kod frazą "TODO" – to są dobrzy kandydaci do rozpoczęcia. Często też sami maintainerzy wrzucają labelkę "Up for grabs" czy inną wskazującą na coś co może być dobrym startem.
2. **Dołącz do społeczności** – każda poważna biblioteka ma jakiś swój kanał komunikacji – czy to slack, czy to gitter czy lista mailingowa. Dołącz do niej, sprawdź jak ludzie ze sobą się komunikują, jak się do siebie odnosza, czy to na pewno jest miejsce gdzie chcesz być. Po takim kanale możesz też ocenić czy społeczność żyje, wtedy jest też większa szansa że biblioteka jest utrzymywana.
3. **Pomagaj** – Open Source jak nazwa wskazuje polega na O T W A R T O Ś C I. Pytaj, radź się, ale też pomagaj. Nawet jeśli nie uważasz się za eksperta to Twoja porada może okazać się dla kogoś cenna. Nie bój się, że ktoś Ci powie, że się nie znasz. Nawet jeśli Twoja porada nie będzie optymalna i ktoś ją skrytykuje to przynajmniej dowiesz się czegoś nowego. Skonfrontujesz swoje myslenie.
4. **Nie bądź roszczeniowy** – pamiętaj, że po drugiej stronie jest człowiek, który robi to zwykle ze swojej pasji i kosztem innych rzeczy. Widzisz, że czegoś brakuje? Dorzuć, zaproponuj.

Chcesz utworzyć **swoją bibliotekę Open Source**?

1. **Zrób coś co ma wartość dla Ciebie** – nie wymyślaj jakiegoś Wunderwaffe. Przemyśl jaki Ty masz problem i go rozwiąż.
2. **Dowoź etapami** – nie rozgrzebuj wielkiej funkcjonalności na branchu, ryzykujesz, że nigdy tego nie skończysz. Podziel to na mniejsze fragmenty i dowoź. Nie ma nic bardziej motywującego niż skończenie czegoś
3. **Zadbaj o dokumentację** – zapewniam Cię, że bez tego nikt Twojej biblioteki nie będzie używał. To wcale nie jest takie trudne – np. Github daje możliwość automatycznego generowania dokumentacji na podstawie plików md przy pomocy [Jekyll](https://docs.github.com/en/free-pro-team@latest/github/working-with-github-pages/setting-up-a-github-pages-site-with-jekyll). Zrób co najmniej porządne README
4. **Utwórz podstawowy flow CI/CD** – jest bardzo dużo narzędzi, które dają możliwość ekspresowego skonfigurowania darmowego procesu CI dla projektów Open Source: [Azure DevOps](https://azure.microsoft.com/pl-pl/services/devops/), [AppVeyor](https://www.appveyor.com/), [Github Actions](https://github.com/features/actions), [Travis](https://travis-ci.org/), itd. Nie rób nie wiadomo jak skomplikowanego od razu, ale niech chociaż upewni się, że projekt się buduje i testy są odpalone. To jest bardzo ważne też dla potencjalnych kontrybutorów. Nic tak nie odstręcza jak niebudujący się projekt, albo konieczność zrobienia Mambo Jumbo, żeby zacząć pracę nad kodem.
5. **Dbaj o kompatybilność wsteczną** – to jeden z ważniejszych elementów tworzenia bibliotek. Stabilność i przewidywalność API jest bardzo ważna. Jeśli co chwilę będziesz wrzucać Breaking Change, to użytkownicy albo nie będą się przenosić do nowszych wersji, albo po prostu zrezygnują. Stosuj zasady [Semantic Versioning](https://semver.org/). Niestety wymaga to jednej rzeczy – myślenia przed implementacją.Tak aby nie wypuszczać niczego co potem będziesz żałować.  Przeczytaj również więcej w moim artykule ["Let's take care of ourselves! Thoughts on compatibility"](https://event-driven.io/en/lets_take_care_of_ourselves_thoughts_about_comptibility/).
6. **Less is more** – skup się na małych rzeczach, dowieź mniej, ale lepiej. Dotyczy też to detali technicznych – udostępniaj tylko to co chcesz, żeby użytkownicy używali. Jeśli niechcący udostępnisz klasę jako publiczną, to potem jak będziesz chciał ją wywalić możesz się zdziwić jak dużo użytkowników jej używa i jak dziwne rzeczy z nią robią.

No i już na koniec 2 pytania które już słyszałem kilka razy:

1. **_"Ile dostajesz za pracę nad Martenem/Open Source?"_** – Pieniędzy? Okrągłe zero. Niedawno dostałem od JetBrains licencję na ich produkty na swoją działalność Open Source – i to była jedyna materialna korzyść jaką z tego odniosłem. Niestety brutalna rzeczywistość pokazuje, że jest to filantropia. Robisz coś za darmo, a inni tego używają, często i zarabiają. Temat "Open Source Sustainability" to szeroki temat, nawet na osobny mail lub wpis na blogu (jeśli chcesz, żebym o tym napisał daj znać!). Póki co zerknij np. na [kontrowersje z licencją Redis](https://www.wired.com/story/when-open-source-software-comes-with-catches), dyskusję o tym jak [twórca jednego z głównych pakietów npm zaczął prosić o wsparcie](https://github.com/zloirock/core-js/issues/548). Są takie inicjatywy jak [Open Collective](https://opencollective.com/), [Github Sponsors](https://github.com/sponsors), [Patreon](https://www.patreon.com/), niektóre projekty są sponsorowane, ale póki co model finansowy Open Source nie jest sprawiedliwy. Czy chciałbym zarabiać na swojej pracy Open Source? Oczywiście. **Czy zarabiam? Prawie nie. Dlaczego prawie? Bo założyłem sam swoje konta na:**

- Github sponsors – https://github.com/sponsors/oskardudycz
- Open Collective – https://opencollective.com/eventsourcingnetcore 

Nawet znalazło się kilkoro życzliwych osób, które doceniły moją pracę i przelały mi trochę pieniędzy, ale ciągle jest to bardzo dalekie od mozliwości traktowania tego jako źródło finansowania. Póki co jest to tylko i aż forma podziękowania za moją pracę – która mnie bardzo cieszy!
Czy mi to przeszkadza, że nie zarabiam? Nie, to moja pasja, cieszę się, że mogę pomagać, ale jednak fajnie by było to uczynić trochę bardziej zrównoważonym. Dlatego zanim zaczniesz działać Open Source – upewnij się, że to Ci odpowiada. Zachęcam do lektury świetnego wpisu temat tego, że Gwiazdki na Github Ci nie zapłacą raty kredytu: [link](https://medium.com/@kitze/github-stars-wont-pay-your-rent-8b348e12baed).

2. **_"Czy spotykasz się z hejtem?"_** – ja osobiście nie. Oczywiście zdarzają się osoby roszczeniowe, ale tak jak wspominałem – społeczność [Martena](https://martendb.io/) jest bardzo w porządku. Być może to specyfika samej biblioteki, pewnie też to, że nie jest to biblioteka z tysiącami/milionami użytkowników. Ja uważam, że jest też to owoci ciężkiej pracy, żeby taka była.

Na pewno jest w światku OSS sporo hejtu, zdarzają się sytuacje niezdrowe i "dramy" – jak np. ostatnie wydarzenie w społeczności React: [zerknij tutaj](http://oskardudycz.acemlnc.com/lt.php?notrack=1&s=202bb9ce08e2e3a9fd7cd790e4f5329f&i=6A8A1A51). Mnie osobiście póki co częściej spotykają takie sytuacje jak ta: [link](https://github.com/JasperFx/marten/issues/1347). Wtedy człowiek czuje, że warto. Chce się żyć!

**No i Hacktoberfest!**

Jeśli chcesz zacząć pracę z OSS to zachęcam Cię do udziału w moich repo:

- https://github.com/oskardudycz/WebApiWith.NETCore – jeśli chcesz podzielić się swoją wiedzą, lub nauczyć się czegoś o robieniu porządnego WebApi,
- https://github.com/oskardudycz/EventSourcing.NetCore – jeśli chcesz nauczyć się lub podzielić przez przykłady Event Sourcing, DDD i podobnych rzeczy,
- https://github.com/oskardudycz/GoldenEye – jeśli chcesz popracować nad framework, który ułatwia pracę z WebAPI, DDD itd.,
- https://github.com/JasperFx/marten – wiadomo Postgres jako baza dokumentowa i event store – dla ambitnych.

Jak można pomóc?

- dodać issue z tym co Ci brakuje, czego nie rozumiesz,
- dorzucenie lub poprawki do dokumentacji,
- nowe sample ,
- nowe feature,
- bugfix.

Najlepiej oczywiście przed większą zmianą odezwij się do mnie. Jeśli nie masz pomysłu, ale chcesz coś zrobić to również się odezwij.

Uf! Jeśli jesteś jeszcze ze mną to należy Ci się naklejka "Dzielny czytelnik"! Mam nadzieję, że zaciekawiłem Cię trochę i nie zmarnowałem Twojego czasu.


Dziękuję za lekturę i pozdrawiam!
Oskar

p.s. Jeśli rozważasz również blogowanie, spójrz na moje ["10 notatek z okazji 10tej rocznicy blogowania"](/pl/thoughts_on_tenth_blogging_anniversary). Chciałbym to wiedzieć, gdy startowałem!