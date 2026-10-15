---
title: Unikalność w Event Sourcingu
icon: 🆔
description: "„Nazwa użytkownika musi być unikalna” to w Event Sourcingu trudniejsze wymaganie, niż się wydaje. Zobaczysz, co naprawdę za nim stoi i jak je spełnić."
cover: 2022-03-09-cover.png
articles:
  - uniqueness-in-event-sourcing
  - unique_constraint_in_marten_event_store
---

W zwykłej bazie danych dodajesz unikalny indeks i sprawa załatwiona. Większość event store'ów daje tylko jedną taką gwarancję: dwa streamy nie mogą mieć tego samego identyfikatora. Gdy więc słyszysz, że e-mail musi być unikalny albo numery faktur nie mogą się powtarzać, potrzebujesz innego sposobu. Sprawdzenie przed zapisem, czy wartość jest wolna, nie działa, bo ktoś może ją zająć między twoim sprawdzeniem a zapisem.

Pierwszy artykuł zaczyna od pytania, które warto zadać przed napisaniem kodu: po co ta unikalność? Często biznes przynosi gotowe rozwiązanie, a prawdziwy problem leży gdzie indziej. Jeśli wymaganie zostaje, zobaczysz kilka sposobów, żeby je spełnić, np. rezerwację wartości przed zapisem, oraz co zrobić, gdy coś pójdzie nie tak w połowie.

Drugi artykuł pokazuje pragmatyczny skrót dla użytkowników Martena, oparty na unikalnym indeksie w PostgreSQL.
