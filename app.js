const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const CART_KEY = "paradiso_cart_v1";
const THEME_KEY = "paradiso_theme";

const image = (name) => `assets/images/${name}.jpg`;
const item = (name, price, description, photo) => ({ name, price, description, image: image(photo) });
const customItem = (name, price, description, image) => ({ name, price, description, image });
const cocktail = (name, price, description, photo = "negroni") => item(name, price, description, photo);
const bottle = (name, price, description, photo) => ({
  name,
  price,
  description,
  image: `assets/images/bottles-studio/${photo}.png`,
});
const galleryDrink = (photo) => `assets/gallery/photos/IMG-20260721-WA${photo}.webp`;
const wine = (name, price, description, photo) => customItem(name, price, description, galleryDrink(photo));

const partyServices = [
  item("Festa bimbi", 8, "Servizio feste per bambini come da listino.", "lunch"),
  item(
    "Apericena gruppi",
    18,
    "Per gruppi di oltre 10 persone, prezzo a persona con una consumazione inclusa. Menu: riso freddo o pasta fredda, focaccia, pizza, affettati e formaggi, nuggets o ali di pollo, patatine fritte e würstel, crocchette di patate in varie opzioni e paninetti salati farciti. In omaggio dal locale: una bottiglia di prosecco oppure un analcolico da 3 litri.",
    "hero"
  ),
  item("Tagliere pizza compleanno", 20, "Tagliere pizza per la festa di compleanno.", "lunch"),
  item("Taglio torta", 1.5, "Prezzo a persona, con piattini e forchette forniti dal locale.", "breakfast"),
];

const coffeeProducts = [
  ["Caffè freddo", 4.5], ["Caffè fuori sera", 2], ["Espresso", 1.2],
  ["Caffè macchiato", 1.3], ["Caffè doppio", 2.4], ["Caffè Americano", 1.8],
  ["Caffè corretto", 1.5], ["Caffè decaffeinato", 1.3], ["Caffè shakerato", 3.5],
  ["Caffè shakerato con Baileys", 4], ["Cappuccino", 1.5],
  ["Cappuccino al ginseng o orzo", 2], ["Cappuccino scuro", 2],
  ["Cappuccino alla soia", 1.8], ["Cioccolata calda", 3],
  ["Cioccolata con panna", 3.5], ["Crema caffè", 3.5],
  ["Crema caffè con panna e Nutella", 5], ["Ginseng grande", 1.8],
  ["Ginseng piccolo", 1.5], ["Latte bianco", 1.3], ["Latte e menta", 1.5],
  ["Latte macchiato", 1.6], ["Latte macchiato alla soia", 1.8],
  ["Limonata", 2], ["Macchiatone", 1.5], ["Marocchino", 1.5],
  ["Marocchino grande", 3], ["Marocchino alla Nutella", 2],
  ["Orzo grande", 1.8], ["Orzo piccolo", 1.5], ["Spremuta d'arancia", 4],
  ["Spremuta al melograno", 5], ["Tè caldo", 2.5],
];

const pastryProducts = [
  ["Cornetto", 1.5], ["Cornetto con la frutta", 2.5], ["Cappuccino e cornetto", 3.5],
  ["Biscotti grandi", 2], ["Biscotti mimosa", 4.5], ["Biscotti piccoli", 1],
  ["Biscotti senza glutine", 2], ["Brioche ai cereali", 1.3],
  ["Brioche vegana", 1.3], ["Brioche vuota", 1.2], ["Brioche Dubai", 2],
  ["Brioche Kinder", 2.5], ["Brioche alla mela", 2.5],
  ["Brioche all'albicocca", 1.5], ["Brioche al cioccolato bianco", 1.5],
  ["Brioche alla crema", 1.5], ["Brioche alla fragola", 1.5],
  ["Brioche ai frutti di bosco", 1.5], ["Brioche mignon", 0.8],
  ["Brioche mignon farcita", 1], ["Brioche alla nocciola", 1.5],
  ["Brioche alla Nutella", 1.5], ["Brioche al pistacchio", 1.8],
  ["Cannoli siciliani", 3], ["Cannoncini", 1], ["Ciambella", 2],
  ["Ciambella torta", 2], ["Ciambelline", 1], ["Dolce senza glutine", 2.5],
  ["Frappè piccolo", 5], ["Frappè grande", 6.5], ["Girella", 2.5],
  ["Girella all'uva", 2], ["Macarons", 1.5], ["Mini Sacher", 1.5],
  ["Muffin", 2.5], ["Muffin grande", 2.5], ["Pancake con Nutella", 3],
  ["Pancake Nutella e fragole", 3.5], ["Sacher grande", 4.5],
  ["Sfogliatelle", 1], ["Treccia", 2],
];

const savoryProducts = [
  ["Brioche salata", 3], ["Fagottino patatine e wurstel", 2.5], ["Focaccia", 5],
  ["Focaccia e pizzette", 1.5], ["Maxi panzerotto", 3.5], ["Mini pizzette", 0.8],
  ["Panino classico", 5], ["Panino con cotoletta", 6.5], ["Piadina", 6],
  ["Toast classico", 5], ["Trancio", 5],
];

const gelatoProducts = [
  ["Coppa Rica Amarena", 2.5], ["Cornetto Amarena", 2.7], ["Cornetto Classico", 2.5],
  ["Cornetto mini", 2], ["Cornetto XXL", 2.7], ["Cremino", 1.8],
  ["Cucciolone Bikini senza glutine e senza lattosio", 2.3], ["Cucciolone Maxi", 2.3],
  ["Frigo Chuches", 2.2], ["Ghiacciolo", 1], ["Magnum Almond", 2.6],
  ["Magnum Bianco", 2.6], ["Magnum Classico", 2.6], ["Magnum Michelangelo", 2.8],
  ["Treasure Baule", 1.7],
];

