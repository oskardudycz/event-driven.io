---
title: Distributed processes
icon: 🧩
description: "Business processes rarely fit in one transaction. You'll learn how to coordinate work across services, and what to do when steps fail or arrive out of order."
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

A process like placing an order touches several services: stock, payments, shipping. No database transaction covers them all, so each step commits on its own. You'll understand how to coordinate such processes with events, what to do when a step fails, and how to stay correct when messages are retried or arrive out of order.

The first two articles explain sagas, process managers and choreography, and show them in code, including undoing a step that failed. The next three show how message processing works underneath: how a processor remembers where it stopped, and how to spread the work when you have many tenants. Two more deal with events arriving in an unexpected order. The last two are about modelling workflows, with TypeScript types and as a design for a workflow engine.

Start with the first two. Read the rest when the problem comes up.
