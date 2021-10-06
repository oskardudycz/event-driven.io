---
title: Jak odblokować workspace w TFS
category: ".NET"
cover: 2011-10-01-cover.png
author: oskar dudycz
disqusId: 33 http://oskar-dudycz.pl/2011/10/01/jak-odblokowac-workspace-w-tfs/
---

![cover](2011-10-01-cover.png)

Dzisiaj kolejny przykład z życia wzięty, krótszy ale miejmy nadzieję, przydatny.

Zmieniłem na swoim komputerze nazwę grupy roboczej, do której należę. Po uruchomieniu Visual Studio i próbie checkoutu pliku okazało się, że pojawił mi się komunikat o błędzie:

```
A local workspace is required.  
Workspace NazwaGrupyRoboczej;Nazwa użytkownika 
does not reside on this computer.
```

Komunikat ni mniej ni więcej mówi, że VS nie mogło odnaleźć wcześniejszego workspace'a. Powodem jest to z tego, że TFS cache'uje workspace'y. Jak zatem wymusić na żeby odświeżył je i zobaczył naszą zmianę?

Należy uruchomić Visual Studio Command Prompt (Start => Programy => Microsoft Visual Studio 2010 => Visual Studio Tools => Visual Studio Command Prompt (2010)) i wpisać w nim:

```
tf workspaces /s:URLDoTwojegoSerweraTFS
```