const menus = {
  day: {
    title: "Menu del giorno",
    intro: "Colazioni curate e proposte semplici per la pausa pranzo.",
    heroCopy: "Colazioni e pausa pranzo nel cuore di Nova Milanese.",
    heroLabel: "Scopri il menu",
    heroImage: "assets/gallery/photos/IMG-20260721-WA0222.webp",
    heroAlt: "L'ingresso e il giardino del Paradiso Lounge Bar",
    heroPosition: "center 53%",
    heroPositionMobile: "58% center",
    categories: {
      caffetteria: {
        label: "Caffetteria",
        items: coffeeProducts.map(([name, price]) =>
          item(name, price, "Preparazione al banco, come da listino.", "breakfast")
        ),
      },
      pasticceria: {
        label: "Pasticceria",
        items: pastryProducts.map(([name, price]) =>
          item(name, price, "Dolce da banco, secondo disponibilità.", "breakfast")
        ),
      },
      "sfizi-salati": {
        label: "Sfizi salati",
        items: savoryProducts.map(([name, price]) =>
          item(name, price, "Preparato o scaldato al momento, secondo disponibilità.", "lunch")
        ),
      },
      bibite: {
        label: "Bibite",
        items: [
          item("Acqua", 1, "Naturale o frizzante.", "breakfast"),
          item("Bibita in lattina", 3, "Chiedi le disponibilità del giorno.", "breakfast"),
          item("Succo di frutta", 3, "Diversi gusti disponibili.", "breakfast"),
          item("Tè freddo", 3, "Limone o pesca.", "breakfast"),
        ],
      },
      gelati: {
        label: "Gelati",
        items: gelatoProducts.map(([name, price]) =>
          item(name, price, "Gelato confezionato, servito ben freddo.", "breakfast")
        ),
      },
      tessere: {
        label: "Tessere",
        items: [
          item("Tessera caffè", 11, "Formula prepagata per i tuoi caffè al Paradiso.", "breakfast"),
          item("Tessera cappuccino", 15, "Formula prepagata dedicata al cappuccino.", "breakfast"),
          item("Tessera cappuccino e brioche", 30, "Colazione completa in formula prepagata.", "breakfast"),
          item("Tessera spremuta", 40, "Formula prepagata per spremute fresche.", "breakfast"),
          item("Tessera Ginseng o Orzo grande", 15, "Formula prepagata, formato grande.", "breakfast"),
          item("Tessera Ginseng o Orzo piccolo", 13, "Formula prepagata, formato piccolo.", "breakfast"),
        ],
      },
      servizi: {
        label: "Servizi feste",
        items: partyServices,
      },
    },
  },
  night: {
    title: "Menu della sera",
    intro: "Cocktail, gin, birre e distillati per vivere il Paradiso dopo il tramonto.",
    heroCopy: "Aperitivi, cocktail e serate a Nova Milanese.",
    heroLabel: "Scopri la sera",
    heroImage: "assets/gallery/photos/IMG-20260721-WA0220.webp",
    heroAlt: "Il bancone serale del Paradiso Lounge Bar illuminato in blu",
    heroPosition: "center 52%",
    heroPositionMobile: "48% center",
    categories: {
      cocktail: {
        label: "Cocktail",
        items: [
          cocktail("Boulevardier", 8, "Ingredienti: bourbon o rye whiskey, Campari, vermouth rosso dolce e scorza d'arancia."),
          cocktail("Caipiroska", 8, "Ingredienti: vodka, lime fresco a spicchi, zucchero di canna e ghiaccio tritato.", "mojito"),
          cocktail("Caipiroska alla fragola", 7, "Ingredienti: vodka, lime fresco, fragole, zucchero di canna e ghiaccio tritato.", "mojito"),
          cocktail("Cuba Libre chiaro", 6, "Ingredienti: rum bianco, Coca-Cola, succo di lime fresco e ghiaccio.", "negroni"),
          cocktail("Cuba Libre scuro", 7, "Ingredienti: rum scuro, Coca-Cola, succo di lime fresco e ghiaccio.", "negroni"),
          cocktail("Cuba Zombie", 8, "Ingredienti: rum bianco, rum scuro, lime, ananas, granatina e bitter aromatico.", "spritz"),
          cocktail("Daiquiri", 8, "Ingredienti: rum bianco, succo di lime fresco e sciroppo di zucchero.", "mojito"),
          cocktail("Disaronno Red Bull o Coca-Cola", 7, "Ingredienti: Disaronno, Red Bull oppure Coca-Cola e ghiaccio.", "negroni"),
          cocktail("Disaronno Sour", 7, "Ingredienti: Disaronno, succo di limone fresco, sciroppo di zucchero e albume pastorizzato.", "negroni"),
          cocktail("Disaronno Tè", 7, "Ingredienti: Disaronno, tè freddo al limone, succo di limone e ghiaccio.", "spritz"),
          cocktail("Drink premium", 10, "Ingredienti: distillato premium scelto al momento, mixer abbinato, ghiaccio e guarnizione dedicata.", "negroni"),
          cocktail("Gin Lemon Base", 6, "Ingredienti: gin, lemon soda, ghiaccio e fetta di limone.", "gin"),
          cocktail("Gin Tonic Base", 6, "Ingredienti: gin, acqua tonica, ghiaccio e scorza di limone.", "gin"),
          cocktail("Hugo", 8, "Ingredienti: prosecco, sciroppo di sambuco, soda, menta fresca, lime e ghiaccio.", "spritz"),
          cocktail("Jack Red Bull o Coca-Cola", 6, "Ingredienti: Jack Daniel's, Red Bull oppure Coca-Cola e ghiaccio.", "negroni"),
          cocktail("Japanese", 8, "Ingredienti: cognac, sciroppo d'orzata, bitter aromatico e scorza di limone.", "espresso-martini"),
          cocktail("Long Island", 8, "Ingredienti: vodka, gin, rum bianco, tequila, triple sec, limone, sciroppo di zucchero e Coca-Cola.", "negroni"),
          cocktail("Malibu Sambuca", 6, "Ingredienti: Malibu al cocco, sambuca e ghiaccio.", "spritz"),
          cocktail("Margarita", 8, "Ingredienti: tequila, triple sec, succo di lime fresco e sale sul bordo.", "mojito"),
          cocktail("Martini", 8, "Ingredienti: gin, vermouth dry e oliva oppure scorza di limone.", "espresso-martini"),
          cocktail("Espresso Martini", 8, "Ingredienti: vodka, liquore al caffè, espresso, sciroppo di zucchero e chicchi di caffè.", "espresso-martini"),
          cocktail("Mojito", 8, "Ingredienti: rum bianco, lime, menta fresca, zucchero bianco, soda e ghiaccio tritato.", "mojito"),
          cocktail("Moscow Mule", 8, "Ingredienti: vodka, ginger beer, succo di lime fresco e ghiaccio.", "mojito"),
          cocktail("Negroni", 8, "Ingredienti: gin, Campari e vermouth rosso dolce in parti uguali, con scorza d'arancia.", "negroni"),
          cocktail("Paloma", 6, "Ingredienti: tequila, soda al pompelmo rosa, succo di lime, un pizzico di sale e ghiaccio.", "spritz"),
          cocktail("Piña Colada", 8, "Ingredienti: rum bianco, crema di cocco, succo d'ananas e ghiaccio.", "spritz"),
          cocktail("Pornstar Martini", 7, "Ingredienti: vodka alla vaniglia, liquore e purea di passion fruit, lime, sciroppo di vaniglia e prosecco a parte.", "espresso-martini"),
          cocktail("Sambuca Vodka", 6, "Ingredienti: vodka, sambuca e ghiaccio.", "negroni"),
          cocktail("Sangria", 4, "Ingredienti: vino rosso, brandy, arancia, limone, frutta fresca, zucchero e soda.", "spritz"),
          cocktail("Sbagliato", 8, "Ingredienti: Campari, vermouth rosso dolce, prosecco e fetta d'arancia.", "spritz"),
          cocktail("Sex on the Beach", 7, "Ingredienti: vodka, liquore alla pesca, succo d'arancia e succo di cranberry.", "spritz"),
          cocktail("Spritz Aperol", 6, "Ingredienti: prosecco, Aperol, soda, ghiaccio e fetta d'arancia.", "spritz"),
          cocktail("Spritz Campari", 6, "Ingredienti: prosecco, Campari, soda, ghiaccio e fetta d'arancia.", "spritz"),
          cocktail("Vodka Lemon Base", 6, "Ingredienti: vodka, lemon soda, ghiaccio e fetta di limone.", "mojito"),
          cocktail("Vodka Premium", 10, "Ingredienti: vodka premium, mixer scelto al momento, ghiaccio e guarnizione abbinata.", "negroni"),
          cocktail("Vodka Red Bull", 6, "Ingredienti: vodka, Red Bull e ghiaccio.", "negroni"),
          cocktail("Vodka Sour", 7, "Ingredienti: vodka, succo di limone fresco, sciroppo di zucchero e albume pastorizzato.", "mojito"),
          cocktail("Vodka Tonic Base", 6, "Ingredienti: vodka, acqua tonica, ghiaccio e scorza di limone.", "gin"),
          cocktail("Jäger Red Bull", 6, "Ingredienti: Jägermeister, Red Bull e ghiaccio.", "negroni"),
        ],
      },
      bottiglie: {
        label: "Bottiglie",
        items: [
          bottle("Clase Azul", 500, "Bottiglia da riservare al tavolo.", "clase-azul"),
          bottle("Shot Clase Azul", 30, "Servizio shot come indicato nel listino.", "clase-azul"),
          bottle("Don Papa Baroko", 180, "Rum premium in bottiglia.", "don-papa"),
          bottle("Jack Daniel's", 150, "Whiskey Tennessee in bottiglia.", "jack-daniels"),
          bottle("Keglevich Fragola", 100, "Vodka aromatizzata in bottiglia.", "keglevich-fragola"),
          bottle("Keglevich Pesca", 100, "Vodka aromatizzata in bottiglia.", "keglevich-pesca"),
          bottle("Alkkemist Gin", 180, "Gin premium in bottiglia.", "alkkemist"),
          bottle("Amuerte Coca Gin", 180, "Gin premium in bottiglia.", "amuerte"),
          bottle("Hendrick's Grand Cabaret con tonica", 100, "Bottiglia con tonica inclusa.", "hendricks-cabaret"),
          bottle("Nordés con toniche", 150, "Bottiglia di gin con toniche incluse.", "nordes-bottle"),
          bottle("Bombay Sapphire con toniche", 120, "Bottiglia di gin con toniche incluse.", "bombay-bottle"),
          bottle("Gin Mare con toniche", 140, "Bottiglia di gin con toniche incluse.", "gin-mare-bottle"),
          bottle("Grey Goose", 150, "Vodka premium in bottiglia.", "grey-goose"),
          bottle("Belvedere con 4 bibite", 100, "Vodka premium con quattro bibite incluse.", "belvedere"),
          bottle("Absolut Vodka", 120, "Vodka in bottiglia.", "absolut"),
          bottle("Veuve Clicquot", 130, "Champagne in bottiglia.", "veuve-brut"),
          bottle("Bellavista", 70, "Franciacorta in bottiglia.", "bellavista"),
          bottle("Berlucchi Cuvée Imperiale", 70, "Franciacorta brut in bottiglia.", "berlucchi"),
          bottle("Prosecco", 20, "Prosecco in bottiglia.", "valdo"),
          bottle("Moët Rosé", 180, "Champagne rosé in bottiglia.", "moet-nir"),
          wine("Veuve", 100, "Champagne in bottiglia.", "0074"),
          bottle("Moët Bianco", 180, "Champagne demi-sec in bottiglia.", "moet-ice"),
          bottle("Moët", 150, "Champagne brut in bottiglia.", "moet-brut"),
          bottle("Lanson White Label", 120, "Champagne in bottiglia.", "lanson"),
          bottle("Monte Rossa Blanc de Blancs", 100, "Franciacorta in bottiglia.", "monterossa-blanc"),
          bottle("Dom Pérignon 2012", 500, "Prezzo promozionale indicato nel listino.", "dom-perignon-2012"),
          bottle("Cristal Louis Roederer", 450, "Prezzo promozionale indicato nel listino.", "cristal"),
          bottle("Krug Grande Cuvée", 450, "Prezzo promozionale indicato nel listino.", "krug"),
          bottle("Dom Pérignon 2013", 400, "Prezzo promozionale indicato nel listino.", "dom-perignon-2013"),
          wine("Amarone", 40, "Vino rosso in bottiglia.", "0159"),
          wine("Astoria", 40, "Spumante in bottiglia.", "0165"),
          wine("Bottiglia vino della casa", 25, "Bottiglia secondo disponibilità.", "0166"),
          wine("Calice", 5, "Calice di vino della casa.", "0157"),
          wine("Calice Gewürztraminer", 6, "Calice di Gewürztraminer.", "0157"),
          wine("Champagne", 150, "Champagne in bottiglia.", "0075"),
          wine("D'Armanville Rosé", 80, "Champagne rosé in bottiglia.", "0075"),
          bottle("Don Julio", 550, "Tequila premium in bottiglia.", "clase-azul"),
          bottle("Dom Pérignon 2015", 300, "Champagne in bottiglia.", "dom-perignon-2012"),
          wine("Gewürztraminer", 30, "Vino bianco aromatico in bottiglia.", "0159"),
          wine("Gin base e bibite", 50, "Gin base con bibite incluse.", "0215"),
          wine("H. Blin Champagne", 80, "Champagne in bottiglia.", "0167"),
          wine("H. Blin Rosé", 80, "Champagne rosé in bottiglia.", "0168"),
          wine("Lugana", 40, "Vino bianco in bottiglia.", "0162"),
          wine("Offerta 2 calici", 7, "Due calici di vino in offerta.", "0177"),
          wine("Prosecco Millesimato", 30, "Prosecco millesimato in bottiglia.", "0166"),
          wine("Ribolla", 30, "Vino bianco in bottiglia.", "0165"),
          wine("Rosé", 35, "Vino rosé in bottiglia.", "0075"),
          wine("Vino bianco", 35, "Vino bianco in bottiglia.", "0162"),
        ],
      },
      gin: {
        label: "Gin",
        items: [
          ["Amuerte", 13, "assets/images/bottles-studio/amuerte.png"],
          ["Aviation", 8, galleryDrink("0014")],
          ["Ballykeefe", 12, galleryDrink("0018")],
          ["Base Gordon's", 6, galleryDrink("0022")],
          ["Base Mr. Higgins", 6, galleryDrink("0024")],
          ["Bombay", 8, "assets/images/bottles-studio/bombay-bottle.png"],
          ["Brockmans", 10, galleryDrink("0029")],
          ["Bulldog", 10, galleryDrink("0052")],
          ["Dolcevita", 8, galleryDrink("0059")],
          ["Engine", 10, galleryDrink("0060")],
          ["Fifty Pounds", 10, galleryDrink("0061")],
          ["Gin Mare", 10, "assets/images/bottles-studio/gin-mare-bottle.png"],
          ["Hendrick's", 10, "assets/images/bottles-studio/hendricks-cabaret.png"],
          ["Hendrick's Viola", 13, galleryDrink("0062")],
          ["Hendrick's Amazonia", 13, galleryDrink("0063")],
          ["Lola Vera", 10, galleryDrink("0070")],
          ["Malfy", 10, galleryDrink("0071")],
          ["Monkey", 15, galleryDrink("0074")],
          ["Nordés", 10, "assets/images/bottles-studio/nordes-bottle.png"],
          ["Portofino", 12, galleryDrink("0075")],
          ["Rena 41", 10, galleryDrink("0080")],
          ["Rivo", 10, galleryDrink("0081")],
          ["Royal Windsor", 12, galleryDrink("0091")],
          ["Santamania", 8, galleryDrink("0102")],
          ["Santana", 10, galleryDrink("0103")],
          ["Tanqueray", 8, galleryDrink("0107")],
        ].map(([name, price, image]) => ({
          name,
          price,
          description: "Servito con tonica e guarnizione selezionata.",
          image,
        })),
      },
      aperitivo: {
        label: "Aperitivo",
        items: [
          item("Bitter pompelmo", 5, "Aperitivo analcolico al pompelmo.", "spritz"),
          item("Buffet drink", 10, "Drink con formula buffet.", "spritz"),
          item("Campari con bianco", 5, "Campari servito con vino bianco.", "spritz"),
          item("Campari Soda", 3.5, "Il classico aperitivo Campari Soda.", "spritz"),
          item("Crodino", 4, "Aperitivo analcolico.", "spritz"),
          item("Offerta Spritz", 3.5, "Spritz in offerta come da listino.", "spritz"),
          item("Tagliere", 4, "Piccolo accompagnamento salato.", "lunch"),
          item("Tagliere base", 10, "Selezione salata da condividere.", "lunch"),
          item("Tagliere premium", 13, "Selezione premium da condividere.", "lunch"),
        ],
      },
      birre: {
        label: "Birre",
        items: [
          ["Birra in bottiglia", 3.5], ["Birra media e trancio", 8], ["Birra spina media", 5],
          ["Birra spina piccola", 3], ["Ceres", 4], ["Corona", 4], ["Guinness", 8],
          ["Heineken", 3.5], ["Ichnusa", 4], ["Ichnusa 50 cl", 4], ["Moretti grande", 4],
          ["Panaché", 5], ["Paulaner", 4.5], ["Tennent's", 4],
        ].map(([name, price]) => item(name, price, "Servita fredda.", "beer")),
      },
      whisky: {
        label: "Whisky e brandy",
        items: [
          ["Ballantine's", 5], ["Chivas 12", 8], ["Cognac", 6], ["Don Papa", 8],
          ["J&B", 5], ["Jack Daniel's", 5], ["Johnnie Walker Red Label", 5], ["Laphroaig", 7],
          ["Revel Stoke Spiced", 5], ["Stravecchio Branca", 5],
        ].map(([name, price]) => item(name, price, "Servito liscio o con ghiaccio.", "gin")),
      },
      amari: {
        label: "Amari",
        items: [
          ["Amaro Cenote", 12], ["Amaro del Capo", 4], ["Amaro Don Julio", 12], ["Amaro Gin", 5],
          ["Amaro Lucano", 4], ["Assenzio", 4], ["Averna", 4], ["Baileys", 4],
          ["Branca Menta", 4], ["Braulio", 4], ["Chupito", 3], ["Chupito Cenote", 4],
          ["Chupito Premium", 6], ["Disaronno", 4], ["Fernet Branca", 4], ["Herbas", 8],
          ["Jägermeister", 4], ["Jameson", 4], ["Jefferson", 5], ["Limoncello", 4],
          ["Monte doppio", 8], ["Montenegro", 4], ["Sambuca", 4], ["Shot", 2],
          ["Vecchia Romagna", 4], ["Vodka", 4],
        ].map(([name, price]) => item(name, price, "Servito liscio o con ghiaccio.", "gin")),
      },
      snack: {
        label: "Snack",
        items: [
          item("Bueno", 2, "Wafer croccante ripieno di crema alla nocciola e ricoperto di cioccolato.", "lunch"),
          item("Caramelle singole", 0.2, "Caramelle assortite vendute singolarmente; gusti disponibili al banco.", "lunch"),
          item("Chupa Chups", 0.5, "Lecca-lecca alla frutta o alla cola; scegli il gusto disponibile.", "lunch"),
          item("Cicche pacchetto", 2.5, "Confezione di gomme da masticare; marca e gusto secondo disponibilità.", "lunch"),
          item("Cicche singole", 1.2, "Gomme da masticare vendute singolarmente, in gusti assortiti.", "lunch"),
          item("Ciuccio", 2, "Caramella gommosa a forma di ciuccio, dolce o frizzante secondo disponibilità.", "lunch"),
          item("Frisk", 1, "Piccole mentine pressate dal gusto fresco e intenso.", "lunch"),
          item("Goleador", 0.2, "Doppia caramella gommosa venduta singolarmente, nel gusto disponibile al banco.", "lunch"),
          item("Golia", 2.5, "Pastiglie balsamiche alla liquirizia, disponibili nella confezione del giorno.", "lunch"),
          item("Golia Immuno", 5, "Caramelle gommose con vitamine e ingredienti funzionali, nella variante disponibile.", "lunch"),
          item("Mentos", 1.8, "Confetti gommosi in rotolo; gusto menta o frutta secondo disponibilità.", "lunch"),
          item("Patatine grandi", 2.5, "Confezione grande di patatine croccanti; gusto disponibile al banco.", "lunch"),
          item("Patatine piccole", 1.8, "Confezione piccola di patatine, ideale per uno spuntino veloce.", "lunch"),
          item("Patatine San Carlo", 1.5, "Patatine San Carlo in confezione monoporzione; variante secondo disponibilità.", "lunch"),
          item("Pringles", 3, "Patatine impilate dalla forma curva, in gusto disponibile al banco.", "lunch"),
          item("Trinketto", 2, "Caramella liquida alla frutta nel caratteristico flaconcino.", "lunch"),
        ],
      },
      grappe: {
        label: "Grappe e rum",
        items: [
          ["Castagner Riserva", 4], ["Grappa Amarone", 5], ["Grappa Barri", 5], ["Grappa Barricata", 4],
          ["Grappa Bianca", 3], ["Grappa Gialla", 3], ["Grappino", 3], ["Rum", 4],
        ].map(([name, price]) => item(name, price, "Servito nel calice da degustazione.", "gin")),
      },
      servizi: {
        label: "Servizi feste",
        items: partyServices,
      },
    },
  },
};

