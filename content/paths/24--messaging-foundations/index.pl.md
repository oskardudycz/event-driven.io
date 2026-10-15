---
title: Podstawy przetwarzania wiadomości
icon: 📬
description: "Kolejka, backpressure i single writer działają tak samo w kodzie, jak i w architekturze. Zobaczysz je na przykładzie connection poola, a potem w SQS i Kafce."
cover: 2024-08-12-cover.png
articles:
  - architecture-weekly-190-queuing-backpressure
---

Baza danych przyjmie tylko określoną liczbę połączeń, a żądania wciąż napływają. To wydanie Architecture Weekly rozpracowuje ten problem, budując w TypeScripcie connection pool. Natychmiastowy błąd albo ponawianie w pętli się nie skalują, więc żądania czekają w kolejce. Nieograniczona kolejka przynosi własne kłopoty, dlatego pool dostaje backpressure i odrzuca nadmiarowe żądania. Przeniesienie obsługi kolejki do jednego brokera daje wzorzec single writer.

Ostatnia część pokazuje te same wzorce w skali całego systemu: SQS z Lambdą, CDN Cloudflare i grupy konsumentów w Kafce.
