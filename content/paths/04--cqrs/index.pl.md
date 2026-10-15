---
title: CQRS
icon: 🔀
description: "CQRS jest prostszy, niż się o nim mówi. Zobaczysz, co naprawdę oznacza, które przekonania to mity i jak pomaga układać kod wokół funkcjonalności."
cover: 2021-03-03-cover.png
articles:
  - cqrs_facts_and_myths_explained
  - my-thoughts-on-vertical-slices-cqrs
  - vertical-slices-and-dependencies
  - fractal-architecture-cognitive-load
  - can_command_return_a_value
  - generic_does_not_mean_simple
  - how_to_slice_the_codebase_effectively
  - vertical_slices_in_practice
  - cqrs_is_simpler_than_you_think_with_net6
---

CQRS ma opinię skomplikowanego: osobne bazy danych, Event Sourcing, kolejki. Nic z tego nie jest konieczne. W swojej istocie CQRS oznacza obsługę zmian i zapytań jako osobnych operacji, z których każda jest dopasowana do swojego zadania.

Pierwszy artykuł oddziela fakty od mitów. Kolejne trzy pokazują, jak CQRS prowadzi do vertical slices, czyli organizowania kodu według funkcjonalności biznesowych zamiast warstw technicznych. Zobaczysz, co to zmienia w odpowiedzialności za kod, w zależnościach i w tym, ile musisz trzymać w głowie. Potem przychodzą pytania praktyczne: czy komenda może zwracać wartość i dlaczego generyczny kod nie jest automatycznie prosty. Dwa kolejne artykuły pokazują, jak ułożyć projekt według funkcjonalności, drugi na przykładzie rezerwacji w hotelu. Ostatni pokazuje całość w kodzie .NET.

Jeśli CQRS to dla ciebie nowość, zacznij od pierwszego artykułu. Jeśli już go używasz, najwięcej w strukturze twojego kodu mogą zmienić artykuły o vertical slices.
