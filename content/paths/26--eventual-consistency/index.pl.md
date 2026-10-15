---
title: Spójność ostateczna
icon: ⏳
description: "Dane nie zmieniają się wszędzie w tej samej chwili. Zobaczysz, jak żyć z tym opóźnieniem, dbać o poprawność read modeli i informować użytkowników."
cover: 2021-11-10-cover.png
articles:
  - dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections
  - long_polling_and_eventual_consistency
---

Użytkownik zapisuje zmianę, odświeża stronę i dalej widzi stare dane. W systemach opartych na zdarzeniach strona odczytu aktualizuje się chwilę po zapisie, więc przez moment różne części systemu się ze sobą nie zgadzają. To spójność ostateczna (eventual consistency). Opóźnienia nie usuniesz, ale możesz zadbać o to, żeby dane w końcu były poprawne, a użytkownik nie był zdezorientowany, gdy czeka.

Pierwszy artykuł buduje read modele w MongoDB i pokazuje, jak zachować ich poprawność, gdy zdarzenia przychodzą z opóźnieniem albo dwa razy. Drugi pokazuje long-polling: API chwilę czeka, aż zmiana będzie widoczna, więc klient może traktować operację asynchroniczną jak synchroniczną.

Czytaj po kolei, drugi artykuł kontynuuje pierwszy.
