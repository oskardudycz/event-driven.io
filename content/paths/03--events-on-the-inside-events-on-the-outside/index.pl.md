---
title: Zdarzenia wewnętrzne i zewnętrzne
icon: 🚪
description: "Zdarzenia używane wewnątrz modułu i te udostępniane innym mają różne zadania. Nauczysz się projektować jedne i drugie, by bezpiecznie zmieniać moduł."
cover: 2023-10-15-cover.png
articles:
  - internal_external_events
  - events_should_be_as_small_as_possible
---

Gdy inny zespół potrzebuje twoich danych, najszybciej jest pozwolić mu słuchać zdarzeń, których twój moduł używa wewnętrznie. Działa to do pierwszej zmiany. Odbiorcy muszą odtwarzać twój proces z drobnych, szczegółowych zdarzeń, a każda twoja zmiana może im coś zepsuć. Nauczysz się rozdzielać oba rodzaje zdarzeń, żeby zmieniać wnętrze modułu bez psucia innym.

Pierwszy artykuł pokazuje problem na znajomym scenariuszu: zespół płatności słucha zdarzeń koszyka, pomija jedno z nich i pobiera od klientów za dużo. Rozwiązaniem jest traktowanie udostępnianych zdarzeń jak API. Szczegółowe zdarzenia zostają w module, a inne zespoły dostają na osobnym kanale mniej zdarzeń, ale kompletnych, ze wszystkimi potrzebnymi danymi. Drugi, starszy artykuł odpowiada na pytanie, jak duże powinno być zdarzenie: tak małe, jak to możliwe, ale nie mniejsze. Czasem oznacza to kilka zdarzeń dopasowanych do różnych odbiorców zamiast jednego dużego.

Zacznij od pierwszego. Do drugiego sięgnij, gdy kilku odbiorców potrzebuje od ciebie różnych danych.