const galleryPhoto = (number) =>
  `assets/gallery/photos/IMG-20260721-WA${String(number).padStart(4, "0")}.webp`;
const generatedPhoto = (name) => `assets/images/generated/${name}.webp`;

const photoReferences = {
  day: {
    caffetteria: [
      194, 96, 63, 138, 123, 154, "generated:menu-caffe-corretto-20260728",
      46, "generated:menu-caffe-shakerato-20260728", "generated:menu-caffe-shakerato-crema-20260728",
      72, 118, "generated:menu-cappuccino-scuro-20260728", 133,
      "generated:menu-cioccolata-calda-20260728", "generated:menu-cioccolata-panna-20260728",
      60, 108, 109, 112, 121, "generated:menu-latte-menta-20260728", 122, 132,
      "generated:menu-limonata-20260728", 145, 151, 173, 174, 179, 183, 37, 117,
      "generated:menu-te-caldo-20260728",
    ],
    pasticceria: [
      50, 172, "assets/images/breakfast.jpg", 40, 41, 53, 54, 55, 51, 78, 79, 45, 48, 36, 38, 39,
      83, 84, 68, 106, 124, 126, 129, 135, 143, 156, 164, 196, 197,
      "generated:menu-pasticceria-frappe-piccolo-20260728",
      "generated:menu-pasticceria-frappe-grande-20260728",
      "generated:menu-pasticceria-girella-20260728",
      "generated:menu-pasticceria-girella-uva-20260728",
      "generated:menu-pasticceria-macarons-20260728",
      "generated:menu-pasticceria-mini-sacher-20260728",
      "generated:menu-pasticceria-muffin-piccolo-20260728",
      "generated:menu-pasticceria-muffin-grande-20260728",
      "generated:menu-pasticceria-pancake-nutella-20260728",
      "generated:menu-pasticceria-pancake-fragole-20260728",
      "generated:menu-pasticceria-sacher-grande-20260728",
      "generated:menu-pasticceria-sfogliatella-20260728",
      "generated:menu-pasticceria-treccia-20260728",
    ],
    "sfizi-salati": [
      19, 28, "generated:focaccia-paradiso", 31, 88,
      "generated:pizza-compleanno", 136, "assets/images/lunch.jpg", "generated:tagliere-v4",
      "generated:toast-classico", "assets/gallery/photos/paradiso-special-20260727-03.webp",
    ],
    bibite: ["generated:acqua", "generated:bibite-lattina", "generated:succhi-frutta", "generated:te-freddo"],
    gelati: [
      "generated:menu-gelato-01-20260728", "generated:menu-gelato-02-20260728",
      "generated:menu-gelato-03-20260728", "generated:menu-gelato-04-20260728",
      "generated:menu-gelato-05-20260728", "generated:menu-gelato-06-20260728",
      "generated:menu-gelato-07-20260728", "generated:menu-gelato-08-20260728",
      "generated:menu-gelato-09-20260728", "generated:menu-gelato-10-20260728",
      "generated:menu-gelato-11-20260728", "generated:menu-gelato-12-20260728",
      "generated:menu-gelato-13-20260728", "generated:menu-gelato-14-20260728",
      "generated:menu-gelato-15-20260728",
    ],
    tessere: [138, 154, 132, 183, 154, 123],
    servizi: [200, 119, "generated:pizza-compleanno", 69],
  },
  night: {
    cocktail: [
      "generated:boulevardier", 158, 49,
      "assets/images/night-drinks/cocktails/cuba-libre-chiaro.webp",
      "assets/images/night-drinks/cocktails/cuba-libre-scuro.webp",
      70, "generated:daiquiri", "assets/images/night-drinks/cocktails/disaronno-energy.webp", "generated:disaronno-sour",
      "generated:disaronno-te", 230, 98, 201, 157,
      "assets/images/night-drinks/cocktails/jack-energy.webp", "generated:japanese-cocktail",
      "assets/images/night-drinks/cocktails/long-island.webp", 63,
      "generated:margarita", "generated:martini", "generated:espresso-martini", 158,
      "generated:moscow-mule", "assets/images/night-drinks/cocktails/negroni.webp", 205, "generated:pina-colada",
      "generated:pornstar-martini", 63, 110, 117, 49, 223, 202, 98, 201,
      "assets/images/night-drinks/cocktails/vodka-energy.webp", 228, 97,
      "assets/images/night-drinks/cocktails/jager-energy.webp",
    ],
    gin: [
      216, 201, 215, 201, "assets/images/night-drinks/gin/mr-higgins.webp", 171, 162, 201, 157,
      "assets/images/night-drinks/gin/engine-v2.webp",
      201, 171,
      "assets/images/night-drinks/gin/hendricks-v2.webp",
      "assets/images/night-drinks/gin/hendricks-viola-v2.webp",
      "assets/images/night-drinks/gin/hendricks-amazonia-v2.webp",
      "assets/images/night-drinks/gin/lola-vera-v2.webp",
      89,
      "assets/images/night-drinks/gin/monkey-47-v2.webp",
      "assets/images/night-drinks/gin/nordes-v2.webp",
      "assets/images/night-drinks/gin/portofino-v2.webp",
      98,
      "assets/images/night-drinks/gin/rivo-v3.webp",
      "assets/images/night-drinks/gin/royal-windsor-v2.webp",
      "assets/images/night-drinks/gin/santamania-v2.webp",
      "assets/images/night-drinks/gin/santana-v2.webp",
      "assets/images/night-drinks/gin/tanqueray-v2.webp",
    ],
    aperitivo: [
      202, 119, 117, 202, 14, 223,
      "assets/images/generated/tagliere-v4.webp",
      120,
      "assets/images/generated/tagliere-base-v3.webp",
    ],
    servizi: [200, 119, "generated:pizza-compleanno", 69],
    birre: [
      "assets/images/night-drinks/beers/birra-bottiglia.webp?v=2",
      "assets/images/night-drinks/beers/media-trancio-v3.webp",
      "assets/images/night-drinks/beers/spina-media-v3.webp",
      "assets/images/night-drinks/beers/spina-piccola-v3.webp",
      "assets/images/night-drinks/beers/ceres.webp?v=2",
      "assets/images/night-drinks/beers/corona.webp?v=2",
      "assets/images/night-drinks/beers/guinness.webp?v=2",
      "assets/images/night-drinks/beers/heineken.webp?v=2",
      "assets/images/night-drinks/beers/ichnusa-v3.webp",
      "assets/images/night-drinks/beers/ichnusa-50.webp?v=2",
      "assets/images/night-drinks/beers/moretti.webp?v=2",
      "assets/images/night-drinks/beers/panache.webp?v=2",
      "assets/images/night-drinks/beers/paulaner.webp?v=2",
      "assets/images/night-drinks/beers/tennents.webp?v=2",
    ],
    whisky: [
      "assets/images/night-drinks/whisky/ballantines.webp",
      "assets/images/night-drinks/whisky/chivas-12.webp",
      "assets/images/night-drinks/whisky/cognac.webp",
      "assets/images/night-drinks/whisky/don-papa.webp",
      "assets/images/night-drinks/whisky/j-and-b.webp",
      "assets/images/night-drinks/whisky/jack-daniels.webp",
      "assets/images/night-drinks/whisky/johnnie-walker-red.webp",
      "assets/images/night-drinks/whisky/laphroaig.webp",
      "assets/images/night-drinks/whisky/revel-stoke.webp",
      "assets/images/night-drinks/whisky/stravecchio-branca.webp",
    ],
    amari: [
      "assets/images/night-drinks/amari/amaro-cenote.webp",
      "assets/images/night-drinks/amari/amaro-del-capo.webp",
      "assets/images/night-drinks/amari/amaro-don-julio.webp",
      "assets/images/night-drinks/amari/amaro-gin.webp",
      "assets/images/night-drinks/amari/amaro-lucano.webp",
      "assets/images/night-drinks/amari/assenzio.webp",
      "assets/images/night-drinks/amari/averna.webp",
      "assets/images/night-drinks/amari/baileys.webp",
      "assets/images/night-drinks/amari/branca-menta.webp",
      "assets/images/night-drinks/amari/braulio.webp",
      "assets/images/night-drinks/amari/chupito.webp",
      "assets/images/night-drinks/amari/chupito-cenote.webp",
      "assets/images/night-drinks/amari/chupito-premium.webp",
      "assets/images/night-drinks/amari/disaronno.webp",
      "assets/images/night-drinks/amari/fernet-branca.webp",
      "assets/images/night-drinks/amari/herbas.webp",
      "assets/images/night-drinks/amari/jagermeister.webp",
      "assets/images/night-drinks/amari/jameson.webp",
      "assets/images/night-drinks/amari/jefferson.webp",
      "assets/images/night-drinks/amari/limoncello.webp",
      "assets/images/night-drinks/amari/monte-doppio.webp",
      "assets/images/night-drinks/amari/montenegro.webp",
      "assets/images/night-drinks/amari/sambuca.webp",
      "assets/images/night-drinks/amari/shot.webp",
      "assets/images/night-drinks/amari/vecchia-romagna.webp",
      "assets/images/night-drinks/amari/vodka.webp",
    ],
    snack: [
      "assets/images/generated/snacks/wafer-nocciola.jpg",
      "assets/images/generated/snacks/caramelle-singole-v2.jpg",
      "assets/images/generated/snacks/chupa-chups-v2.jpg",
      "assets/images/generated/snacks/cicche-pacchetto-v2.jpg",
      "assets/images/generated/snacks/cicche-singole-v2.jpg",
      "assets/images/generated/snacks/ciuccio-v2.jpg",
      "assets/images/generated/snacks/frisk-v2.jpg",
      "assets/images/generated/snacks/goleador-v2.jpg",
      "assets/images/generated/snacks/liquirizie.jpg",
      "assets/images/generated/snacks/caramella-liquida.jpg",
      "assets/images/generated/snacks/mentos-v2.jpg",
      14,
      14,
      "assets/images/generated/snacks/patatine-san-carlo-original.jpg",
      "assets/images/generated/snacks/patatine-impilate.jpg",
      "assets/images/generated/snacks/caramella-liquida.jpg",
    ],
    grappe: [
      "assets/images/night-drinks/grappe/castagner-riserva.webp",
      "assets/images/night-drinks/grappe/grappa-amarone.webp",
      "assets/images/night-drinks/grappe/grappa-barri.webp",
      "assets/images/night-drinks/grappe/grappa-barricata.webp",
      "assets/images/night-drinks/grappe/grappa-bianca.webp",
      "assets/images/night-drinks/grappe/grappa-gialla.webp",
      "assets/images/night-drinks/grappe/grappino.webp",
      "assets/images/night-drinks/grappe/rum.webp",
    ],
  },
};

