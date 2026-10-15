---
title: Modele odczytu i projekcje
icon: 📊
description: "Ze zdarzeń trudno odczytać bieżący stan. Zobaczysz, jak budować z nich read modele dla ekranów i raportów i jak dbać, żeby pokazywały poprawne dane."
cover: 2023-01-20-cover.jpg
articles:
  - projections_and_read_models_in_event_driven_architecture
  - rebuilding_event_driven_read_models
  - rebuilding_read_models_skipping_events
  - how_to_scale_projections_in_the_event_driven_systems
  - how_to_create_projections_of_events_for_nested_object_structures
  - emmett_projections_testing
  - projections_and_event_metadata
  - event_transformations_and_loosely_coupling
  - persistent_vs_catch_up_eventstoredb_subscriptions_in_action
  - projections_in_marten_explained
  - projecting_from_marten_to_elasticsearch
  - publishing_read_model_changes_from_marten
---

Zdarzenia mówią, co się stało, ale ekran potrzebuje bieżącego stanu w kształcie, który łatwo odczytać: listy otwartych zamówień, salda klienta. Taki widok, czyli read model, buduje projekcja, która nakłada zdarzenia jedno po drugim. Zrozumiesz, jak projektować projekcje, jak przebudować read model, gdy zmienia się jego logika, i jak zachować poprawność, gdy zdarzenia przychodzą dwa razy albo z opóźnieniem.

Pierwszy artykuł omawia podstawy. Dwa kolejne pokazują, jak bezpiecznie przebudować read model, gdy system dalej działa, i co zrobić z przypadkami, których nie da się od razu naprawić. Potem są krótsze teksty o skalowaniu, zagnieżdżonych danych, testowaniu, metadanych i transformacji zdarzeń. Ostatnie cztery korzystają z konkretnych narzędzi, EventStoreDB i Martena, łącznie z wysyłaniem danych do Elasticsearcha.

Trzy pierwsze czytaj po kolei. Resztę wybieraj według problemu, który masz.
