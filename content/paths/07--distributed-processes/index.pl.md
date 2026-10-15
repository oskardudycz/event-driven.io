---
title: Procesy rozproszone
icon: 🧩
description: "Procesy biznesowe rzadko mieszczą się w jednej transakcji. Zobaczysz, jak koordynować pracę wielu usług i co robić, gdy któryś krok się nie uda."
cover: 2021-02-10-cover.png
articles:
  - saga_process_manager_distributed_transactions
  - event_driven_distributed_processes_by_example
  - consumers_processors_in_emmett
  - checkpointing_message_processing
  - multitenant_and_dynamic_message_handling
  - dealing_with_race_conditions_in_eda_using_read_models
  - strict_ordering_in_event_handling
  - how_to_have_fun_with_typescript_and_workflow
  - workflow-engine-design-proposal-tell
---

Proces taki jak złożenie zamówienia dotyka kilku usług: magazynu, płatności, wysyłki. Żadna transakcja bazodanowa nie obejmie ich wszystkich, więc każdy krok zatwierdza się osobno. Zrozumiesz, jak koordynować takie procesy za pomocą zdarzeń, co zrobić, gdy któryś krok się nie uda, i jak zachować poprawność, gdy wiadomości są ponawiane albo przychodzą w złej kolejności.

Dwa pierwsze artykuły wyjaśniają sagę, process managera i choreografię i pokazują je w kodzie, łącznie z wycofaniem kroku, który się nie powiódł. Trzy kolejne pokazują, jak działa przetwarzanie wiadomości pod spodem: jak procesor pamięta, gdzie skończył, i jak rozłożyć pracę, gdy masz wielu klientów (tenantów). Dwa następne dotyczą zdarzeń przychodzących w nieoczekiwanej kolejności. Ostatnie dwa są o modelowaniu workflow: za pomocą typów w TypeScripcie i jako projekt silnika workflow.

Zacznij od dwóch pierwszych. Resztę czytaj, gdy dany problem się pojawi.
