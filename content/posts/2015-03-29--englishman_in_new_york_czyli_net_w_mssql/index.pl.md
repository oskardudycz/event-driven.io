---
title: Englishman in New York, czyli jak .NETowiec może uwić sobie gniazdko w świecie MSSQL
category: "MSSQL"
cover: 2015-03-29-cover.png
author: oskar dudycz
disqusId: 12 http://oskar-dudycz.pl/2015/03/29/englishman-in-new-york-czyli-jak/
---

Wieczór, herbata, ciepłe papcie, nie za twardy, nie za miękki narożnik, na którym wyciągasz swoje zmęczone nogi. Gdzieś w tle leniwie snuje się muzyczka plum plum plum… Cieplutko, mięciutko, strefa komfortu. Mmmmm… Klawo!

Gdy tak sobie leżysz w apogeum czilałtu muzyka przestaje nagle grać, idąc sprawdzić o co chodzi zahaczasz nogą i wyrywasz kabel sieciowy, potem przepala Ci się bezpiecznik od światła, a z kranu zaczyna ciec woda. Tyle było twojego komfortu…

Jedziesz na tydzień na narty do Czech. Niby wszyscy mili, niby podobny język, ale jednak jakoś tak dziwnie. Uśmiechy wydają się coraz bardziej ukradkowe. Po złożeniu zamówienia w restauracji do ostatniej chwili drżysz czy faktycznie zamówiłeś to co chciałeś.

Albo dajmy na to delegacja do Wałbrzycha lub Sosnowca… 

![cover](welp_mssql.gif)

Praca programisty daleka  jest od błogostanu. Nowy dzień, nowe problemy. Pudełko czekoladek prosto od Foresta. Szczególną sytuacją jest zmiana projektu. Konsternacja sięga zenitu. Nowe osoby, nowe środowisko i te parszywe nowe technologie.

_"…you can hear it in my accent when I talk, I'm an Englishman in New York"_

Jakiś czas temu doświadczyłem takiej zmiany. Drastyyycznej zmiany. Z intensywnej pracy przy mocno JavaScriptowym systemie przeszedłem na drugą stronę. Ciemniejszą stronę. Tam gdzie nie ma frontendu – systemu Business Inteligence w MSSQL.

_"First I was afraid, I was petrified"_
 
