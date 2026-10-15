---
title: Krótko żyjące strumienie
icon: ⏱️
description: "Stream, który żyje wiecznie, staje się kłopotem. Zobaczysz, jak modelować cykl życia, żeby streamy były krótkie, i co robić, gdy nie ma naturalnego końca."
cover: 2024-02-17-cover.png
articles:
  - closing_the_books_in_practice
  - should_you_always_keep_streams_short
---

W Event Sourcingu każdy rekord trzyma swoje zdarzenia w jednym streamie. Jeśli stream żyje wiecznie, ciągle rośnie: wczytuje się coraz wolniej, trudniej go zmienić, a ty trzymasz dane, których nikt nie potrzebuje. Większość streamów nie musi żyć tak długo, bo większość procesów biznesowych ma naturalny cykl, jak zmiana kasjerska albo miesiąc rozliczeniowy.

Pierwszy artykuł pokazuje w C#, jak taki cykl zamodelować. Każda zmiana kasjerska ma własny stream. Gdy się kończy, ostatnie zdarzenie przenosi to, czego potrzebuje kolejna zmiana, np. stan gotówki w szufladzie. Dzięki temu żaden stream nie trzyma całej historii kasy. Księgowi nazywają to zamknięciem ksiąg.

Drugi artykuł dotyczy danych bez naturalnego końca, takich jak dane firmy czy adresy. Zobaczysz, kiedy lepiej trzymać je po prostu jako stan, a jeśli zostajesz przy zdarzeniach, jak pozbyć się starych.
