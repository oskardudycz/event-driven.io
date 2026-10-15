---
title: Wersjonowanie zdarzeń
icon: 🏷️
description: "Zdarzenia będą się zmieniać, a stare zostają zapisane. Zobaczysz, jak je rozwijać, nie psując istniejących danych ani systemów, które je czytają."
cover: 2020-12-23-cover.png
articles:
  - how_to_do_event_versioning
  - simple_events_versioning_patterns
  - announcing-strictland-contract-testing
  - how_to_map_event_type_by_convention
  - explicit_events_serialisation_in_event_sourcing
  - event_versioning_with_marten
---

Zdarzenia zostają zapisane na lata, a kod, który je czyta, ciągle się zmienia. Dodajesz wymagane pole albo zmieniasz nazwę właściwości, a stare zdarzenia nadal muszą się poprawnie wczytać. Zmiany w zdarzeniach nie są tak straszne, jak się o nich mówi, ale trzeba je zaplanować.

Pierwszy artykuł pokazuje najtańszą opcję: projektować tak, żeby rzadko ich potrzebować. Jeśli [streamy są krótkie](/pl/guides/short-living-streams/), stare formaty zdarzeń same znikają. Kolejne omawiają proste, powtarzalne sposoby obsługi zmian, od dodania pola po przekształcanie starych zdarzeń do nowej postaci przy odczycie. Zobaczysz też, jak wyłapać niekompatybilną zmianę w teście jednostkowym, zanim trafi na produkcję, i jak kontrolować sposób zapisu i odczytu zdarzeń.

Zacznij od pierwszego artykułu. Może oszczędzić ci większości pracy opisanej w pozostałych.
