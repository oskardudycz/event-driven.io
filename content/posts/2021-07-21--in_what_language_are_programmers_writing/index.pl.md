---
title: In what language are programmers writing?
category: "Coding Life"
cover: 2021-07-21-cover.png
author: oskar dudycz
---

![cover](2021-07-21-cover.png)

[Wikipedia states](https://en.wikipedia.org/wiki/List_of_programming_languages) that there are around 700 programming languages. Some are more popular. Some are less. But what language do programmers write in? 

When I started my career (which was over 14 years ago), the most popular language for Polish programmers wrote was Ponglish. Ephemeral programming language. People were writing in Java, C#, etc., but typing names in Ponglish. Let's start with a Polish language lesson:
- _nazwa_ - name,
- _Użytkownik_ - user,
- _Czy użytkownik jest adminem?_ - Is the user an admin?
- _hasło_ - password,
- _pracownik_ - employee.

It was quite common to mix the Polish language with English suffixes forming names like 
- _OnNazwaUżytkownikaClick_, 
- _SelectImieUzytkownika_, 
- _ClickCzyJestAdminemCheckbox_.
- _readHaslo_

It wasn't a pleasure to read such a code. It doesn't look charming, but it was due to several things:
- much weaker knowledge of the English language than now,
- foreign projects were much rarer than they are now, 
 -most of the clients were Polish companies.

On the one hand, programmers wanted to write in Polish, and on the other, stick to the convention of the programming language/framework, which was of the OnSomethingClick, SelectSomething type.

Usually, after joining the project and seeing such code, my reaction was: "Hold me, I won't bear that!". I was then trying to get rid of that. Currently, it is rare to find a project where the code is not written in English. And that's cool, but recently I started to think if it's accurate.

The main idea behind the Domain-Driven Design is _"ubiquitous language"._ It states that we should speak the same language as business people. That also includes naming our classes and methods according to the terms used by the business. If our client uses the term _"sending parcel", we should use it and not replace it with, e.g. _"ship package"_.  If they name _"order" a _"task"_ or a _"job"_ we should also adopt it. That's cool, but how to match it all to our code when we have a Polish client? Typically you try to map it to the English name. But then there we have a question if for _"pracownik"_ more appropriate is _"employee"_ or _"worker"_.  We may lose a lot of nuances while doing that mapping. Those nuances are usually keys to understanding business. Plus, we always need to do mental gymnastics to translate the naming back and forth while speaking to business or reading documentation written in our native language. Of course, we can build a terms dictionary translating from one language to another, but isn't that contrary to the ubiquitous language idea? I had multiple cases in past, where:
- translation popped out in the discussions with the business. That created a lot of confusion because the business didn't know what devs were talking about.
- devs trying to persuade the business to use their English translations to "make communication easier".
- different naming of the same terms coming from other people doing different translations.
- mistakes and bugs because of the misunderstanding around translations.

Anglo-Saxons have a lot easier since most programming languages ​​and the initial development of computers was mainly in the US. English has become the "lingua franca".  Domain-Driven Design is more accessible as you're using precisely the terminology that business operates. For non-native speakers, it will always be the art of compromise. Additionally, due to blogs, reading entries, which are usually in English, the code written in Polish seems to us ...strange? We could try not to mix English with our native naming. Instead of _IsUzytkownikAdminem_, we could write _CzyUzytkownikJestAdminem`_. But then we'll have to mix it with the programming keywords that originate from English. Not to mention the fact that in Polish and many other languages [we have vowels](https://en.wikipedia.org/wiki/Polish_phonology). The handling of Unicode characters is still lame (create an email in Microsoft365 using any of the letters _ąęśćźó_, and you'll cry).

Is it only a Polish issue? It's not. We're not unique. I saw a few German projects with the code written in the German language. I also saw comments written in Cyrillic or Arabic. So is it so wrong to mix languages? I don't know. I think that it's worth at least considering. If we have a business team speaking our native language, we could try to write in our language and assess how strange it feels. Of course, we shouldn't write _"OnUzytkownikSelected"_, but _"CzyUzytkownikJestAdminem"_. It can help us use the business language better and make it easier to convey and understand what we are doing. It would definitely be an interesting sociological/psychological experiment.

I do not have an established opinion yet. I have mixed feelings. I am curious about your opinion on this subject. What do you think?

Cheers!

Oskar