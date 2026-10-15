---
title: Optymistyczna współbieżność
icon: 🔒
description: "Bez kontroli współbieżności druga zmiana po cichu nadpisuje pierwszą. Zobaczysz, jak wykryć taki konflikt i obsłużyć go w web API."
cover: 2020-12-16-cover.png
articles:
  - optimistic_concurrency_for_pessimistic_times
  - how_to_use_etag_header_for_optimistic_concurrency
---

Gdy dwie osoby edytują ten sam rekord, druga zapisana zmiana po cichu nadpisuje pierwszą. Blokada rekordu temu zapobiega, ale wstrzymuje pozostałych, dopóki ktoś trzyma go otwartego. Poznasz lżejsze podejście, które zakłada, że konflikty są rzadkie. Odczytujesz rekord razem z wersją, odsyłasz tę wersję ze zmianą, a zapis zostaje odrzucony, jeśli ktoś w międzyczasie zmienił dane. Dzięki temu decyzje zapadają zawsze na podstawie aktualnych danych.

Pierwszy artykuł tłumaczy tę ideę, porównuje ją z blokowaniem i pokazuje, dlaczego ma znaczenie w rozproszonych bazach danych i w Event Sourcingu. Drugi pokazuje, jak obsłużyć ją w web API za pomocą standardowych nagłówków HTTP. Serwer wysyła wersję w nagłówku ETag, klient odsyła ją w If-Match, a nieaktualna zmiana dostaje status 412 Precondition Failed. Przykłady są w TypeScripcie.

Czytaj po kolei, bo drugi artykuł zakłada znajomość pierwszego.
