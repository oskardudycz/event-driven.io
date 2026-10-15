---
title: Monolit a mikroserwisy
icon: 🏘️
description: "Podział na mikroserwisy robiony dla mody zwykle się nie opłaca. Zobaczysz, kiedy ma sens, jak wpływają na niego zespoły i jak wydzielać usługi stopniowo."
cover: 2025-03-03-cover.jpg
articles:
  - so-you-want-to-break-down-monolith
  - monolith-first-are-you-sure
  - how_to_cut_microservices
  - sociological_aspects_of_microservices
---

Decyzje o podziale systemu często wynikają z mody. Najpierw wszyscy chcieli mikroserwisów, teraz słychać „zacznij od modularnego monolitu”. Żaden z tych wyborów nie zwalnia cię z trudnych kwestii: granic modułów, współdzielonych danych i organizacji zespołów.

Pierwszy artykuł jest dla zespołów, które rozbijają istniejący monolit. Załóż, że część systemu w nim zostanie, każde wydzielenie powiąż z mierzalną wartością biznesową i przenoś funkcjonalności stopniowo, z feature flagami i wzorcem Strangler Fig. Drugi podważa radę „najpierw monolit”: modularny monolit też ma swoje koszty, od rozmywających się granic modułów po współdzieloną bazę danych.

Dwa ostatnie są starsze i krótsze. Jeden wymienia techniczne powody, dla których warto mieć osobne jednostki wdrożeniowe: różne obciążenie, skalowanie, multi-tenancy i wiele regionów. Drugi opisuje pozatechniczne motywacje, np. CV Driven Development i chęć niezależności zespołów, oraz prawo Conwaya.
