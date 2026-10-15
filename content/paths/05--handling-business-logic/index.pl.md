---
title: Obsługa logiki biznesowej
icon: 🧠
description: "Logikę biznesową w dużych klasach trudno czytać i testować. Zobaczysz, jak zapisać ją prostymi funkcjami i typami. Przykłady w C#, F#, Javie i TypeScripcie."
cover: 2022-08-31-cover.jpg
articles:
  - slim_your_entities_with_event_sourcing
  - how_to_effectively_compose_your_business_logic
  - idempotent_command_handling
  - simple_transactional_command_orchestration
  - this_is_not_your_uncle_java
  - how_events_can_help_on_making_state_based_approach_efficient
  - prototype_underestimated_design_skill
  - throw-result-or-neither
  - my_journey_from_aggregates
  - union_types_in_csharp
  - writing_and_testing_business_logic_in_fsharp
  - how_to_validate_business_logic
---

Logika biznesowa często rozlewa się po dużych klasach, wymieszana z obsługą stanu i kodem bazy danych. Trudno wtedy zobaczyć, jakie decyzje podejmuje kod, a jeszcze trudniej go przetestować. Nauczysz się innego podejścia: możliwe stany i żądania opisujesz jawnymi typami, a każdą decyzję zapisujesz jako małą funkcję, która przyjmuje żądanie i bieżący stan, a zwraca to, co się wydarzyło.

Wiele przykładów korzysta z tego samego koszyka zakupowego, więc łatwo porównać style. Zacznij od pierwszego artykułu: krok po kroku odchudza klasyczny agregat, czyli klasę trzymającą razem dane i reguły. Pozostałe dotyczą tego, co zrobić, gdy to samo żądanie przyjdzie dwa razy, jak zapisać dwie powiązane zmiany w jednej transakcji, jak walidować dane wejściowe i jak zgłaszać niepowodzenia: rzucić wyjątek, zwrócić błąd czy zapisać je jako fakt.

Kod jest w C#, F#, Javie i TypeScripcie. Wybierz swój język, idee przenoszą się na pozostałe.
