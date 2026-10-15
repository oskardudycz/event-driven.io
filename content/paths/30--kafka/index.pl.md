---
title: Kafka
icon: 🪵
description: "Co dzieje się w Kafce, gdy wysyłasz wiadomość, i dlaczego ma to znaczenie dla gwarancji dostarczenia i wydajności."
cover: 2025-01-13-cover.png
articles:
  - how-a-kafka-like-producer-writes
---

Wysłanie wiadomości do Kafki to jedna linijka kodu, a to, co dzieje się dalej, zwykle traktujemy jak czarną skrzynkę. To wystarcza, dopóki nie musisz wiedzieć, kiedy wiadomość jest naprawdę bezpieczna albo dlaczego wysyłanie w paczkach jest szybsze. Artykuł śledzi wiadomość od producenta do plików na dysku brokera: paczkowanie, log dopisywany na końcu i dzielony na segmenty oraz to, jak broker po awarii wykrywa dane zapisane tylko w połowie. Jest długi, szczegółowy i z kodem.
