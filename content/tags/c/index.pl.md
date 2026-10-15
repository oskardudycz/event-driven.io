---
description: "Rekordy i nullable reference types w C# obiecują bezpieczniejszy kod. Artykuł o tym, gdzie te obietnice zawodzą i na co uważać."
---

Jeden artykuł z 2021 roku, po angielsku, napisany po kilku miesiącach używania rekordów i nullable reference types. Pokazuje, gdzie zawodzą: wyrażenie with potrafi skopiować rekord do stanu, którego metoda fabrykująca by nie przepuściła, typ oznaczony jako niepusty nadal może dostać null, a zmiana kolejności pól po cichu psuje dekonstrukcję. Więcej kodu w C# znajdziesz pod tagami [.NET](/pl/articles/tag/net/) i [Event Sourcing](/pl/articles/tag/event-sourcing/).
