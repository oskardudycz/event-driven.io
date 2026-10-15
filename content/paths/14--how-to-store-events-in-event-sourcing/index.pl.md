---
title: Jak przechowywać zdarzenia w Event Sourcingu
icon: 🗄️
description: "Event store'y są prostsze, niż się wydaje. Zrozumiesz, jak działają, by świadomie wybrać narzędzie albo zbudować prosty event store na bazie, której używasz."
cover: 2023-04-07-es1.png
articles:
  - event_stores_are_key_value_stores
  - lets_build_event_store_in_one_hour
  - relational_databases_are_event_stores
  - lets_talk_about_positions_in_event_stores
  - checkpointing_message_processing
  - the-write-ahead-log-a-foundation
  - key-value-stores
  - using-s3-but-not-the-way-you-expected
  - temporal_tables_and_event_sourcing
---

Event store brzmi egzotycznie, ale to zwykła baza danych. Trzyma zdarzenia pogrupowane według rekordu, którego dotyczą, nowe zawsze dopisuje na końcu i daje te same gwarancje, których oczekujesz od bazy danych. Gdy to zobaczysz, łatwiej odpowiesz sobie na pytania o wydajność, spójność i wybór narzędzia.

Pierwsze artykuły wyjaśniają ten model i w godzinę budują prosty event store na PostgreSQL. Pokazują też, że bazy relacyjne w środku działają podobnie. Kolejne opisują, jak inne części systemu pamiętają, które zdarzenia już przetworzyły. Ostatnie zaglądają głębiej, do elementów, na których to wszystko stoi, i sprawdzają, czy S3 albo temporal tables mogą pełnić tę samą rolę.

Nie potrzebujesz tej wiedzy, żeby korzystać z gotowego event store'a. Pomoże ci za to zrozumieć, co gwarantuje i dlaczego.
