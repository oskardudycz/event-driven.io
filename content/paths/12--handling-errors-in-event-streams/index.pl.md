---
title: Obsługa błędów w strumieniach zdarzeń
icon: 🩹
description: "Błędne zdarzenia trafią do systemu, a nie można ich po prostu usunąć. Zobaczysz, jak naprawiać pomyłki i bugi, nie tracąc historii ani zaufania do danych."
cover: 2021-01-27-cover.png
articles:
  - what_texting_ex_has_to_do_with_event_driven_design
  - no_it_can_never_happen
  - fixing-bugs-in-event-sourcing-is-hard
  - how_to_update_past_data_in_event_sourcing
  - deduplication-in-distributed-systems
---

Prędzej czy później zapiszesz błędne zdarzenie: bug źle policzy cenę, użytkownik zrobi coś, czego nikt nie przewidział, albo wiadomość przyjdzie dwa razy. W systemie, który przechowuje historię, nie wymazujesz pomyłki. Zapisujesz to, co ją koryguje, tak jak bank dodaje operację korygującą, zamiast poprawiać wyciąg z zeszłego miesiąca. Dowiesz się, jak to robić, żeby dane wróciły do porządku, a historia dalej pokazywała, co się stało.

Dwa pierwsze artykuły są krótkie i tłumaczą podejście: wysłanej wiadomości nie cofniesz, a „niemożliwy” przypadek i tak się zdarzy. Dwa kolejne pokazują w praktyce, na przykładach z hotelu, jak naprawiać bugi i zmieniać dane z przeszłości. Ostatni wyjaśnia, skąd biorą się zduplikowane wiadomości i gdzie można je odfiltrować.

Czytaj po kolei.