const cocktailFacts = {
  Boulevardier: "Comparve nel 1927 nel libro Barflies and Cocktails: al posto del gin del Negroni usa whiskey americano.",
  Caipiroska: "È la variante alla vodka della Caipirinha: lime e zucchero vengono pestati direttamente nel bicchiere.",
  "Caipiroska alla fragola": "Le fragole vengono pestate con il lime: aggiungono polpa e profumo, non soltanto dolcezza.",
  "Cuba Libre chiaro": "Il lime è indispensabile: senza la sua acidità sarebbe semplicemente un rum e cola.",
  "Cuba Libre scuro": "Il rum scuro porta note di legno, vaniglia e caramello che il rum bianco non possiede.",
  "Cuba Zombie": "Si ispira allo Zombie di Donn Beach del 1934, celebre per l'uso di più rum nello stesso bicchiere.",
  Daiquiri: "Prende il nome da Daiquirí, località cubana vicino a Santiago: la ricetta classica ha soltanto tre ingredienti.",
  "Disaronno Red Bull o Coca-Cola": "Con la cola emergono le note di caramello; con la Red Bull il profilo diventa più secco e vivace.",
  "Disaronno Sour": "La schiuma nasce dall'albume agitato nello shaker e rende più morbido il contrasto tra amaretto e limone.",
  "Disaronno Tè": "È un long drink: il tè allunga l'amaretto e il limone ne alleggerisce la dolcezza.",
  "Drink premium": "È una preparazione della casa: base, mixer e guarnizione vengono decisi insieme per evitare abbinamenti casuali.",
  "Gin Lemon Base": "La lemon soda è già dolce e agrumata, quindi il drink non richiede sciroppo di zucchero.",
  "Gin Tonic Base": "La tonica contiene chinino: è quella nota amaricante a rendere il finale asciutto.",
  Hugo: "Nato in Alto Adige nei primi anni Duemila, sostituisce l'amaro dello Spritz con il profumo floreale del sambuco.",
  "Jack Red Bull o Coca-Cola": "La cola richiama le note vanigliate del Tennessee whiskey; la Red Bull crea un highball più vivace.",
  Japanese: "Fu pubblicato da Jerry Thomas nel 1862: non contiene ingredienti giapponesi, ma celebrava una delegazione nipponica.",
  "Long Island": "Non contiene tè: è la piccola aggiunta di cola a dargli il colore dell'iced tea.",
  "Malibu Sambuca": "È un drink della casa costruito sul contrasto tra cocco tropicale e anice della sambuca.",
  Margarita: "Il sale sul bordo non è decorativo: attenua l'acidità del lime e mette in risalto l'agave.",
  Martini: "Mescolarlo e non shakerarlo mantiene il drink limpido e gli dà una consistenza più setosa.",
  "Espresso Martini": "Dick Bradsell lo creò a Londra negli anni Ottanta; l'espresso fresco produce la crema in superficie.",
  Mojito: "La menta va premuta delicatamente: triturarla libera clorofilla e può rendere il drink amaro.",
  "Moscow Mule": "Nacque negli Stati Uniti nel 1941; la tazza di rame fu parte decisiva della sua identità e del suo successo.",
  Negroni: "La formula classica è facilissima da ricordare: gin, Campari e vermouth rosso in parti uguali.",
  Paloma: "Il pizzico di sale esalta il pompelmo e rende il finale più netto senza far sembrare il drink salato.",
  "Piña Colada": "Dal 1978 è il drink ufficiale di Porto Rico; crema di cocco e ananas ne definiscono la texture.",
  "Pornstar Martini": "Douglas Ankrah lo creò a Londra nei primi anni Duemila; il prosecco si serve a parte, non nel cocktail.",
  "Sambuca Vodka": "È una preparazione della casa: la vodka asciuga la dolcezza e lascia emergere l'anice della sambuca.",
  Sangria: "Il riposo in frigorifero permette a vino, agrumi e frutta di scambiarsi profumi prima del servizio.",
  Sbagliato: "La tradizione lo lega al Bar Basso di Milano: il prosecco prese il posto del gin del Negroni.",
  "Sex on the Beach": "Il cranberry dà colore e acidità, mentre pesca e arancia costruiscono la parte più morbida e fruttata.",
  "Spritz Aperol": "La proporzione classica è 3-2-1: tre parti di prosecco, due di Aperol e una di soda.",
  "Spritz Campari": "Rispetto all'Aperol Spritz è meno dolce e più amaricante grazie al profilo del Campari.",
  "Vodka Lemon Base": "La lemon soda unisce bollicine, dolcezza e agrume: per questo non serve aggiungere sciroppo.",
  "Vodka Premium": "È una preparazione della casa: il mixer viene scelto per rispettare il profilo della vodka selezionata.",
  "Vodka Red Bull": "È un highball costruito direttamente nel bicchiere: ghiaccio, vodka e Red Bull senza shaker.",
  "Vodka Sour": "Il dry shake, eseguito prima senza ghiaccio, monta l'albume e crea una schiuma più compatta.",
  "Vodka Tonic Base": "Il chinino della tonica aggiunge l'amaro che la vodka, naturalmente neutra, non possiede.",
  "Jäger Red Bull": "Jägermeister contiene 56 botaniche: la Red Bull allunga il liquore senza nasconderne il carattere erbaceo.",
};

