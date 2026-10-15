---
title: Architektura oparta na zdarzeniach
icon: 📡
description: "Architektura oparta na zdarzeniach bez modnych haseł. Zrozumiesz, co daje, czego wymaga i jak pomaga zespołom pracować bardziej niezależnie."
cover: 2023-02-26-cover.png
articles:
  - dont_let_event_driven_architecture_buzzwords_fool_you
  - how_using_events_help_in_teams_autonomy
  - predictable-identifiers-enabling
  - dealing-with-eventual-consistency
---

Architektura oparta na zdarzeniach buduje system wokół tego, co się dzieje. Moduł zapisuje fakt, na przykład „zamówienie złożone”, a inne moduły na niego reagują, zamiast żeby jeden moduł wywoływał wszystkie pozostałe. Zrozumiesz, co to daje, czego wymaga i jak pozwala zespołom pracować bardziej niezależnie.

Pierwszy artykuł rozprawia się z modnymi hasłami. Oddziela projektowanie przepływu od mechanizmów dostarczania wiadomości i od narzędzi, a do tego tłumaczy, dlaczego decyzje warto podejmować właśnie w tej kolejności. Drugi pokazuje, jak zdarzenia odsłaniają zależności między modułami i między zespołami, które za nimi stoją. Dwa ostatnie są praktyczne. W jednym moduł płatności obsługuje wiele części systemu, nic o nich nie wiedząc. W drugim użytkownik pracuje dalej, gdy jego pliki jeszcze się wgrywają, a system przez chwilę nie jest spójny. Taki kompromis to spójność ostateczna (eventual consistency).

Czytaj po kolei. Dwa pierwsze artykuły są krótkie, dwa ostatnie dłuższe i z kodem.