Nie tylko Ty się tak czułaś moja droga [Glorio](https://www.youtube.com/watch?v=Faf1ch7Q9XE).

Suma wszystkich strachów.

Czego się obawiałem?

1. Management Studio jest przyzwoitym środowiskiem do zarządzania bazą danych. Z funkcjonalnościami i rozbudowaniem Visual Studio nie ma jednak żadnego porównania. Ot taki mniej rozgarnięty koleżka. Ten co nosi za duże, używane rzeczy po starszym bracie.
2. Skryptów inkrementalnych. Każdy z nas wie jak bolesne jest utrzymywanie tego barachła. Oczywiście można sobie radzić, stosować konwencje nazewnicze, używać migracji w Entity Framework, ale czy to czyni sprawę przyjemną? Don't think so… Znośniejszą. W najlepszym razie. Dodajmy jeszcze do tego konieczność utrzymywania aktualnej struktury bazy, by można było zawsze odtworzyć ją od zera, kontrolę wersji i pracę na wielu branchach. Mniam. Mniam. Paluszki lizać.
3. Wdrażania na różne środowiska. Developerskie, Testowe, Preprod, Produkcjne, NaKolejneZyczenieKlienta. I każde z tych środowisk się trochę różni, na każdym trzeba trochę inne skrypty odpalić. Kup sobie chłopcze zapas melisy jeśli chcesz być wdrożeniowcem, wujo Ci to mówi. Jeden Cherry pick, drugi cherry pick, zapomnisz przerzucić jeden skrypt inkrementalny i [KA BOOM!](https://i.imgur.com/XxCqMiG.gif) Nie ma Cię – ehę. Albo produkcji. Twoja premia też gdzieś się zapodziała.
4. Struktura i modularność projektu. Jak ładnie utrzymywać strukturę projektu w świecie MSSQL. Podział kodu, modularność, biblioteki, współdzielenie kodu przez różne projekty? Czy to w ogóle możliwe? Projekty w Management Studio, w porównaniu do tych znanych z VS to właśnie te spodnie starszego brata, które podcięto, żeby robiły za bojówki. Do tego kod się nie kompiluje, jak być pewnym, że po zmianie nazwy kolumny nie zapomnieliśmy poprawić kodu, w którejś procedurze? Jak być pewnym, że nasz projekt jest dalej stabilny?
5. No i na koniec duszki Kacperki w porównaniu z poprzednimi punktami. Czyli takie fanaberie jak intellisence, refactoring, sprawdzanie gdzie używana jest procedura, tabela, przystępniejsze debugowanie kodu. Małe rzeczy, które czynią nas szczęśliwszymi. 

## SSDT To the Rescue!

Cóż to za enigmatyczny skrót i jak on może nam pomóc? Otóż SSDT to nic innego jak SQL Server Data Tools. Jest to dodatek (czy też nakładka) do Visual Studio rozbudowująca jego możliwości w zakresie zarządzania, obsługi baz danych.

Czy rozwiewa którąś z moich obaw?

No wiadomo, że tak, przecież bym o nim nie wspominał…

No to jedziemy po kolei Panie Dzieju:

Ad.1 SSDT Pozwala robić dokładnie te same operacje co w Management Studio, nie każąc nam przy tym porzucać Visual Studio. Odpalanie zapytania, debuggowanie, operacje administacyjne. Możemy korzystajać przy tym z dobrodziejstw VS (choćby z tak prozaicznej rzeczy jak przyklejenie pliku zawsze na wierzchu – rzecz niewykonalna w Management Studio).

Ad. 2 i 3 SSDT oparty jest na deklaratywnym modelu programowania baz danych. Uh, jak to mądrze brzmi. Czy również takie jest? [Są różne opinie](http://latentflip.com/imperative-vs-declarative/).

Deklaratywne programowanie jest to mówienie, że chcemy żeby zadziała się pewna rzecz, a nie mówienie wprost jak ma być to zrobione. Różnica między deklaratywnym a imperatywnym, jest taka jak pomiędzy poleceniem "Wyrzuć śmieci", a "wyciągnij worek, zejdź po schodach, podejdź do śmietnika i wrzuć go do kontenera".

Jedno i drugie ma swoje plusy. Mówienie konkretnie co masz zrobić bywa lepsze, ale zakłada, że wydający polecenia zna się na tym lepiej niż je wykonujący. Niby może być idiotoodporne, ale i tak kończy się zawsze: "Dlaczego nie włożyłeś nowego worka?!".

Lub tym

![trash](trash_mssql.gif)

No dobra zapędziłem się. W teorii mogę teraz napisać wszystko, bo pewnie nikt już tego nie czyta… Gdyby jednak, to wracając do tematu, deklaratywne programowanie oznacza w tym wypadku, że przygotowujemy po prostu definicje obiektów (tabel, procedur, itd.), a Visual Studio robi za nas skrypty różnicowe w trakcie wywołania publikacji projektu. Porównuje, przygotowuje i uaktualnia.

Czy to działa? Zaskakujące, ale tak.

Ad. 4 SSDT dostarcza nam bazodawowe typy projektów. Możemy je referencjować między sobą, łączyć w solucje, mieszać z innymi typami projektów. Jest nawet coś w stylu bibliotek dll – pliki Dacpac. Możemy sobie zatem np. stworzyć projekty Common zawierający obiekty, które zawsze robimy tak samo (np. zarządzanie użytkownikami, logowanie, itd. itp) i dołączać je do swoich projektów.

Ad. 5 Tutaj też dostajemy sporo fajnych usprawnień tj. zmiana nazw obiektów w obrębie całej solucji, bardziej rozbudowany intellisense, debugowanie, wyszukiwanie referencji itd. itp.

Yay or nay?

Czy jest to rewolucja?

Nie bardzo.

Czy jest to coś co sprawi, że życie bazodanowca będzie bułką z szynką?

Też nie bardzo.

Czy jestem tak happy pracując z bazami danych jak Pharell Williams?
No też nie do końca.

Jestem jednak dużo szczęśliwszy niż mógłbym być pracując w inny sposób. SSDT pozwala znacząco zwiększyć komfort pracy, uporządkować, usystematyzować, poukładać sobie ładnie w szufladeczkach.

Deklaratywne programowanie i posiadanie zwykłego rodzaju projektów daje nam możliwość fajnej integracji z systemami kontroli wersji oraz zrobienia porządnego procesu Continuous Integration.

_"I don't drink coffee, I take tea, my dear. I like my toast done on one side"_

Hej hej! Mamy XXI wiek! Czas i w projektach bazodanowych się do niego zbliżyć!

Dziękuję za przeczytanie.

p.s. Przykłady? Pics or didn't happen? Stay tuned. Więcej pojawi się w kolejnych wpisach.

p.s.2 garść linków do mądrzejszych ludzi:

http://www.codeproject.com/Articles/462206/Introduction-to-SSDT-SQL-Server-Data-Tools

http://devproconnections.com/database-development/get-know-sql-server-2012s-sql-server-data-tools

http://www.codeproject.com/Articles/357905/Evaluating-SQL-Server-Data-Tools

http://www.mssqltips.com/sqlservertip/2804/introduction-to-sql-server-data-tools/