---
title: Cierpienia niemłodego bloggera – czyli próbuję napisać tekst o wczytywaniu komponentów w Knockout.JS na podstawie konwencji nazewniczej. Wymyślając przy okazji najdłuższy wpis w historii tego bloga. Doh! -_-
category: "Java Script"
cover: 2015-12-07-cover.png
author: oskar dudycz
disqusId: 10 http://oskar-dudycz.pl/2015/12/07/cierpienia-niemodego-bloggera-czyli/
---

![cover](2015-12-07-cover.gif)


Życie bloggera to nie jest bułka z szynką. To nie prosta sprawa. Co prawda pomysły same wpadają do głowy. Idzie człowiek ulicą, drepcze tak sobie drepcze i nagle bęc, nagle bum! Albo koduje sobie taki, wymyśla rozwiązanie i myśli sobie: O! To świetny temat na blog! Warto się nim podzielić! Tylko potem to jakoś tak ciężko przelać na papier. Siada sobie Pan Redaktor. Zabiera się za spisanie swych wiekopomnych odkryć. Herbata stygnie, zapada zmrok a pod klawiaturą ciągle nic, obowiązek obowiązkiem jest, wpis musi posiadać tekst.

No i siadam. Klasyczne pytania. Jak zacząć? Jak Ciebie nie zanudzić, mój drogi czytelniku? Ej człowieku, pisz tam lepiej. Nie mazgaj się i tak piszesz dla siebie. Ale, ale… jak? To przecież nie ma być kolejny suchy, irytujący wpis jakich pełno w blogosferze. Chyba mnie grypa bierze…

Tyle rzeczy do przekazania… Tyle rzeczy do powiedzenia…

Może wspomnieć, że jest mi smutno, że Knockout.JS przegrał już jakiś czas temu walkę z Angularem? Albo, że wg mnie nie powinno się przenosić wprost backendowych wzorców do zupełnie innego środowiska JavaScriptu? 

Wspomnieć o tym, że nie mam zaufania do React? Że kojarzy mi się z programowaniem WinFormsowym? Hmmm…

