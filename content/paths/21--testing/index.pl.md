---
title: Testowanie
icon: 🧪
description: "Event Sourcing wcale nie jest trudny do testowania. Zobaczysz, jak w stylu Given/When/Then testować logikę biznesową, projekcje i procesy asynchroniczne."
cover: 2022-10-07-cover.jpg
articles:
  - testing_event_sourcing
  - testing_event_driven_projections
  - testing_asynchronous_processes_with_a_little_help_from_dotnet_channels
  - testing_event_sourcing_emmett_edition
  - custom_test_container_on_esdb_example
  - behaviour_driven_design_is_not_about_tests
---

Często słychać, że Event Sourcing trudno testować. Tymczasem jego logika biznesowa dobrze się do tego nadaje: mając wcześniejsze zdarzenia, uruchamiasz komendę i oczekujesz nowych zdarzeń albo błędu. Ten sam schemat Given/When/Then sprawdza się przy projekcjach, tylko wynikiem jest read model.

Pierwszy artykuł pokazuje takie testy w C# dla deciderów i agregatów, ale wzorzec przeniesiesz do każdego języka. Dalej są testy integracyjne projekcji w MongoDB w TypeScripcie i krótki tekst o tym, jak w .NET poczekać na asynchroniczne handlery bez pollingu. Artykuł o testach z Emmettem pokazuje w Node.js testy od jednostkowych po end-to-end, a kolejny wyjaśnia, jak skonfigurować własny kontener Testcontainers dla EventStoreDB.

Ostatni tłumaczy, dlaczego Behaviour-Driven Design to skupienie na zachowaniu systemu na każdym etapie pracy, a nie tylko testy.