const snackFacts = {
  Bueno: "Il contrasto è tutto: cialda leggera, crema alla nocciola e copertura al cioccolato nello stesso morso.",
  "Caramelle singole": "La selezione cambia nel tempo: chiedi al banco i gusti presenti prima di aggiungerle all'ordine.",
  "Chupa Chups": "Il marchio nasce in Spagna nel 1958; il celebre logo fu ridisegnato da Salvador Dalí.",
  "Cicche pacchetto": "La confezione mantiene le gomme protette e permette di conservarne più a lungo aroma e consistenza.",
  "Cicche singole": "Una scelta rapida quando vuoi una sola gomma senza acquistare l'intero pacchetto.",
  Ciuccio: "La forma giocosa rende questa caramella immediatamente riconoscibile nel banco dolci.",
  Frisk: "Le mentine pressate si sciolgono lentamente e liberano un gusto più concentrato rispetto a una gomma.",
  Goleador: "La sua firma è la doppia caramella gommosa, proposta nel tempo in gusti e formati assortiti.",
  Golia: "Liquirizia e note balsamiche costruiscono un gusto più intenso delle comuni caramelle alla frutta.",
  "Golia Immuno": "La composizione varia in base alla referenza: ingredienti e dose consigliata vanno sempre letti sulla confezione.",
  Mentos: "La superficie croccante protegge un interno gommoso, creando la doppia consistenza tipica del confetto.",
  "Patatine grandi": "Il formato grande è pensato per essere condiviso al tavolo durante l'aperitivo.",
  "Patatine piccole": "La monoporzione aiuta a conservare croccantezza e profumo fino all'apertura.",
  "Patatine San Carlo": "Il gusto effettivamente disponibile può cambiare: la confezione viene confermata al momento dell'ordine.",
  Pringles: "La forma a sella permette alle patatine di impilarsi ordinatamente e rompersi meno nella confezione.",
  Trinketto: "Si gusta direttamente dal flaconcino: è una caramella liquida, non una bibita.",
};

const nightDrinkProfiles = window.nightDrinkProfiles;

function resolvePhoto(reference) {
  if (typeof reference === "number") return galleryPhoto(reference);
  if (reference === "dom-perignon") return "assets/gallery/photos/IMG-20260703-WA0049.webp";
  if (reference.startsWith("generated:")) return generatedPhoto(reference.split(":")[1]);
  return reference;
}

Object.entries(photoReferences).forEach(([theme, categories]) => {
  Object.entries(categories).forEach(([categoryKey, references]) => {
    menus[theme].categories[categoryKey].items.forEach((product, index) => {
      product.image = resolvePhoto(references[index % references.length]);
      delete product.imageFit;
    });
  });
});

menus.night.categories.cocktail.items.forEach((product) => {
  product.fact = cocktailFacts[product.name];
});

menus.night.categories.snack.items.forEach((product) => {
  product.fact = snackFacts[product.name];
});

const detailedDrinkCategories = ["bottiglie", "gin", "aperitivo", "birre", "whisky", "amari", "grappe"];

detailedDrinkCategories.forEach((categoryKey) => {
  menus.night.categories[categoryKey].items.forEach((product) => {
    const profile = nightDrinkProfiles?.[categoryKey]?.[product.name];
    if (profile?.description) product.description = profile.description;
    if (profile?.fact) product.fact = profile.fact;
  });
});