A może po prostu wejść na pełnej k… i powiedzieć od razu, że mam świetną klasę, którą nazwałem [ComponentByNamingConventionLoader](https://github.com/oskardudycz/Knockout.ComponentByNamingConventionLoader/blob/master/src/content/Scripts/ComponentByNamingConventionLoader.js)? I że bierzcie i jedzcie z tego wszyscy? Dodać, że jeśli używacie Knockout.JS to na pewno Wam się przyda? Eeee… to jakoś nie wygląda… (Siorb) Ej! Herbata już całkiem zimna…

A może wrócić do podstaw? Może [rozprawkę](http://www.bryk.pl/jak_pisa%C4%87/rozprawka)? Wprowadzenie, teza, argument pierwszy, drugi, trzeci, czwarty, potwierdzenie tezy, podsumowanie. Ma to sens. Ma to sens. Wszystko byle już wreszcie zacząć. Ołówek, notatnik i jadziem kapela.


## Teeeee-za:
Warto jest pisać modularne aplikacje w Knockout. Warto też ułatwić sobie przy tym życie używając mechanizmu komponentów oraz konwencji nazewniczych.
Wężykiem Jasiu, wężykiem.


## Ar-gu-ment 1:
Knockout jest tylko i aż frameworkiem MVVM. To zaleta. Jest prosty i dzięki temu bardzo elastyczny. Dlaczego piłka nożna jest tak popularna? Bo ma proste zasady. Nawet Twoja dziewczyna wie co to spalony. Knockout nie ogranicza programisty, daje możliwość łatwej rozbudowy, łączenia z innymi bibliotekami. Np. dodając Sammy.JS i Require.JS mamy praktycznie lżejszego Angulara. Używając go nie musimy się zapisywać do sekty, w każdym momencie możemy go wymienić.


Gdzie ja dałem tę temperówkę… O jest.

## Argu-ment 2:
Modularność jest cool. Kiedyś myślałem, że generyczność. Naaah. Przyjdźcie na wystawę LEGO, na wrocławski stadion, to zobaczycie dlaczego (jest i rym a'la Rychu Peja). Podział aplikacji na moduły daje aplikacji skalowalność, łatwość rozwoju, ponownego wykorzystania kodu. Chcesz dorzucić kilka sposobów logowania? Żaden problem, zamienić jeden widok z drugim? Keine problem! Wpiąć zestaw Robin Hooda do zestawu Ninjago? Też się da.

## Ar-gu-meeent 3:
Komponenty w Knockout pozwalają tworzyć frontend w pełni modułowo. Czym one w ogóle są? Powiązanym ze sobą Widokiem i ViewModelem. Czyli pakiecikiem, który dostarcza zarówno logikę biznesową jak i formatę ją obsługującą – 2w1, Head&Shoulders. Powiązanie luźne jak nadgarstek nastolatka. Zgodne z zasadami SOLID. W dalszym ciągu widok nie musi za dużo wiedzieć o ViewModelu. I z wzajemnością.  Nie ma problemu z używaniem tych samych widoków i viewmodeli w różnych komponentach.

Już trzy? To mało? Dużo? A może w sam raz? W zasadzie każdy z argumentów to temat na osobny wpis. Może je napisać najpierw? Ech, ech.

## Ar-gument 4:
A po co ta moja wspaniała klasa skoro Knockout sam w sobie taki fajny? Komponenty w Knockout daje nam domyślny prosty i z grubsza spoko mechanizm wczytywania komponentów. Dodatkowo jego twórcy dali nam możliwość zmiany domyślnego mechanizmu, poprzez zdefiniowanie i podpięcie własnej klasy loadera.

Po co to robić? A np. dlatego, że mnie.:
* nie podoba się domyślna definicja komponentu przez podanie anonimowej klasy i kodu html bezpośrednio w defnicji komponentu

```javascript
ko.components.register('login-component', {
    viewModel: function(params) {
        this.username = ko.observable();
        this.password= ko.observable();
         
        this.login = function() { /* Login Logic */ };
    },
    template:
        '<input data-bind="text: username" type="text" />
         <input data-bind="text: password" type="password" />
         <button data-bind="click: login ">Log in!</button>'
});
```

* nie podoba mi się również alternatywna wersja, w której muszę umieszczać w ciele html głównej strony definicji widoku pomiędzy znacznikami &lt;template&gt; i muszę pamiętać, żeby załączyć plik z klasą viewmodelu do strony, lub co gorsza zdefiniować klasę na tej stronie.

```html
<template id="login-view">
    <input data-bind="text: username" type="text" />
    <input data-bind="text: password" type="password" />
    <button data-bind="click: login ">Log in!</button>
</template>

<script>
function LoginViewModel(params){
    this.username = ko.observable();
    this.password= ko.observable();
         
    this.login = function() { /* Login Logic */ };
}

ko.components.register('login-component', {
    viewModel: LoginViewModel,
    template: { element: 'login-view' },
});

</script>
```

Mam drobnomieszczańskie zwyczaje, ciepła woda w kranie, te sprawy. Ja to bym chciał po prostu podać nazwę komponentu, a niech już mechanizm sam sobie zaciągnie odpowiedni widok i viewmodel. Najlepiej po konwencji nazewniczej i najlepiej z odpowiedniego katalogu. 

Przykładowo chcę wyświetlić komponent: Login. 

Czy nie byłoby fajne gdyby Knockout sam sobie zaczytał:
* widok LoginView z lokalizacji: _Scripts/Components/Login/LoginView.html_,
* viewmodel  LoginViewModel z lokalicacji: _Scripts/Components/Login/LoginViewModel.js_?

Jak to zrobić? Użyć mojej wspaniałej klasy B-)

Uf. To argumenty mam za sobą. Co tam następne w planie rozprawki? Ach, wiem.

Potwierdzenie tezy

Co teraz? Detaliczny opis? Nudny listing? Może kod po prostu wkleić? Niech czytelnik ma szaradę. A może wzorem Makłowicza pokazać, że wystarczy wymyślić nazwę klasy, dopisać jedną metodę, odczekać chwilę i mamy gotową klasę na ponad 100 linii kodu? Wszystkiego po trochu?

Aby przeładować Knockoutowy mechanizm loaderów komponentów należy utworzyć klasę zawierającą następujące metody:
* _loadTemplate_ – gdy chcemy przeładować mechanizm pobierania widoku
* _loadViewModel_ – gdy chcemy przeładować mechanizm pobierania viewmodelu
* _getConfig_ – gdy chcemy przeładować wszystko. W-s-z-y-s-t-k-o.

Potem wystarczy taką klasę zarejestrować. Przykładzik:

```javascript
function ComponentByNamingConventionLoader(){
    this.loadTemplate = function(name, templateConfig, callback){
        // Logic
    }
    this.loadViewModel = function(name, viewModelConfig, callback){
        // Logic
    }
    this.config = function(name, callback){
        // Logic
    }
}
ko.components.loaders.unshift(new ComponentByNamingConventionLoader());
```

Założenia mojego loadera są tak jak wspomniałem:

1. Dać możliwość zaczytywania komponentów wg konwencji nazewniczych bez konieczności ich rejestracji. Ma to da możliwość eleganckiego rozbicia na osobne pliki i wygodę użycia.
2. Mechanizm ma dalej pozwalać na użycie klasycznego sposobu używania Knockouta.
3. Dodajemy też możliwość zdefiniowania pobierania widoków i viewmodeli z zadanego urla.  
 
Zatem do dzieła. Do kodu! Jak mówił Linus Torvalds: _"Talk is cheap. Show me the code."_.

**GetConfig**

Metoda przyjmuje dwa parametry: nazwę komponentu i callback, który wywoła mechanizmy Knockouta do dalszego procesowania konfiguracji. Funkcja najpierw sprawdza czy w ogóle powinna używać konwencji nazewniczej czy nie. Jeśli nie, to wywołuje domyślny mechanizm w przeciwnym razie odpala wczytywanie komponentów ze zmodyfikowaną konfiguracją podając ścieżkę do pliku na bazie konwencji nazewniczej.

```javascript
function getConfig(name, callback) {
    if (shouldUseNamingConventionForComponent(name)) {
        callDefaultBehaviour(callback);
        return;
    }
        
    callback({
        template: { fromUrl: getViewPathFromComponentName(name)},
        viewModel: { fromUrl: getViewModelPathFromComponentName(name) }
    });
}
```

**LoadViewModel**

Metoda przyjmuje trzy parametry: nazwę komponentu, obiekt z konfiguracją ViewModelu oraz callback. Obiekt z konfiguracją będzie wyglądał  np.  

```javascript
{name: 'NameOfAClass'} 
```

lub w naszym przypadku 

```javascript
{ fromUrl: '/Scripts/Components/ComponentName/ComponentNameViewModel'}
```

Zasada działania jest analogiczna jak GetConfig. Sprawdzamy czy powinniśmy w ogóle używać konwencji nazewniczych czy nie i w zależności od tego wywołujemy domyślne zachowanie lub nasze zaczytywanie z pliku.

```javascript
function loadViewModel(name, viewModelConfig, callback) {
    if (!shouldUseNamingConventionForViewModel(viewModelConfig)) {
        callDefaultBehaviour(callback);
        return;
    }

    var url = viewModelConfig.fromUrl || getViewPathFromComponentName(name);

    loadViewModelFromUrl({
        name: name,
        relativeUrl: url,
        maxCacheAge: viewModelConfig.maxCacheAge,
        callback: callback
    });
}
```

**LoadTemplate**

No tego to nie będę tłumaczył. Analogicznie jak LoadViewModel tylko dla pliku html.

```javascript
function loadTemplate(name, templateConfig, callback) {
    if (!shouldUseNamingConventionForView(templateConfig)) {
        callDefaultBehaviour(callback);
        return;
    }

    var url = templateConfig.fromUrl || getViewPathFromComponentName(name);

    loadViewFromUrl({
        name: name,
        relativeUrl: url,
        maxCacheAge: templateConfig.maxCacheAge,
        callback: callback
    });
}
```

Jak widać sam algorytm jest bardzo prosty i zrobiony przez analogię. Dobra Makłowicz, a jak wyglądają implementacje kluczowych metod? Niewiele trudniej.

**LoadViewFromUrl**

Dzięcioł jaki jest każdy widzi. Preparujemy url poprzez dodanie prefiksu do ścieżki i sufiksu z ustawieniami cache'owania strony (w celach optymalizacji). Potem wywołujemy pobranie pliku poprzez jQuery‘owy $.get, a pobrany html wstrzykujemy do Knockouta przy pomocy wbudowanej metody. Jeśli coś poszło nie tak – wywołujemy domyślny mechanizm.

```javascript
var componentsPrefix = "Scripts/Components/";

function loadViewFromUrl(options) {
    var fullUrl = componentsPrefix + options.relativeUrl + "?cacheAge=" + (options.maxCacheAge || 1234);

    $.get(fullUrl, function (markupString) {
        ko.components.defaultLoader.loadTemplate(options.name, markupString, options.callback);
    }).fail(function () {
        callDefaultBehaviour(callback);
    });
}
```

**LoadViewModelFromUrl**

Metoda jest bardzo zbliżona do wczytywania widoku, z tym, że zamiast zwykłego $.get używamy [zmodyfikowanej metody $.getScript – $.cachedScript](http://stackoverflow.com/a/23435602), która pozwala zaciągnąć kod JS z zewnętrznego pliku i wczytać go do przeglądarki (używając przy tym cache). 

Potem są robione dwa triki:
– _window[getViewModelNameFromUrl(options.relativeUrl)]_ – pobieranie konstruktora klasy ViewModelu po jego nazwie. W JavaScript wszystkie definicje klas są dostępne jako propertiesy, można się odwołać do niego poprzez klasyczny indekser na obiekcie okna – np. window["LoginViewModel"]
– drugi trick to metoda viewModelInitialization, która tworzy nam najpierw obiekt ViewModelu (na bazie zaczytanego konstruktora). Sprawdza czy ma on dostępną metodę "init". Jeśli ma to pozwala uruchamia ją z przesłanymi  parametrami. Taki ficzer.

```javascript
function loadViewModelFromUrl(options) {
    var fullUrl = componentsPrefix + options.relativeUrl;

    $.cachedScript(fullUrl)
        .done(function () {
            var viewModelConstructor = window[getViewModelNameFromUrl(options.relativeUrl)];

            var viewModelInitialization = function (data) {
                var viewModel = new viewModelConstructor();

                if (viewModel.init)
                    viewModel.init(data);

                return viewModel;
            };

            ko.components.defaultLoader.loadViewModel(options.name, viewModelInitialization, options.callback);
        }).fail(function () {
            callDefaultBehaviour(options.callback);
        });
    }
}
```

No i to by było na tyle. Reszta to proste metody pomocnicze. Chcesz je zobaczyć? A może pełen kod? Kliknij [tu, no kliknij](https://github.com/oskardudycz/Knockout.ComponentByNamingConventionLoader/blob/master/src/content/Scripts/ComponentByNamingConventionLoader.js).

Podoba Ci się i chciałbyś to użyć w swoim projekcie? Pobierz [nugeta](https://www.nuget.org/packages/Knockout.ComponentByNamingConventionLoader/). Autor nawet nieśmiało zachęca do krytyki i pull requestów.

No i niby rozprawka cała, podsumowania tylko brak. Wpis taki długi, ozdobników tak wiele, pewnie się znudzili, pewnie wymiękli. A chciałoby się wytrwałych zapytać czy wierzą już redaktorowi:
* że komponenty w Knockout pozwalają robić fajny, modularny frontend, 
* że są łatwe w użyciu, 
* że faktycznie ułatwiają pracę, a sam Knockout pozwala się łatwo rozszerzać,
* że użycie wymyślonej przez niego klasie może się czytelnikowi przydać w ułożeniu kodu i przyspieszeniu developmentu.

Nawet jakby przecząco pokręcił głową to można by się nieśmiało obronić garścią linków:
* http://knockoutjs.com/documentation/component-binding.html
* http://knockoutjs.com/documentation/component-loaders.html
* http://www.knockmeout.net/2014/06/knockout-3-2-preview-components.html 
* https://javascriptkicks.com/articles/2657/i-wont-be-using-angular-for-my-next-project-and-neither-should-you

Pisać nie pisać? Publikować nie publikować?  

Rzucę monetą.

Orzeł.      