---
title: Gwarancje dostarczenia, wzorce outbox i inbox
icon: 📦
description: "Między bazą a brokerem wiadomości się gubią albo dublują. Zrozumiesz, co naprawdę znaczą gwarancje dostarczenia i jak pomaga w tym wzorzec outbox."
cover: 2020-12-30-cover.png
articles:
  - outbox_inbox_patterns_and_delivery_guarantees_explained
  - ordering_in_postgres_outbox
  - push_based_outbox_pattern_with_postgres_logical_replication
  - how_to_get_all_messages_through_postgres_logical_replication
  - the-order-of-things-why-you-cant
---

Twój kod zapisuje zamówienie w bazie, a potem publikuje wiadomość „zamówienie złożone”. Jeśli proces padnie między tymi krokami, zamówienie istnieje, ale nikt się o nim nie dowie. Ponowisz próbę, a ktoś może dowiedzieć się dwa razy. Zrozumiesz, co naprawdę obiecują gwarancje at-most-once, at-least-once i exactly-once i jak wzorzec outbox zamyka tę lukę, zapisując wiadomość w tej samej transakcji co dane.

Pierwszy artykuł wyjaśnia gwarancje oraz wzorce outbox i inbox. Trzy kolejne dotyczą budowania outboxa na PostgreSQL: subtelnego problemu z kolejnością przy sekwencjach i tego, jak wysyłać wiadomości zaraz po zapisaniu, zamiast ich odpytywać. Ostatni pokazuje na przykładzie PostgreSQL, MongoDB i Kafki, dlaczego nie da się mieć jednocześnie ścisłej kolejności i dużej przepustowości.

Zacznij od pierwszego. Artykuły o PostgreSQL zakładają, że go znasz.
