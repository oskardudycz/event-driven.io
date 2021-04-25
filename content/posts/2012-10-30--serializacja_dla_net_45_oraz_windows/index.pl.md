---
title: Serializacja dla .NET 4.5 oraz Windows Runtime przy pomocy Sharpserializer
category: ".NET"
cover: 2012-10-30-cover.png
author: oskar dudycz
disqusId: 19 http://oskar-dudycz.pl/2012/10/30/serializacja-dla-net-45-oraz-windows/
---

![cover](2012-10-30-cover.png)

Trochę mnie nie było, dawno już nie pisałem – ten post będzie dla mnie nietypowy – krótki. Mam nadzieję, że to będzie jego zaleta.

W swoim projekcie-po-godzinach do serializacji danych używam biblioteki [SharpSerializer](http://www.sharpserializer.com/en/index.html). Projekt ma środowiska klienckie napisane w Silverlight i Windows Phone. Nie ma w nich klasy BinaryFormatter przez co bez stosowania zewnętrznych bibliotek trzeba by stosować sztuczki z serializacją poprzez mechanizm DataContract z WCF (więcej szczegółów [na blogu Damona Payne'a](http://www.damonpayne.com/post/2010/05/24/DataContract-based-Binary-Serialization-for-Silverlight.aspx)). Nie jest to zbyt wygodne wg mnie.

SharpSerializer pozwala w prosty, wygodny i efektywny sposób serializować dane do postaci binarnej. 

Dlaczego tak nagle o tym piszę? W tym tygodniu zacząłem przenosić kod projektu na .NET 4.5 i Windows Runtime. Niestety nie zostały do tej pory wypuszczone wersje na te środowiska.

Na szczęście ze strony można ściągnąć kody źródłowe.

Pobrałem je, przekonwertowałem, poprawiłem część rzeczy, przekompilowałem i okazało się, że wszystko wygląda jakby działało.

Efekt moich prac możecie pobrać: [tutaj (src + dll)](http://joomanji.no-ip.org/blog/sharpSerializer.zip).

Więcej informacji na temat SharpSerializer pod linkami:
* http://www.sharpserializer.com/en/tutorial/index.html
* http://www.codeproject.com/Articles/76530/XML-Serialization-of-Generic-Dictionary-Multidimen
* http://www.codeproject.com/Articles/240621/How-to-serialize-data-effectively-Custom-serializa
* http://www.codeproject.com/Articles/116020/Binary-Serialization-to-Isolated-Storage-in-Silver

Zachęcam do zabawy z SharpSerializerem, naprawdę dobra biblioteka.
