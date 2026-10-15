---
title: Antywzorce
icon: 🚫
description: "Niektóre projekty zdarzeń wyglądają dobrze, a kłopoty sprawiają dopiero później. Nauczysz się rozpoznawać typowe błędy i dowiesz się, czym je zastąpić."
cover: 2024-04-07-kafka.png
articles:
  - anti-patterns
  - clickbait_event
  - property-sourcing
  - state-obsession
  - i_will_just_add_one_more_field
  - one_or_more_event_that_is_the_question
  - on_putting_stream_id_in_event_data
  - passive_aggressive_events
  - yoda_principle_in_command_design
---

Niektóre projekty zdarzeń wyglądają rozsądnie, gdy je piszesz, a kłopoty sprawiają po kilku miesiącach: odbiorcy muszą dopytywać o szczegóły, zdarzenia mówią tylko, że zmieniło się pole, albo w każdym sprincie dostają kolejne pole. Nauczysz się rozpoznawać te błędy we własnym projekcie, zrozumiesz, dlaczego szkodzą, i zobaczysz, co zapisywać zamiast nich.

Pierwszy artykuł to wystąpienie, które daje przegląd. Pięć artykułów bierze po jednym błędzie i omawia go na przykładzie, pod nazwą, pod którą jest znany, np. Clickbait Event albo Property Sourcing. Dwa dotyczą wyborów, które nie są oczywiste: czy zapisać jedno zdarzenie, czy kilka, i co trzymać w danych zdarzenia. Ostatni mówi o nazywaniu komend tak, żeby ich intencja była jasna.

Zacznij od wystąpienia, potem czytaj te, które brzmią jak twój system.
