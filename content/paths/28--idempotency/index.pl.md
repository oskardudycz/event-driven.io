---
title: Idempotentność
icon: ♻️
description: "W systemach rozproszonych ta sama wiadomość przyjdzie więcej niż raz. Zobaczysz, jak obsłużyć duplikaty tak, żeby nie psuły danych."
cover: 2024-11-15-cover.png
articles:
  - idempotent_command_handling
  - deduplication-in-distributed-systems
  - dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections
---

Żądanie płatności nie dostaje odpowiedzi na czas, aplikacja ponawia próbę i klient płaci dwa razy. Wiadomości powtarzają się z wielu powodów: ponowień, restartów brokera, przełączenia na zapasowy serwer. Nie zapobiegniesz temu, więc kod musi sprawić, żeby powtórzona wiadomość niczego nie psuła. Ta właściwość to idempotentność. Dowiesz się, kiedy twoja logika już ją ma, a kiedy duplikaty trzeba świadomie wykrywać.

Pierwszy artykuł dotyczy obsługi komend: które operacje można bezpiecznie powtórzyć i jak odrzucić duplikat tym samym sprawdzeniem wersji, które chroni przed równoczesną edycją. Drugi wyjaśnia, skąd biorą się duplikaty i w którym miejscu systemu można je odfiltrować. Trzeci stosuje te same pomysły do aktualizacji read modeli.

Zacznij od pierwszego.
