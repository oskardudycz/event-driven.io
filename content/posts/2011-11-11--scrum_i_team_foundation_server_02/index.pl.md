---
title: Scrum i Team Foundation Server cz.2 – Instalacja TFS
category: ".NET"
cover: 2011-11-11-cover.png
author: oskar dudycz
disqusId: 29 http://oskar-dudycz.pl/2011/11/11/scrum-i-team-foundation-server-cz2/
---

![cover](2011-11-11-cover.png)

Tak jak zapowiedziałem w poprzednim wpisie, część druga mojej opowieści o Scrum i TFS będzie opisywała instalację oraz wstępną konfigurację Team Foundation Server. Po tych wpisach powinno być wiadomo co chcemy robić oraz czym, część trzecia przedstawi jak.

Przykłady będą przedstawione na podstawie Team Foundation  Server 11 Developer Preview.

## Instalacja serwera TFS

1. Pierwszym krokiem jest pobranie pliku instalacyjnego TFS 11 DP. Dostępny jest bezpłatnie pod adresem:  
* http://www.microsoft.com/download/en/details.aspx?id=27542#system-requirements
  
2. Po udanym pobraniu pliku uruchamiamy go. Pokaże nam się ekran:

![stfs](stfs-2-01.png)

Akceptujemy licencję i naciskamy przycisk "Continue".

3. W kolejnym ekranie zaznaczamy, że chcemy mieć włączone aktualizacje i rozpoczynamy proces instalacji naciskając przycisk "Install Now".

![stfs](stfs-2-02.png)

4. Rozpocznie się proces kopiowania plików instalacyjnych.

![stfs](stfs-2-03.png)

5. Po zakończeniu tego procesu pojawi nam się okno z wyborem rodzaju instalacji.

![stfs](stfs-2-04.png)

Dostępne są następujące tryby:
* *Basic* – powinniśmy ją wybrać gdy chcemy mieć skonfigurowany system kontroli wersji, zarządzanie zadaniami oraz serwisy buildów. Wybór tej instalacji pozwala nam na wybranie istniejącej już bazy danych lub instalację SQL Express, gdy nie mamy żadnej bazy na komputerze. Jeżeli chcemy mieć skonfigurowanego Share Point lub Reporting Services powinniśmy wybrać inny tryb instalacji
* *Standard Single Server* – instalacja ta różni się od instalacji podstawowej tym, że konfiguruje również Share Point
* *Advanced* – mamy w niej dostęp do wszystkich opcji konfiguracyjnych. Pozwala m.in. na konfigurację TFSa do użytkowania zewnętrznych serwerów SQL, wybór instancji baz danych, Reporting Services oraz Share Point, użycie autentykacji Kerberos
* *Application-Tier Only* – pozwala na dodanie kolejnej instancji Team Foundation Server do istniejącego i skonfigurowanego środowiska
* *Upgrade* – pozwala na uaktualnienie aktualnej wersji Team Foundation Server

Wybieramy instalację w trybie Basic i naciskamy przycisk "Start Wizard".

6. Pojawi się pierwszy ekran Basic Wizarda. Naciskamy w nim przycisk "Next"

![stfs](stfs-2-05.png)

7. Kolejny ekran pozwala na wybór czy chcemy zainstalować nową wersję bazy danych czy chcemy wybrać istniejącą instancję. W tym opisie zostanie zaprezentowana droga z zainstalowaną bazą danych. Zaznaczamy opcję "Use an existing SQL Server Instance" i naciskamy przycisk "Next".

![stfs](stfs-2-06.png)

8. W tym kroku powinniśmy wpisać nazwę instancji naszego serwera (w moim przypadku "WIN-MPMQ6E2DM0C"). Warto nacisnąć przycisk "Test", który sprawdzi, czy nasz serwer jest rzeczywiście dostępny, lub czy nie zrobiliśmy jakiejś literówki. Jeżeli po teście pojawi nam się zielona "fajka" możemy śmiało nacisnąć przycisk "Next".

![stfs](stfs-2-07.png)

9. Jeżeli wszystko przebiegło pomyślnie to powinien pojawić nam się ekran z podsumowaniem dotychczas dokonanych wyborów. Naciskamy przycisk "Next".

![stfs](stfs-2-08.png)

10. Następuje teraz proces intalacji/konfiguracji baz danych, serwera IIS oraz Firewalla. Po jego zakończeniu ekran powinien wyglądać:

![stfs](stfs-2-09.png)

Naciskamy przycisk "Next".

11. W kolejny ekranie otrzymujemy jakże przyjemny napis "Success". Udało nam się zainstalować i skonfigurować pomyślnie TFS.

![stfs](stfs-2-10.png)

Naciskamy przycisk "Close".

## Konfiguracja proxy TFS