const allNightDrinkProducts = ["cocktail", ...detailedDrinkCategories]
  .flatMap((categoryKey) => menus.night.categories[categoryKey].items);
const profiledNightDrinkProducts = allNightDrinkProducts.filter((product) => product.fact);
const drinkDescriptions = profiledNightDrinkProducts.map((product) => product.description);
const drinkFacts = profiledNightDrinkProducts.map((product) => product.fact);
const API_BASE = window.PARADISO_API_BASE_URL ?? "";
const SITE_CONTENT_PATH = `${API_BASE}/v1/site-content`;
const SITE_CONTENT_CACHE_KEY = "paradiso_site_content_v1";
const phoneCountries = [
  { code: "it", name: "Italia", prefix: "+39" },
  { code: "ch", name: "Svizzera", prefix: "+41" },
  { code: "fr", name: "Francia", prefix: "+33" },
  { code: "de", name: "Germania", prefix: "+49" },
  { code: "es", name: "Spagna", prefix: "+34" },
  { code: "gb", name: "Regno Unito", prefix: "+44" },
  { code: "at", name: "Austria", prefix: "+43" },
  { code: "be", name: "Belgio", prefix: "+32" },
  { code: "nl", name: "Paesi Bassi", prefix: "+31" },
  { code: "pt", name: "Portogallo", prefix: "+351" },
  { code: "gr", name: "Grecia", prefix: "+30" },
  { code: "ro", name: "Romania", prefix: "+40" },
  { code: "al", name: "Albania", prefix: "+355" },
  { code: "hr", name: "Croazia", prefix: "+385" },
  { code: "si", name: "Slovenia", prefix: "+386" },
  { code: "pl", name: "Polonia", prefix: "+48" },
  { code: "ua", name: "Ucraina", prefix: "+380" },
  { code: "md", name: "Moldavia", prefix: "+373" },
  { code: "rs", name: "Serbia", prefix: "+381" },
  { code: "ba", name: "Bosnia", prefix: "+387" },
  { code: "mk", name: "Macedonia del Nord", prefix: "+389" },
  { code: "bg", name: "Bulgaria", prefix: "+359" },
  { code: "hu", name: "Ungheria", prefix: "+36" },
  { code: "cz", name: "Repubblica Ceca", prefix: "+420" },
  { code: "sk", name: "Slovacchia", prefix: "+421" },
  { code: "ma", name: "Marocco", prefix: "+212" },
  { code: "tn", name: "Tunisia", prefix: "+216" },
  { code: "eg", name: "Egitto", prefix: "+20" },
  { code: "tr", name: "Turchia", prefix: "+90" },
  { code: "us", secondaryCode: "ca", name: "Stati Uniti / Canada", prefix: "+1" },
  { code: "br", name: "Brasile", prefix: "+55" },
  { code: "ar", name: "Argentina", prefix: "+54" },
  { code: "pe", name: "Perù", prefix: "+51" },
  { code: "ec", name: "Ecuador", prefix: "+593" },
  { code: "co", name: "Colombia", prefix: "+57" },
  { code: "cn", name: "Cina", prefix: "+86" },
  { code: "in", name: "India", prefix: "+91" },
  { code: "bd", name: "Bangladesh", prefix: "+880" },
  { code: "pk", name: "Pakistan", prefix: "+92" },
  { code: "ph", name: "Filippine", prefix: "+63" },
];

if (new Set(drinkDescriptions).size !== drinkDescriptions.length) {
  throw new Error("Sono presenti descrizioni drink duplicate.");
}
if (new Set(drinkFacts).size !== drinkFacts.length) {
  throw new Error("Sono presenti chicche drink duplicate.");
}

applySiteContent(readStorage(SITE_CONTENT_CACHE_KEY, null));

let currentTheme = getInitialTheme();
let activeCategory = Object.keys(menus[currentTheme].categories)[0];
let showAll = false;
let cart = readStorage(CART_KEY, []).map((entry) => ({
  ...entry,
  ...findProduct(entry.id),
  quantity: entry.quantity,
}));

const menuGrid = document.querySelector("#menu-grid");
const categoryTabs = document.querySelector("#category-tabs");
const showMoreButton = document.querySelector("#show-more");
const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const bookingForm = document.querySelector("#booking-form");
const countrySelect = document.querySelector("[data-country-select]");
const countrySelectTrigger = countrySelect.querySelector("[data-country-trigger]");
const countrySelectMenu = countrySelect.querySelector("[data-country-menu]");
const countryPrefixInput = countrySelect.querySelector("[data-country-prefix-input]");
const countryCurrentFlags = countrySelect.querySelector("[data-country-current-flags]");
const countryCurrentPrefix = countrySelect.querySelector("[data-country-current-prefix]");
const confirmationDialog = document.querySelector("#confirmation-dialog");
const productDialog = document.querySelector("#product-dialog");
const menuSearch = document.querySelector("#menu-search");
const productSearchInput = document.querySelector("#product-search");
const productSearchResults = document.querySelector("#product-search-results");
const productSearchClear = document.querySelector("#product-search-clear");
let searchMatches = [];
let activeSearchIndex = -1;

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function applySiteContent(content) {
  if (!content?.menus) return;
  for (const theme of ["day", "night"]) {
    const sourceMenu = content.menus[theme];
    if (!sourceMenu?.categories) continue;
    const orderedCategories = {};
    const categoryOrder = Array.isArray(sourceMenu.categoryOrder)
      ? sourceMenu.categoryOrder
      : Object.keys(sourceMenu.categories);
    categoryOrder.forEach((categoryKey) => {
      const category = sourceMenu.categories[categoryKey];
      if (category?.items) orderedCategories[categoryKey] = category;
    });
    if (!Object.keys(orderedCategories).length) continue;
    menus[theme] = {
      ...menus[theme],
      ...sourceMenu,
      categories: orderedCategories,
    };
  }
}

async function loadSiteContent() {
  try {
    const response = await fetch(SITE_CONTENT_PATH, { cache: "no-store" });
    if (!response.ok) return false;
    const result = await response.json();
    if (!result.content) return false;
    applySiteContent(result.content);
    writeStorage(SITE_CONTENT_CACHE_KEY, result.content);
    return true;
  } catch {
    // The bundled catalog remains available when the API cannot be reached.
    return false;
  }
}

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "day" || stored === "night") return stored;
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? "night" : "day";
}

function itemId(theme, category, name) {
  return `${theme}:${category}:${name}`.toLowerCase().replace(/[^a-z0-9à-ž]+/gi, "-");
}

function productId(theme, category, product) {
  return product.id || itemId(theme, category, product.name);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeImageSource(value) {
  const source = String(value ?? "").trim();
  if (
    source.startsWith("assets/") ||
    source.startsWith("/media/") ||
    source.startsWith("https://") ||
    source.startsWith("http://")
  ) {
    return source;
  }
  return "assets/images/breakfast.jpg";
}

function normalizeSearchText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT");
}

function closeProductSearch() {
  searchMatches = [];
  activeSearchIndex = -1;
  productSearchResults.innerHTML = "";
  productSearchResults.hidden = true;
  productSearchInput.setAttribute("aria-expanded", "false");
  productSearchInput.removeAttribute("aria-activedescendant");
}

function resetProductSearch() {
  productSearchInput.value = "";
  productSearchInput.placeholder =
    currentTheme === "day" ? "Cerca nel menu del giorno" : "Cerca nel menu della sera";
  productSearchClear.hidden = true;
  closeProductSearch();
}

function setActiveSearchResult(index) {
  if (!searchMatches.length) return;
  activeSearchIndex = (index + searchMatches.length) % searchMatches.length;
  productSearchResults.querySelectorAll("[data-search-preview]").forEach((button, buttonIndex) => {
    const isActive = buttonIndex === activeSearchIndex;
    button.setAttribute("aria-selected", String(isActive));
    if (isActive) {
      productSearchInput.setAttribute("aria-activedescendant", button.id);
      button.scrollIntoView({ block: "nearest" });
    }
  });
}

function renderProductSearch() {
  const query = normalizeSearchText(productSearchInput.value.trim());
  productSearchClear.hidden = !query;
  activeSearchIndex = -1;
  productSearchInput.removeAttribute("aria-activedescendant");

  if (!query) {
    closeProductSearch();
    return;
  }

  const terms = query.split(/\s+/).filter(Boolean);
  searchMatches = Object.entries(menus[currentTheme].categories)
    .flatMap(([categoryKey, category]) =>
      category.items.map((product) => ({
        ...product,
        id: productId(currentTheme, categoryKey, product),
        categoryLabel: category.label,
      })),
    )
    .filter((product) => {
      const searchable = normalizeSearchText(
        `${product.name} ${product.categoryLabel} ${product.description || ""}`,
      );
      return terms.every((term) => searchable.includes(term));
    })
    .slice(0, 8);

  productSearchResults.hidden = false;
  productSearchInput.setAttribute("aria-expanded", "true");

  if (!searchMatches.length) {
    productSearchResults.innerHTML = `
      <div class="menu-search-empty">
        <i data-lucide="search-x"></i>
        <span>Nessun prodotto trovato</span>
      </div>
    `;
    refreshIcons();
    return;
  }

  productSearchResults.innerHTML = searchMatches
    .map(
      (product, index) => `
        <button
          class="menu-search-result"
          id="product-search-result-${index}"
          type="button"
          role="option"
          aria-selected="false"
          data-search-preview="${escapeHtml(product.id)}"
        >
          <img
            class="${product.imageFit === "contain" ? "contain" : ""}"
            src="${escapeHtml(safeImageSource(product.image))}"
            alt=""
            loading="lazy"
          />
          <span class="menu-search-result-copy">
            <small>${escapeHtml(product.categoryLabel)}</small>
            <strong>${escapeHtml(product.name)}</strong>
          </span>
          <span class="menu-search-result-price">${euro.format(product.price)}</span>
          <i data-lucide="maximize-2"></i>
        </button>
      `,
    )
    .join("");
  refreshIcons();
}

