---
title: Podstawy Event Sourcingu
icon: 🧱
description: "Event Sourcing zapisuje to, co się wydarzyło, zamiast nadpisywać stan. Zrozumiesz, co zyskujesz, kiedy się nie opłaca i jak zacząć w prawdziwym projekcie."
cover: 2022-03-16-cover.png
articles:
  - introduction_to_event_sourcing
  - how_to_get_the_current_entity_state_in_event_sourcing
  - should_you_throw_exception_when_rebuilding_state_from_events
  - emmett_postgresql_event_store
  - bank_account_event_sourcing
  - never_lose_data_with_event_sourcing
  - start-small-grow-big-how-to-pick
  - when_not_to_use_event_sourcing
  - audit_log_event_sourcing
  - the_end_is_near_for_crud_data
  - one_or_more_event_that_is_the_question
  - on_putting_stream_id_in_event_data
  - whats_the_difference_between_event_and_command
---

Większość systemów trzyma tylko bieżący stan i nadpisuje go przy każdej zmianie. Event Sourcing zapisuje każdą zmianę biznesową jako zdarzenie i z tych zdarzeń odtwarza stan. Masz pełną historię tego, co się wydarzyło, a kod bliżej odzwierciedla proces biznesowy. Sam pomysł jest prosty. Trudniej ocenić, gdzie się opłaca, i zacząć tak, żeby się nie sparzyć.

Pierwsze artykuły pokazują, jak to działa, razem z ćwiczeniami do samodzielnego zrobienia. Kolejne pomagają podjąć decyzję: co zyskujesz, nie tracąc danych, kiedy Event Sourcing się nie opłaca i jak wybrać pierwszą funkcjonalność, na której czegoś się nauczysz bez dużego ryzyka. Ostatnie odpowiadają na pytania o modelowanie, które pojawiają się szybko, np. jak przenieść istniejące dane relacyjne na zdarzenia.

Jeśli dopiero zaczynasz, czytaj po kolei. Przechowywaniu zdarzeń poświęcony jest [osobny przewodnik](/pl/guides/how-to-store-events-in-event-sourcing/).