12. Skoro udało nam się "zainstalować i skonfigurować pomyślnie TFS" to skąd kolejny punkt? OK, trochę nagiąłem prawdę. Co prawda TFS już stoi i ma się dobrze dokofigurujemy jeszcze dwie rzeczy. Proxy serwera, które pozwoli nam zmniejszyć obciążenie naszego serwera oraz serwisy Buildów. Wna głównym ekranie (przedstawionym w punkcie 5) na "Configure Team Foundation Server Proxy" . Powinien pojawić nam się ekran

![stfs](stfs-2-11.png)

Naciskamy przycisk "Next".

13. Wybieramy użytkownika, przy pomocy którego proxy będzie łączyło się z TFS. Użytkownik ten powinien kontem serwisowym oraz zostać dodany do grupy użytkowników mających uprawnienia do TFS. Co prawda nie do końca bezpiecznie, ale dla ułatwienia wybrałem konto "NT AUTHORITYLOCAL SERVICE". Po wyborze naciskamy przycisk "Next"

![stfs](stfs-2-12.png)

14. W kolejnym ekranie określamy port, na którym ma działać Proxy oraz miejsce, w którym ma być przechowywany jego Cache. Możemy pozostawić domyślne wartości oraz nacisnąć przycisk "Next".

![stfs](stfs-2-13.png)

15. Zobaczymy podsumowanie opcji, które wybraliśmy. Możemy zweryfikować ich poprawność naciskając przycisk "Verify" lub gdy ufamy sobie bezgranicznie nacisnąć od razu przycisk "Next".

![stfs](stfs-2-14.png)

16. Nastąpi proces sprawdzania konfiguracji i jeżeli wszystko poszło pomyślnie, wszystko zostanie oznaczone na zielono i będziemy mogli nacisnąć przycisk "Configure".

![stfs](stfs-2-15.png)

17. Po udanej konfiguracji powinniśmy zobaczyć ekran:

![stfs](stfs-2-16.png)

Naciskamy przycisk "Next".

18. Po raz kolejny możemy poczuć się dumni. Odnieśliśmy kolejny sukces – skonfigurowaliśmy proxy dla naszego serwera TFS. Po jego odtrąbieniu możemy zamknąć okno naciskając przycisk "Close".

![stfs](stfs-2-17.png)

## Konfiguracja serwisu Buildów

19. Tym razem darowałem sobie żart o zakończeniu procesu instalacji. Pozostało nam jeszcze bowiem skonfigurowanie serwisu Buildów. W głównym ekranie (patrz punkt 5) zaznaczamy "Configure Team Foundation Build Service" oraz naciskamy przycisk "Start Wizard". Pojawi nam się okno:

![stfs](stfs-2-18.png)

Jeżeli nie mamy na komputerze zainstalowanych innych serwerów TFS możemy bez zastanowienia nacisnąć przycisk "Next".

20. W kolejnym ekranie mamy możliwość wybrania liczbę "agentów buildów". Im więcej ich mamy tym więcej buildów będzie mogło być naraz wykonywanych. Należy wziąć jednak pod uwagę, że każdy proces budowania zużywa zasoby systemowe, więc jeżeli nie mamy mocnego komputera nie ma sensu zwiększać ich liczby. W tym tutorialu wybrałem rekomendowaną liczbę – 1. Po wybraniu liczby agentów naciskamy przycisk "Next".

![stfs](stfs-2-19.png)

21. Musimy wybrać również użytkownika, na którego koncie będzie działał serwer buildów oraz port, na którym będzie łączył się z TFS. Ja wybrałem systemowe konto "NT AUTHORITYLOCAL SERVICE" oraz sugerowany port 9191.

![stfs](stfs-2-20.png)

Przycisk "Next" będzie standardowo dobrym wyjściem by przejść do kolejnego kroku.

22. Pojawi się znany już nam ekran z podsumowaniem wybranych opcji. Jeżeli jesteśmy dokonanych wyborów możemy śmiało nacisnąć "Next".

![stfs](stfs-2-21.png)

23. Instalator przetestuje teraz czy wszystkie nasze ustawienia były poprawne. Jeżeli wszystko przebiegnie bez problemów powinniśmy zobaczyć ekran z przyjemnie zielonymi kolorami.

![stfs](stfs-2-22.png)

Pozostaje nam tylko w następnym widoku nacisnąć przycisk "Configure".

24. Nastąpi teraz instalacja i konfiguracja potrzebnych składników. Po jego zakończeniu powinniśmy mieć wszystkie paski w kolorze zielonym tak jak na screenie widocznym poniżej.

![stfs](stfs-2-23.png)

25. Na koniec powinniśmy zobaczyć jakże miły napis "Success". Gdy już się nim nacieszymy możemy nacisnąć przycisk "Finish" i zakończyć proces konfiguracji.

![stfs](stfs-2-24.png)

Udało nam się zatem zainstalować Team Foundation System. Mamy już [wiedzę teoretyczną](/pl/scrum_i_team_foundation_server_01), mamy narzędzie, w kolejnym wpisie dowiemy się jak z niego skorzystać.