function openSearchPreview(id) {
  productSearchInput.value = "";
  productSearchClear.hidden = true;
  closeProductSearch();
  openProductPreview(id);
}

function setTheme(theme) {
  currentTheme = theme;
  activeCategory = Object.keys(menus[theme].categories)[0];
  showAll = false;
  document.body.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "day" ? "#f5fbff" : "#05070b");

  document.querySelectorAll("[data-set-theme]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.setTheme === theme));
  });

  const menu = menus[theme];
  document.querySelector("#menu-title").textContent = menu.title;
  document.querySelector("#menu-intro").textContent = menu.intro;
  document.querySelector("#hero-copy").textContent = menu.heroCopy;
  document.querySelector("#hero-menu-label").textContent = menu.heroLabel;
  const heroImage = document.querySelector("#hero-image");
  heroImage.src = safeImageSource(menu.heroImage);
  heroImage.alt = menu.heroAlt;
  heroImage.style.setProperty("--hero-position", menu.heroPosition);
  heroImage.style.setProperty("--hero-position-mobile", menu.heroPositionMobile);
  resetProductSearch();
  renderTabs();
  renderMenu();
  refreshIcons();
}

function renderTabs() {
  const categoryEntries = Object.entries(menus[currentTheme].categories);
  const tabs = categoryEntries
    .map(([key, category]) => `
      <button
        class="category-tab"
        type="button"
        role="tab"
        data-category="${escapeHtml(key)}"
        aria-selected="${key === activeCategory}"
      >${escapeHtml(category.label)}</button>
    `);

  if (currentTheme === "night") {
    tabs.unshift(`
      <button
        class="category-tab category-tab-offer"
        type="button"
        role="tab"
        data-menu-page="eventi.html"
        aria-selected="false"
      >Offerta drink</button>
    `);
  }

  categoryTabs.innerHTML = tabs.join("");
}

function renderMenu() {
  const category = menus[currentTheme].categories[activeCategory];
  const visibleItems = showAll ? category.items : category.items.slice(0, 12);

  menuGrid.innerHTML = visibleItems
    .map((product) => {
      const id = productId(currentTheme, activeCategory, product);
      const safeID = escapeHtml(id);
      const safeName = escapeHtml(product.name);
      return `
        <article class="menu-card">
          <button
            class="menu-card-media"
            type="button"
            data-preview-item="${safeID}"
            aria-label="Ingrandisci ${safeName}"
            title="Ingrandisci"
          >
            <img class="${product.imageFit === "contain" ? "contain" : ""}" src="${escapeHtml(safeImageSource(product.image))}" alt="${safeName}" loading="lazy" />
            <span class="menu-card-zoom"><i data-lucide="maximize-2"></i></span>
          </button>
          <div class="menu-card-content">
            <div class="menu-card-top">
              <h3>${safeName}</h3>
              <span class="menu-price">${euro.format(product.price)}</span>
            </div>
            <p class="menu-description">${escapeHtml(product.description)}</p>
            <button
              class="add-button"
              type="button"
              data-add-item="${safeID}"
              aria-label="Aggiungi ${safeName}"
              title="Aggiungi al carrello"
            ><i data-lucide="plus"></i></button>
          </div>
        </article>
      `;
    })
    .join("");

  const hasMore = category.items.length > 12;
  showMoreButton.parentElement.hidden = !hasMore;
  if (hasMore) {
    showMoreButton.querySelector("span").textContent = showAll ? "Mostra meno" : `Mostra tutto (${category.items.length})`;
    showMoreButton.querySelector("i, svg")?.setAttribute("data-lucide", showAll ? "chevrons-up" : "chevrons-down");
  }
  refreshIcons();
}

function findProduct(id) {
  for (const [themeKey, menu] of Object.entries(menus)) {
    for (const [categoryKey, category] of Object.entries(menu.categories)) {
      const product = category.items.find((entry) => productId(themeKey, categoryKey, entry) === id);
      if (product) return { ...product, id, theme: themeKey, category: categoryKey };
    }
  }
  return null;
}

function openProductPreview(id) {
  const product = findProduct(id);
  if (!product) return;

  const category = menus[product.theme].categories[product.category];
  const factBox = productDialog.querySelector("#product-dialog-fact");
  productDialog.querySelector("#product-dialog-image").src = product.image;
  productDialog.querySelector("#product-dialog-image").alt = product.name;
  productDialog.querySelector("#product-dialog-category").textContent = category.label;
  productDialog.querySelector("#product-dialog-title").textContent = product.name;
  productDialog.querySelector("#product-dialog-description").textContent = product.description;
  productDialog.querySelector("#product-dialog-price").textContent = euro.format(product.price);
  productDialog.querySelector("#product-dialog-fact-copy").textContent = product.fact || "";
  factBox.hidden = !product.fact;
  productDialog.querySelector("#product-dialog-add").dataset.addItem = id;
  productDialog.showModal();
  refreshIcons();
}

function addToCart(id) {
  const existing = cart.find((entry) => entry.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    const product = findProduct(id);
    if (!product) return;
    cart.push({ ...product, quantity: 1 });
  }
  persistCart();
  showToast("Aggiunto al carrello");
}

function updateQuantity(id, delta) {
  const entry = cart.find((product) => product.id === id);
  if (!entry) return;
  entry.quantity += delta;
  if (entry.quantity <= 0) cart = cart.filter((product) => product.id !== id);
  persistCart();
}

function removeFromCart(id) {
  cart = cart.filter((product) => product.id !== id);
  persistCart();
}

function persistCart() {
  writeStorage(CART_KEY, cart);
  renderCart();
  renderOrderPreview();
}

function cartTotal() {
  return cart.reduce((total, product) => total + product.price * product.quantity, 0);
}

function renderCart() {
  const count = cart.reduce((total, product) => total + product.quantity, 0);
  document.querySelector(".cart-count").textContent = count;
  document.querySelector("#cart-total").textContent = euro.format(cartTotal());
  document.querySelector("#checkout-button").disabled = cart.length === 0;

  const target = document.querySelector("#cart-items");
  if (!cart.length) {
    target.innerHTML = `
      <div class="empty-cart">
        <i data-lucide="shopping-bag"></i>
        <strong>Il carrello è vuoto</strong>
        <span>Aggiungi qualcosa dal menu.</span>
      </div>
    `;
    refreshIcons();
    return;
  }

  target.innerHTML = cart
    .map((product) => `
      <div class="cart-line">
        <img class="${product.imageFit === "contain" ? "contain" : ""}" src="${escapeHtml(safeImageSource(product.image))}" alt="" />
        <div class="cart-line-copy">
          <strong>${escapeHtml(product.name)}</strong>
          <span>${euro.format(product.price * product.quantity)}</span>
          <div class="quantity-control">
            <button type="button" data-cart-action="decrease" data-id="${escapeHtml(product.id)}" aria-label="Riduci quantità">
              <i data-lucide="minus"></i>
            </button>
            <b>${product.quantity}</b>
            <button type="button" data-cart-action="increase" data-id="${escapeHtml(product.id)}" aria-label="Aumenta quantità">
              <i data-lucide="plus"></i>
            </button>
          </div>
        </div>
        <button class="cart-remove" type="button" data-cart-action="remove" data-id="${escapeHtml(product.id)}" aria-label="Rimuovi ${escapeHtml(product.name)}" title="Rimuovi">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `)
    .join("");
  refreshIcons();
}

function renderOrderPreview() {
  document.querySelector("#preview-total").textContent = euro.format(cartTotal());
  document.querySelector("#preview-empty").hidden = cart.length > 0;
  document.querySelector("#preview-items").innerHTML = cart
    .map((product) => `<li><span>${product.quantity} × ${escapeHtml(product.name)}</span><strong>${euro.format(product.price * product.quantity)}</strong></li>`)
    .join("");
}

function openCart() {
  cartDrawer.classList.add("is-open");
  drawerBackdrop.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  cartDrawer.querySelector(".cart-close").focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  drawerBackdrop.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 250);
  }, 1800);
}

function countryFlagMarkup(country) {
  return [country.code, country.secondaryCode]
    .filter(Boolean)
    .map((code) => `<img src="assets/flags/${code}.svg" alt="" />`)
    .join("");
}

function renderPhoneCountries() {
  countrySelectMenu.innerHTML = phoneCountries
    .map(
      (country) => `
        <button
          class="country-select-option"
          type="button"
          role="option"
          aria-selected="${country.prefix === "+39"}"
          data-country-prefix="${country.prefix}"
        >
          <span class="country-flag-stack">${countryFlagMarkup(country)}</span>
          <span class="country-option-name">${country.name}</span>
          <strong>${country.prefix}</strong>
        </button>
      `,
    )
    .join("");
}

