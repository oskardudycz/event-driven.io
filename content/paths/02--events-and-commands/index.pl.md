---
title: Zdarzenia i komendy
icon: ✉️
description: "Komenda prosi o wykonanie czegoś, zdarzenie mówi, że coś już się stało. Gdy rozumiesz tę różnicę, projektujesz wiadomości jasne i łatwe w obsłudze."
cover: 2021-02-17-cover.png
articles:
  - whats_the_difference_between_event_and_command
---

Komenda prosi konkretnego odbiorcę o wykonanie czegoś, a on może odmówić. Zdarzenie opisuje fakt, który już się wydarzył, i trafia do każdego, kto słucha. Definicje są krótkie, ale w prawdziwym systemie granica często się zaciera. Po lekturze będziesz wiedzieć, czym powinna być dana wiadomość.

Jest tu jeden artykuł. Wyjaśnia, dlaczego „komendy są synchroniczne, a zdarzenia asynchroniczne” to przyzwyczajenie, a nie reguła. Daje też praktyczny test: jeśli odbiorca ma prawo odmówić, wyślij komendę; jeśli powinien po prostu przyjąć informację, opublikuj zdarzenie. Omawia również częstą pułapkę: zdarzenie, które ma dokładnie jednego odbiorcę i zawsze musi zostać obsłużone. Często to komenda pod nazwą zdarzenia.

Przeczytaj go, zanim zaprojektujesz wiadomości między modułami. Dalej poprowadzi cię przewodnik [Zdarzenia wewnętrzne i zewnętrzne](/pl/guides/events-on-the-inside-events-on-the-outside/).