function setCountryMenuOpen(open, focusSelected = false) {
  countrySelect.classList.toggle("is-open", open);
  countrySelectTrigger.setAttribute("aria-expanded", String(open));
  countrySelectMenu.hidden = !open;
  if (!open || !focusSelected) return;

  const selectedOption = [...countrySelectMenu.querySelectorAll("[data-country-prefix]")].find(
    (option) => option.dataset.countryPrefix === countryPrefixInput.value,
  );
  selectedOption?.focus();
}

function selectPhoneCountry(prefix, returnFocus = true) {
  const country = phoneCountries.find((entry) => entry.prefix === prefix) ?? phoneCountries[0];
  countryPrefixInput.value = country.prefix;
  countryCurrentFlags.innerHTML = countryFlagMarkup(country);
  countryCurrentPrefix.textContent = country.prefix;
  countrySelectTrigger.setAttribute(
    "aria-label",
    `Paese e prefisso telefonico: ${country.name} ${country.prefix}`,
  );
  countrySelectMenu.querySelectorAll("[data-country-prefix]").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.countryPrefix === country.prefix));
  });
  setCountryMenuOpen(false);
  if (returnFocus) countrySelectTrigger.focus();
}

function moveCountryOptionFocus(event) {
  const options = [...countrySelectMenu.querySelectorAll("[data-country-prefix]")];
  const currentIndex = options.indexOf(document.activeElement);
  if (event.key === "Escape") {
    event.preventDefault();
    setCountryMenuOpen(false);
    countrySelectTrigger.focus();
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

  event.preventDefault();
  const nextIndex = {
    ArrowDown: Math.min(currentIndex + 1, options.length - 1),
    ArrowUp: Math.max(currentIndex - 1, 0),
    Home: 0,
    End: options.length - 1,
  }[event.key];
  options[nextIndex]?.focus();
}

function formatBookingPhone(prefix, number) {
  const rawNumber = String(number || "").trim();
  const digits = rawNumber.replace(/\D/g, "");
  if (!digits) return "";
  if (rawNumber.startsWith("+")) return `+${digits}`;
  if (rawNumber.startsWith("00")) return `+${digits.slice(2)}`;

  const normalizedPrefix = `+${String(prefix || "+39").replace(/\D/g, "")}`;
  return `${normalizedPrefix}${digits}`;
}

async function submitBooking(event) {
  event.preventDefault();
  const submitButton = bookingForm.querySelector(".submit-button");
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  const data = new FormData(bookingForm);
  const request = {
    customerName: data.get("name"),
    phone: formatBookingPhone(data.get("phonePrefix"), data.get("phone")),
    email: data.get("email"),
    reservationDate: data.get("date"),
    reservationTime: data.get("time"),
    guests: Number(data.get("guests")),
    notes: data.get("notes"),
    items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
  };

  try {
    const response = await fetch(`${API_BASE}/v1/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error?.message || "Il servizio prenotazioni non è disponibile.");
    }

    document.querySelector("#confirmation-code").textContent = result.code;
    document.querySelector("#confirmation-copy").textContent = `${result.customerName}, il tavolo per ${result.guests} ${result.guests === 1 ? "persona" : "persone"} è richiesto per il ${formatDate(result.reservationDate)} alle ${result.reservationTime}.`;
    confirmationDialog.showModal();

    cart = [];
    persistCart();
    bookingForm.reset();
    setMinDate();
  } catch (error) {
    showToast(error.message || "Prenotazione non inviata. Riprova.");
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
  }
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function setMinDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;
  const field = document.querySelector("#booking-date");
  field.min = today;
  field.value = today;
}

function adjustBookingTime(amount) {
  const field = document.querySelector("#booking-time");
  const [hours = "12", minutes = "00"] = (field.value || "12:00").split(":");
  const totalMinutes = (Number(hours) * 60 + Number(minutes) + amount + 1440) % 1440;
  const nextHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const nextMinutes = String(totalMinutes % 60).padStart(2, "0");
  field.value = `${nextHours}:${nextMinutes}`;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  field.focus();
}

function adjustBookingGuests(amount) {
  const field = document.querySelector("#booking-guests");
  const minimum = Number(field.min) || 1;
  const maximum = Number(field.max) || 20;
  const current = Number(field.value) || minimum;
  field.value = String(Math.min(maximum, Math.max(minimum, current + amount)));
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  field.focus();
}

function refreshIcons() {
  window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
}

document.querySelectorAll("[data-set-theme]").forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.setTheme));
});

categoryTabs.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-menu-page]");
  if (pageButton) {
    window.location.href = pageButton.dataset.menuPage;
    return;
  }

  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  showAll = false;
  renderTabs();
  renderMenu();
});

menuGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-item]");
  if (addButton) {
    addToCart(addButton.dataset.addItem);
    return;
  }

  const previewButton = event.target.closest("[data-preview-item]");
  if (previewButton) openProductPreview(previewButton.dataset.previewItem);
});

productSearchInput.addEventListener("input", renderProductSearch);
productSearchInput.addEventListener("focus", () => {
  if (productSearchInput.value.trim()) renderProductSearch();
});
productSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" && searchMatches.length) {
    event.preventDefault();
    setActiveSearchResult(activeSearchIndex + 1);
  } else if (event.key === "ArrowUp" && searchMatches.length) {
    event.preventDefault();
    setActiveSearchResult(activeSearchIndex - 1);
  } else if (event.key === "Enter" && searchMatches.length) {
    event.preventDefault();
    const match = searchMatches[activeSearchIndex >= 0 ? activeSearchIndex : 0];
    openSearchPreview(match.id);
  } else if (event.key === "Escape") {
    closeProductSearch();
  }
});
productSearchResults.addEventListener("click", (event) => {
  const result = event.target.closest("[data-search-preview]");
  if (result) openSearchPreview(result.dataset.searchPreview);
});
productSearchClear.addEventListener("click", () => {
  productSearchInput.value = "";
  productSearchClear.hidden = true;
  closeProductSearch();
  productSearchInput.focus();
});
document.addEventListener("click", (event) => {
  if (!menuSearch.contains(event.target)) closeProductSearch();
});

showMoreButton.addEventListener("click", () => {
  showAll = !showAll;
  renderMenu();
});

document.querySelector(".cart-trigger").addEventListener("click", openCart);
document.querySelector(".cart-close").addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);

document.querySelector("#cart-items").addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;
  const actions = {
    increase: () => updateQuantity(button.dataset.id, 1),
    decrease: () => updateQuantity(button.dataset.id, -1),
    remove: () => removeFromCart(button.dataset.id),
  };
  actions[button.dataset.cartAction]?.();
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  closeCart();
  document.querySelector("#prenota").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(() => bookingForm.elements.name.focus(), 500);
});

renderPhoneCountries();
selectPhoneCountry("+39", false);
countrySelectTrigger.addEventListener("click", () => {
  const nextOpen = countrySelectTrigger.getAttribute("aria-expanded") !== "true";
  setCountryMenuOpen(nextOpen, nextOpen);
});
countrySelectTrigger.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowDown") return;
  event.preventDefault();
  setCountryMenuOpen(true, true);
});
countrySelectMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-country-prefix]");
  if (option) selectPhoneCountry(option.dataset.countryPrefix);
});
countrySelectMenu.addEventListener("keydown", moveCountryOptionFocus);
countrySelect.addEventListener("focusout", () => {
  window.setTimeout(() => {
    if (!countrySelect.contains(document.activeElement)) setCountryMenuOpen(false);
  });
});
document.addEventListener("click", (event) => {
  if (!countrySelect.contains(event.target)) setCountryMenuOpen(false);
});

bookingForm.addEventListener("submit", submitBooking);
bookingForm.addEventListener("reset", () => {
  window.setTimeout(() => selectPhoneCountry("+39", false));
});
document.querySelectorAll("[data-time-step]").forEach((button) => {
  button.addEventListener("click", () => adjustBookingTime(Number(button.dataset.timeStep)));
});
document.querySelectorAll("[data-guest-step]").forEach((button) => {
  button.addEventListener("click", () => adjustBookingGuests(Number(button.dataset.guestStep)));
});
document.querySelector(".dialog-close").addEventListener("click", () => confirmationDialog.close());
document.querySelector(".dialog-done").addEventListener("click", () => confirmationDialog.close());
document.querySelector(".product-dialog-close").addEventListener("click", () => productDialog.close());
document.querySelector("#product-dialog-add").addEventListener("click", (event) => {
  addToCart(event.currentTarget.dataset.addItem);
});
productDialog.addEventListener("click", (event) => {
  if (event.target !== productDialog) return;
  const bounds = productDialog.getBoundingClientRect();
  const isInside =
    event.clientX >= bounds.left &&
    event.clientX <= bounds.right &&
    event.clientY >= bounds.top &&
    event.clientY <= bounds.bottom;
  if (!isInside) productDialog.close();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
setMinDate();
renderCart();
renderOrderPreview();
setTheme(currentTheme);
loadSiteContent().then((loaded) => {
  if (!loaded) return;
  cart = cart
    .map((entry) => {
      const current = findProduct(entry.id);
      return current ? { ...current, quantity: entry.quantity } : null;
    })
    .filter(Boolean);
  renderCart();
  renderOrderPreview();
  setTheme(currentTheme);
});
window.addEventListener("load", refreshIcons);
