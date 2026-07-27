const drinkProfile = (description, fact) => ({ description, fact });

window.nightDrinkProfiles = {
  bottiglie: {
    "Clase Azul": drinkProfile(
      "Ingredienti e stile: tequila reposado da 100% agave blu Weber, cotta lentamente e affinata in rovere.",
      "Il decanter in ceramica viene dipinto a mano in Messico: ogni bottiglia presenta piccole differenze."
    ),
    "Shot Clase Azul": drinkProfile(
      "Ingredienti e stile: una dose di tequila Clase Azul Reposado da 100% agave blu Weber.",
      "Servirla senza ghiaccio permette di seguire meglio le note di agave cotta, vaniglia e legno."
    ),
    "Don Papa Baroko": drinkProfile(
      "Ingredienti e stile: rum filippino da melassa di canna da zucchero, morbido, vanigliato e agrumato.",
      "La canna da zucchero cresce ai piedi del monte Kanlaon, sull'isola filippina di Negros."
    ),
    "Jack Daniel's": drinkProfile(
      "Ingredienti e stile: Tennessee whiskey da mais, segale e malto d'orzo, addolcito con carbone d'acero.",
      "La ricetta usa 80% mais, 8% segale e 12% malto d'orzo prima del passaggio nel carbone."
    ),
    "Keglevich Fragola": drinkProfile(
      "Ingredienti e stile: vodka di cereali aromatizzata alla fragola, dolce e intensamente fruttata. Bottiglia servita con 5 lattine di Red Bull oppure lemon in omaggio.",
      "Fredda diventa più compatta e lascia emergere il profumo della fragola senza bisogno di mixer."
    ),
    "Keglevich Pesca": drinkProfile(
      "Ingredienti e stile: vodka di cereali aromatizzata alla pesca, morbida e profumata. Bottiglia servita con 5 lattine di Red Bull oppure lemon in omaggio.",
      "La pesca dà un finale più rotondo rispetto alla vodka neutra e si abbina bene a soda o tè freddo."
    ),
    "Alkkemist Gin": drinkProfile(
      "Ingredienti e stile: gin con ginepro, botaniche mediterranee e uva Moscato, da servire con tonica.",
      "La distillazione nelle notti di luna piena e l'uva Moscato sono i tratti distintivi dichiarati dal produttore."
    ),
    "Amuerte Coca Gin": drinkProfile(
      "Ingredienti e stile: gin con ginepro, coriandolo, angelica, agrumi, frutti tropicali e foglie di coca peruviane.",
      "Tamarillo, papaya, pitaya e physalis costruiscono un profilo tropicale insolito per un gin."
    ),
    "Hendrick's Grand Cabaret": drinkProfile(
      "Ingredienti e stile: gin Hendrick's con frutta a nocciolo, erbe dolci, tonica, ghiaccio e cetriolo.",
      "Grand Cabaret prende ispirazione dai punch alla frutta serviti nelle feste parigine di inizio Novecento."
    ),
    "Nordés con toniche": drinkProfile(
      "Ingredienti e stile: gin da distillato d'uva Albariño, botaniche galiziane, toniche, ghiaccio e uva.",
      "Salvia, alloro ed eucalipto gli danno un carattere atlantico più floreale che resinoso."
    ),
    "Bombay Sapphire con toniche": drinkProfile(
      "Ingredienti e stile: London Dry gin con dieci botaniche, toniche, ghiaccio e scorza di limone.",
      "Le botaniche sono estratte per infusione a vapore, così i profumi restano netti e delicati."
    ),
    "Gin Mare con toniche": drinkProfile(
      "Ingredienti e stile: gin con ginepro, oliva Arbequina, basilico, rosmarino e timo, servito con toniche.",
      "L'oliva Arbequina porta una lieve nota sapida che richiama immediatamente la cucina mediterranea."
    ),
    "Grey Goose": drinkProfile(
      "Ingredienti e stile: vodka francese da grano tenero invernale e acqua di sorgente filtrata nel calcare. Bottiglia servita con 5 lattine di Red Bull oppure lemon in omaggio.",
      "Viene prodotta tra Piccardia e Cognac: il grano arriva dal nord, l'acqua dalla regione di imbottigliamento."
    ),
    Belvedere: drinkProfile(
      "Ingredienti e stile: vodka polacca da segale e acqua purificata, senza aromi o zuccheri aggiunti. Bottiglia servita con 5 lattine di Red Bull oppure lemon in omaggio.",
      "La segale le lascia una trama più cremosa e una lieve speziatura rispetto a molte vodka di grano."
    ),
    "Absolut Vodka": drinkProfile(
      "Ingredienti e stile: vodka svedese da grano invernale e acqua profonda di Åhus. Bottiglia servita con 5 lattine di Red Bull oppure lemon in omaggio.",
      "Dal 1879 usa la distillazione continua, ideata per ottenere uno spirito particolarmente uniforme."
    ),
    "Veuve Clicquot Brut": drinkProfile(
      "Ingredienti e stile: Champagne brut da Pinot Noir, Chardonnay e Meunier, con forte impronta del Pinot Noir.",
      "La celebre etichetta gialla identifica una cuvée costruita anche con vini di riserva della maison."
    ),
    "Bellavista Alma Gran Cuvée": drinkProfile(
      "Ingredienti e stile: Franciacorta brut da Chardonnay, Pinot Nero e una piccola parte di Pinot Bianco.",
      "La presa di spuma avviene in bottiglia secondo il metodo Franciacorta, con lungo riposo sui lieviti."
    ),
    "Berlucchi Cuvée Imperiale": drinkProfile(
      "Ingredienti e stile: Franciacorta brut da Chardonnay e Pinot Nero, fresco e finemente cremoso.",
      "Berlucchi produsse nel 1961 uno dei primi spumanti metodo classico della Franciacorta."
    ),
    "Valdo Prosecco": drinkProfile(
      "Ingredienti e stile: Prosecco Extra Dry da uva Glera, floreale, fruttato e leggermente morbido.",
      "Extra Dry è più morbido di Brut: il nome può trarre in inganno, ma indica un residuo zuccherino maggiore."
    ),
    "Moët N.I.R Rosé": drinkProfile(
      "Ingredienti e stile: Champagne rosé demi-sec da Pinot Noir, Meunier e Chardonnay.",
      "N.I.R significa Nectar Impérial Rosé: la bottiglia luminosa è stata pensata per il servizio serale."
    ),
    "Veuve Clicquot Rosé": drinkProfile(
      "Ingredienti e stile: Champagne rosé da Pinot Noir, Chardonnay, Meunier e vino rosso della Champagne.",
      "Nel 1818 Madame Clicquot creò il primo rosé d'assemblaggio conosciuto aggiungendo vino rosso alla cuvée."
    ),
    "Moët Ice Impérial": drinkProfile(
      "Ingredienti e stile: Champagne demi-sec da Pinot Noir, Meunier e Chardonnay, creato per essere servito con ghiaccio.",
      "È uno dei rari Champagne progettati espressamente per conservare equilibrio e profumo sopra cubi di ghiaccio."
    ),
    "Moët Impérial Brut": drinkProfile(
      "Ingredienti e stile: Champagne brut da Pinot Noir, Meunier e Chardonnay, fresco e cremoso.",
      "La cuvée unisce numerosi cru e vini di riserva per mantenere costante lo stile della maison."
    ),
    "Lanson White Label": drinkProfile(
      "Ingredienti e stile: Champagne da Pinot Noir, Chardonnay e Meunier, dal dosaggio morbido e aromatico.",
      "White Label è stato concepito per essere personalizzato nel calice con scorze o frutta fresca."
    ),
    "Monte Rossa Blanc de Blancs": drinkProfile(
      "Ingredienti e stile: Franciacorta Blanc de Blancs da uve bianche, con prevalenza di Chardonnay.",
      "Blanc de Blancs significa letteralmente bianco da uve bianche, uno stile spesso fine e agrumato."
    ),
    "Dom Pérignon 2012": drinkProfile(
      "Ingredienti e stile: Champagne millesimato 2012 da Chardonnay e Pinot Noir, affinato a lungo sui lieviti.",
      "Dom Pérignon produce soltanto millesimati: se l'annata non è ritenuta adatta, la cuvée non viene dichiarata."
    ),
    "Cristal Louis Roederer": drinkProfile(
      "Ingredienti e stile: Champagne millesimato da Pinot Noir e Chardonnay provenienti da vigneti della maison.",
      "Fu creato nel 1876 per lo zar Alessandro II; il fondo piatto e il vetro trasparente nacquero per la corte."
    ),
    "Krug Grande Cuvée": drinkProfile(
      "Ingredienti e stile: Champagne da Pinot Noir, Chardonnay e Meunier, assemblato con molti vini di riserva.",
      "Ogni edizione riunisce oltre cento vini di numerose annate per ricreare ogni volta la stessa ampiezza."
    ),
    "Dom Pérignon 2013": drinkProfile(
      "Ingredienti e stile: Champagne millesimato 2013 da Pinot Noir e Chardonnay, teso e minerale.",
      "L'annata 2013 maturò lentamente: la vendemmia tardiva ha dato una cuvée più verticale della 2012."
    ),
  },
  gin: {
    Amuerte: drinkProfile(
      "Ingredienti: Amuerte gin, acqua tonica, ghiaccio e una guarnizione agrumata o tropicale.",
      "Tra le botaniche compaiono foglie di coca peruviane e frutti tropicali, oltre a ginepro e spezie."
    ),
    Aviation: drinkProfile(
      "Ingredienti: Aviation gin con ginepro, coriandolo, cardamomo, lavanda, anice, salsapariglia e scorza d'arancia; tonica e ghiaccio.",
      "È un American Dry meno dominato dal ginepro, con lavanda e salsapariglia ben riconoscibili."
    ),
    Ballykeefe: drinkProfile(
      "Ingredienti: Ballykeefe Irish gin, acqua tonica, ghiaccio e scorza di agrume.",
      "È un gin irlandese grain-to-glass: la distilleria segue il cereale dalla propria azienda agricola al bicchiere."
    ),
    "Base Gordon's": drinkProfile(
      "Ingredienti: Gordon's London Dry gin, acqua tonica, ghiaccio e spicchio di lime.",
      "Ginepro, coriandolo, angelica e liquirizia costruiscono il suo profilo classico e asciutto."
    ),
    "Base Mr. Higgins": drinkProfile(
      "Ingredienti: Mr. Higgins gin, acqua tonica, ghiaccio e guarnizione scelta in base alla bottiglia disponibile.",
      "La guarnizione viene decisa al banco dopo l'assaggio, così non copre le botaniche specifiche dell'etichetta."
    ),
    Bombay: drinkProfile(
      "Ingredienti: Bombay Sapphire, tonica, ghiaccio e limone; ginepro, coriandolo, angelica, agrumi e altre sei botaniche nel gin.",
      "L'infusione a vapore estrae le dieci botaniche senza bollirle direttamente nello spirito."
    ),
    Brockmans: drinkProfile(
      "Ingredienti: Brockmans gin, tonica, ghiaccio, pompelmo e frutti di bosco; nel gin anche ginepro, coriandolo e agrumi.",
      "Mora e mirtillo rendono il profilo più morbido e fruttato di un London Dry tradizionale."
    ),
    Bulldog: drinkProfile(
      "Ingredienti: Bulldog gin, tonica, ghiaccio e lime; dodici botaniche tra cui ginepro, dragon eye, loto, papavero e agrumi.",
      "Dragon eye e foglie di loto sono due botaniche asiatiche rare nella categoria London Dry."
    ),
    Dolcevita: drinkProfile(
      "Ingredienti: Dolcevita gin, acqua tonica, ghiaccio e scorza d'arancia, secondo l'etichetta disponibile al banco.",
      "Il servizio resta volutamente essenziale per lasciare leggibile il carattere del gin selezionato."
    ),
    Engine: drinkProfile(
      "Ingredienti: Engine gin con ginepro, limone, salvia e liquirizia; tonica, ghiaccio e scorza di limone.",
      "La latta ricorda un olio motore, mentre salvia e limone richiamano ingredienti piemontesi."
    ),
    "Fifty Pounds": drinkProfile(
      "Ingredienti: Fifty Pounds London Dry gin, tonica, ghiaccio e limone; la ricetta comprende undici botaniche.",
      "Il nome ricorda la tassa di cinquanta sterline imposta ai distillatori inglesi dal Gin Act del 1736."
    ),
    "Gin Mare": drinkProfile(
      "Ingredienti: Gin Mare, tonica, ghiaccio e rosmarino; oliva Arbequina, basilico, timo e rosmarino nel distillato.",
      "Le botaniche mediterranee vengono distillate separatamente per rispettarne tempi e intensità differenti."
    ),
    "Hendrick's": drinkProfile(
      "Ingredienti: Hendrick's gin, acqua tonica, ghiaccio e cetriolo; ginepro, botaniche, rosa e cetriolo nel gin.",
      "Rosa e cetriolo vengono aggiunti come essenze dopo la distillazione e sono la firma della bottiglia."
    ),
    "Hendrick's Viola": drinkProfile(
      "Ingredienti: variante Hendrick's alla viola proposta dal locale, tonica, ghiaccio e guarnizione floreale.",
      "La viola sposta il gin tonic verso un profilo più profumato: una tonica neutra evita di coprirlo."
    ),
    "Hendrick's Amazonia": drinkProfile(
      "Ingredienti: variante Hendrick's Amazonia, tonica, ghiaccio e guarnizione tropicale selezionata.",
      "Questa referenza punta su accenti tropicali; il servizio lungo mantiene il sorso fresco e leggibile."
    ),
    "Lola Vera": drinkProfile(
      "Ingredienti: Lola Vera gin, acqua tonica, ghiaccio e guarnizione abbinata alla referenza presente al banco.",
      "Per questa etichetta il locale sceglie la guarnizione dopo aver verificato il lotto, evitando abbinamenti automatici."
    ),
    Malfy: drinkProfile(
      "Ingredienti: Malfy gin, tonica, ghiaccio e agrume fresco; ginepro, coriandolo, angelica, cassia e scorze nel distillato.",
      "Gli agrumi italiani danno al gin un'apertura luminosa e un finale meno resinoso."
    ),
    Monkey: drinkProfile(
      "Ingredienti: Monkey 47 gin, tonica secca, ghiaccio e pompelmo; quarantasette botaniche nel distillato.",
      "Le 47 botaniche e i 47 gradi alcolici spiegano il numero nel nome di questo gin della Foresta Nera."
    ),
    "Nordés": drinkProfile(
      "Ingredienti: Nordés gin da uva Albariño, tonica, ghiaccio e uva; undici botaniche tra cui salvia, alloro ed eucalipto.",
      "La base d'uva e le erbe galiziane gli danno un carattere floreale e atlantico."
    ),
    Portofino: drinkProfile(
      "Ingredienti: Portofino Dry Gin, tonica, ghiaccio e limone; ventuno botaniche liguri tra cui ginepro, lavanda, rosmarino e maggiorana.",
      "La ricetta raccoglie profumi del promontorio di Portofino e li traduce in un gin mediterraneo."
    ),
    "Rena 41": drinkProfile(
      "Ingredienti: Rena 41 gin con botaniche sarde, acqua tonica, ghiaccio e guarnizione mediterranea.",
      "Nasce in Sardegna, vicino a Porto Cervo, e costruisce la propria identità su materie botaniche dell'isola."
    ),
    Rivo: drinkProfile(
      "Ingredienti: Rivo gin, tonica, ghiaccio e limone; dodici botaniche con erbe e fiori raccolti sul Lago di Como.",
      "Melissa e timo del territorio lariano contribuiscono al suo profilo erbaceo e agrumato."
    ),
    "Royal Windsor": drinkProfile(
      "Ingredienti: Royal Windsor gin, acqua tonica, ghiaccio e scorza d'arancia, come da bottiglia disponibile.",
      "Una tonica asciutta è scelta per non aggiungere aromi estranei alla referenza servita."
    ),
    Santamania: drinkProfile(
      "Ingredienti: Santamania gin da spirito d'uva, tonica e ghiaccio; ginepro, coriandolo, cardamomo, cannella, angelica, agrumi ed erbe.",
      "La base d'uva dona maggiore rotondità, mentre le tredici botaniche mantengono il finale balsamico."
    ),
    Santana: drinkProfile(
      "Ingredienti: Santana gin, acqua tonica, ghiaccio e guarnizione definita sul profilo della bottiglia al banco.",
      "Il locale evita una decorazione fissa: agrume o erba vengono scelti soltanto se coerenti con il gin."
    ),
    Tanqueray: drinkProfile(
      "Ingredienti: Tanqueray London Dry gin, tonica, ghiaccio e lime; ginepro, coriandolo, angelica e liquirizia nel gin.",
      "Quattro botaniche essenziali e molto ginepro lo rendono uno dei gin tonic più netti e classici."
    ),
  },
  aperitivo: {
    "Bitter pompelmo": drinkProfile(
      "Ingredienti: bitter analcolico, pompelmo, soda e ghiaccio.",
      "Il pompelmo unisce acidità e amaro naturale, lasciando il palato pulito prima del cibo."
    ),
    "Buffet drink": drinkProfile(
      "Ingredienti: drink della formula buffet scelto tra le proposte disponibili, con ghiaccio e guarnizione dedicata.",
      "La composizione viene comunicata al banco perché cambia con la proposta buffet del giorno."
    ),
    "Campari con bianco": drinkProfile(
      "Ingredienti: Campari, vino bianco, ghiaccio e fetta d'arancia.",
      "Il vino bianco allunga il bitter senza aggiungere dolcezza intensa e rende il sorso più vinoso."
    ),
    "Campari Soda": drinkProfile(
      "Ingredienti: Campari, soda e scorza d'arancia, serviti molto freddi.",
      "La bottiglietta conica disegnata da Fortunato Depero nel 1932 è un'icona del design italiano."
    ),
    Crodino: drinkProfile(
      "Ingredienti: aperitivo analcolico con infusi aromatici, spezie, agrumi, acqua e zucchero; ghiaccio e arancia.",
      "Il suo colore e il finale amaricante conservano il rito dell'aperitivo senza alcol."
    ),
    "Offerta Spritz": drinkProfile(
      "Ingredienti: prosecco, bitter da aperitivo, soda, ghiaccio e fetta d'arancia.",
      "La proporzione 3-2-1 mantiene in equilibrio bollicina, parte amaricante e diluizione."
    ),
    Tagliere: drinkProfile(
      "Ingredienti: piccolo assortimento salato del giorno; la composizione e gli allergeni vengono indicati al banco.",
      "La selezione cambia con la disponibilità, così resta fresca invece di essere una composizione fissa."
    ),
    "Tagliere base": drinkProfile(
      "Ingredienti: salumi, formaggi, focaccia o pane e accompagnamenti della casa, secondo disponibilità.",
      "È calibrato per la condivisione e alterna sapidità, parte lattica e una base da forno."
    ),
    "Tagliere premium": drinkProfile(
      "Ingredienti: selezione superiore di salumi e formaggi, prodotti da forno e accompagnamenti stagionali.",
      "La versione premium privilegia referenze più ricercate e contrasti dolci-salati da abbinare al calice."
    ),
  },
  birre: {
    "Birra in bottiglia": drinkProfile(
      "Ingredienti: quelli riportati sull'etichetta scelta; marca e stile disponibili vengono comunicati al banco.",
      "Controllare l'etichetta è il modo corretto per conoscere cereali, gradazione e possibili allergeni della bottiglia."
    ),
    "Birra media e trancio": drinkProfile(
      "Ingredienti: birra alla spina da acqua, malto, luppolo e lievito, più trancio con impasto, pomodoro e mozzarella.",
      "L'amaro del luppolo e la carbonazione alleggeriscono la parte filante e saporita della pizza."
    ),
    "Birra spina media": drinkProfile(
      "Ingredienti: acqua, malto d'orzo, luppolo e lievito della birra disponibile alla spina, formato medio.",
      "Il formato medio permette alla schiuma di proteggere gli aromi mentre la birra resta fresca più a lungo."
    ),
    "Birra spina piccola": drinkProfile(
      "Ingredienti: acqua, malto d'orzo, luppolo e lievito della birra disponibile alla spina, formato piccolo.",
      "Il formato piccolo è ideale per berla alla temperatura di servizio prima che perda vivacità."
    ),
    Ceres: drinkProfile(
      "Ingredienti: acqua, malto d'orzo, cereali, luppolo e lievito.",
      "Ceres Strong Ale ha una gradazione più alta di una lager comune e un finale più caldo e maltato."
    ),
    Corona: drinkProfile(
      "Ingredienti: acqua, malto d'orzo, cereali non maltati, luppolo e lievito; lime nel servizio.",
      "Lo spicchio di lime è un rito di servizio internazionale, non un ingrediente della birra in bottiglia."
    ),
    Guinness: drinkProfile(
      "Ingredienti: acqua, malto d'orzo, orzo tostato, luppolo e lievito, spillati con azoto.",
      "Le bolle di azoto creano la celebre cascata e una schiuma più compatta rispetto all'anidride carbonica."
    ),
    Heineken: drinkProfile(
      "Ingredienti: acqua, malto d'orzo, estratto di luppolo e lievito A.",
      "Il lievito A, isolato nel 1886, contribuisce alle leggere note fruttate tipiche della birra."
    ),
    Ichnusa: drinkProfile(
      "Ingredienti: acqua, malto d'orzo, mais e luppolo.",
      "Il nome deriva dall'antica denominazione greca della Sardegna, isola a cui il marchio è legato dal 1912."
    ),
    "Ichnusa 50 cl": drinkProfile(
      "Ingredienti: acqua, malto d'orzo, mais e luppolo, nel formato da 50 cl.",
      "Il mezzo litro è pensato per un servizio più lungo: versarla in due tempi aiuta a conservare la schiuma."
    ),
    "Moretti grande": drinkProfile(
      "Ingredienti: acqua, malto d'orzo, mais e luppolo, serviti nel formato grande.",
      "Birra Moretti nasce a Udine nel 1859; il Baffo arrivò sull'etichetta nel Novecento."
    ),
    Panaché: drinkProfile(
      "Ingredienti: birra lager e gassosa al limone, miscelate fredde.",
      "La limonata abbassa gradazione e amarezza, creando una bevuta più leggera e agrumata."
    ),
    Paulaner: drinkProfile(
      "Ingredienti: acqua, malto di frumento e d'orzo, luppolo e lievito nella referenza Paulaner disponibile.",
      "Nelle Weissbier il lievito resta protagonista con profumi che ricordano banana e chiodo di garofano."
    ),
    "Tennent's": drinkProfile(
      "Ingredienti: acqua, malto d'orzo, luppolo e lievito.",
      "Il marchio nasce a Glasgow; la versione Super è conosciuta per corpo maltato e gradazione sostenuta."
    ),
  },
  whisky: {
    "Ballantine's": drinkProfile(
      "Ingredienti e stile: blended Scotch whisky da distillati di malto e cereali affinati in rovere.",
      "Miltonduff e Glenburgie sono due malti importanti nel carattere morbido e mielato del blend."
    ),
    "Chivas 12": drinkProfile(
      "Ingredienti e stile: blended Scotch whisky di malto e cereali, con componenti invecchiati almeno dodici anni.",
      "Strathisla, una delle più antiche distillerie delle Highlands, è un malto chiave della miscela."
    ),
    Cognac: drinkProfile(
      "Ingredienti e stile: vino bianco, soprattutto da uva Ugni Blanc, distillato due volte e affinato in rovere francese.",
      "Per chiamarsi Cognac deve nascere nella regione delimitata e rispettare doppia distillazione e invecchiamento."
    ),
    "Don Papa": drinkProfile(
      "Ingredienti e stile: rum filippino da melassa di canna da zucchero, servito liscio o con ghiaccio.",
      "Il clima caldo dell'isola di Negros accelera l'interazione tra distillato e botte."
    ),
    "J&B": drinkProfile(
      "Ingredienti e stile: blended Scotch whisky composto da numerosi whisky di malto e cereali.",
      "La miscela è tradizionalmente guidata da malti dello Speyside e punta su leggerezza e note fruttate."
    ),
    "Jack Daniel's": drinkProfile(
      "Ingredienti e stile: Tennessee whiskey da 80% mais, 8% segale e 12% malto d'orzo.",
      "Prima della botte attraversa lentamente carbone d'acero, il Lincoln County Process."
    ),
    "Johnnie Walker Red Label": drinkProfile(
      "Ingredienti e stile: blended Scotch whisky di malto e cereali, con note speziate e leggermente affumicate.",
      "Fu costruito per mantenere carattere anche nei long drink, non soltanto nel servizio liscio."
    ),
    Laphroaig: drinkProfile(
      "Ingredienti e stile: single malt Scotch di Islay da orzo maltato, acqua, lievito, torba e rovere.",
      "La torba di Islay genera i celebri richiami affumicati, iodati e marini."
    ),
    "Revel Stoke Spiced": drinkProfile(
      "Ingredienti e stile: Canadian whisky aromatizzato con spezie, vaniglia e note di cannella.",
      "È pensato per un sorso dolce-speziato e funziona anche con cola o ginger ale."
    ),
    "Stravecchio Branca": drinkProfile(
      "Ingredienti e stile: brandy italiano da distillati di vino affinati in botti di rovere.",
      "Il lungo riposo in legno arrotonda il distillato e sviluppa note di vaniglia, frutta secca e spezie."
    ),
  },
  amari: {
    "Amaro Cenote": drinkProfile(
      "Ingredienti e stile: tequila Cenote da 100% agave blu Weber, servita come proposta da fine pasto.",
      "Non è tecnicamente un amaro: il nome nel listino indica la sezione di servizio, mentre il prodotto è tequila."
    ),
    "Amaro del Capo": drinkProfile(
      "Ingredienti: infuso di ventinove erbe, fiori, frutti e radici calabresi, tra cui agrumi, liquirizia, menta e camomilla.",
      "La casa consiglia il servizio a -20 °C per evidenziare le note fresche e balsamiche."
    ),
    "Amaro Don Julio": drinkProfile(
      "Ingredienti e stile: tequila Don Julio da 100% agave blu Weber, servita liscia.",
      "Anche questa voce è una tequila collocata nella sezione dopocena, non un liquore amaro alle erbe."
    ),
    "Amaro Gin": drinkProfile(
      "Ingredienti: gin o amaro a base gin indicato al banco, servito liscio o con ghiaccio secondo la referenza.",
      "La bottiglia viene mostrata prima del servizio per chiarire botaniche e gradazione di questa voce generica."
    ),
    "Amaro Lucano": drinkProfile(
      "Ingredienti: infuso di oltre trenta erbe e spezie, tra cui assenzio, salvia, genziana, arancia e angelica.",
      "La ricetta fu creata a Pisticci nel 1894 dal pasticcere Pasquale Vena."
    ),
    Assenzio: drinkProfile(
      "Ingredienti: alcol, grande assenzio, anice verde, finocchio e altre botaniche aromatiche.",
      "Il louche, la velatura che appare con acqua fredda, nasce dagli oli essenziali di anice e finocchio."
    ),
    Averna: drinkProfile(
      "Ingredienti: infuso di erbe, radici e scorze di agrumi, zucchero e caramello.",
      "Nato in Sicilia nell'Ottocento, combina arancia, liquirizia e una morbida vena caramellata."
    ),
    Baileys: drinkProfile(
      "Ingredienti: crema di latte irlandese, Irish whiskey, cacao, vaniglia e zucchero.",
      "L'emulsione mantiene insieme crema e whiskey senza bisogno di conservanti nel prodotto chiuso."
    ),
    "Branca Menta": drinkProfile(
      "Ingredienti: base Fernet-Branca con erbe, radici e spezie, arricchita da olio essenziale di menta piperita.",
      "Fu sviluppato negli anni Sessanta unendo la complessità del Fernet a un finale nettamente mentolato."
    ),
    Braulio: drinkProfile(
      "Ingredienti: erbe e radici alpine, tra cui genziana, ginepro, assenzio e achillea, con affinamento in legno.",
      "Nasce a Bormio e porta nel bicchiere un profilo balsamico che richiama i boschi di montagna."
    ),
    Chupito: drinkProfile(
      "Ingredienti: una dose del distillato o liquore base disponibile, dichiarato al momento dell'ordine.",
      "Chupito indica il formato, non una ricetta: per questo prodotto e gradazione vanno scelti prima del servizio."
    ),
    "Chupito Cenote": drinkProfile(
      "Ingredienti: una dose di tequila Cenote da 100% agave blu Weber.",
      "Il piccolo formato concentra il profumo dell'agave; berlo lentamente evita di perdere le note vegetali."
    ),
    "Chupito Premium": drinkProfile(
      "Ingredienti: una dose di distillato premium selezionato e mostrato al cliente prima del servizio.",
      "La categoria premium cambia etichetta: il valore è nella bottiglia scelta, non in una miscela segreta."
    ),
    Disaronno: drinkProfile(
      "Ingredienti: liquore aromatico con zucchero bruciato, essenze di frutta ed erbe, dal gusto di mandorla.",
      "Il profilo ricorda la mandorla pur non contenendo mandorle, una particolarità spesso poco conosciuta."
    ),
    "Fernet Branca": drinkProfile(
      "Ingredienti: ventisette erbe, radici e spezie, tra cui aloe, genziana, camomilla e rabarbaro.",
      "Dopo l'infusione riposa in grandi botti di rovere, che integrano il carattere intensamente erbaceo."
    ),
    Herbas: drinkProfile(
      "Ingredienti: liquore all'anice con erbe mediterranee come rosmarino, timo, finocchio, ginepro, menta e agrumi.",
      "Le Hierbas Ibicencas sono una specialità delle Baleari e possono essere secche o più dolci."
    ),
    Jägermeister: drinkProfile(
      "Ingredienti: cinquantasei erbe, radici, fiori, frutti e spezie, macerati e affinati in rovere.",
      "La ricetta riposa per mesi prima dell'aggiunta di acqua, alcol, zucchero e caramello."
    ),
    Jameson: drinkProfile(
      "Ingredienti e stile: Irish whiskey da orzo maltato e non maltato con whiskey di cereali, tripla distillazione.",
      "La tripla distillazione contribuisce al profilo più morbido e leggero rispetto a molti Scotch."
    ),
    Jefferson: drinkProfile(
      "Ingredienti: amaro calabrese con bergamotto, arance amare e dolci, rosmarino, origano e altre botaniche.",
      "Il bergamotto lega agrume e parte erbacea, dando a Jefferson un'identità marcatamente calabrese."
    ),
    Limoncello: drinkProfile(
      "Ingredienti: scorze di limone, alcol, acqua e zucchero.",
      "Si usano soltanto le scorze senza parte bianca, che renderebbe l'infuso inutilmente amaro."
    ),
    "Monte doppio": drinkProfile(
      "Ingredienti: doppia dose di Amaro Montenegro, da quaranta botaniche e dodici essenze aromatiche.",
      "Il formato doppio amplifica arancia, spezie dolci ed erbe: va sorseggiato, non bevuto come uno shot."
    ),
    Montenegro: drinkProfile(
      "Ingredienti: quaranta botaniche lavorate in dodici essenze, con agrumi, erbe, spezie, alcol, acqua e zucchero.",
      "L'ultima essenza, chiamata Premio, è così intensa che ne bastano poche gocce per bottiglia."
    ),
    Sambuca: drinkProfile(
      "Ingredienti: alcol, zucchero, acqua e oli essenziali di anice stellato o anice verde.",
      "Con tre chicchi di caffè diventa sambuca con la mosca: tradizionalmente rappresentano salute, felicità e prosperità."
    ),
    Shot: drinkProfile(
      "Ingredienti: una dose del prodotto scelto tra le bottiglie base disponibili, comunicato prima del servizio.",
      "Shot descrive soltanto la quantità: nome, allergeni e gradazione dipendono dalla bottiglia selezionata."
    ),
    "Vecchia Romagna": drinkProfile(
      "Ingredienti e stile: brandy italiano da vini di uva Trebbiano distillati e affinati in rovere.",
      "L'etichetta nera e la bottiglia triangolare sono diventate due segni storici del brandy italiano."
    ),
    Vodka: drinkProfile(
      "Ingredienti: distillato neutro di cereali e acqua; la marca disponibile viene indicata al banco.",
      "La neutralità non significa assenza di carattere: materia prima e filtrazione cambiano corpo e finale."
    ),
  },
  grappe: {
    "Castagner Riserva": drinkProfile(
      "Ingredienti e stile: acquavite di vinacce selezionate, distillata e affinata in legno.",
      "L'affinamento arrotonda l'impatto alcolico e aggiunge toni di vaniglia, frutta secca e spezie."
    ),
    "Grappa Amarone": drinkProfile(
      "Ingredienti e stile: distillato delle vinacce di uve usate per l'Amarone, come Corvina, Corvinone e Rondinella.",
      "Le vinacce di uve appassite conservano una ricchezza aromatica che rende il sorso più pieno e vinoso."
    ),
    "Grappa Barri": drinkProfile(
      "Ingredienti e stile: grappa della referenza Barri indicata al banco, ottenuta da vinacce e servita nel calice.",
      "La bottiglia viene mostrata prima del servizio perché il nome abbreviato del listino non identifica vitigno o affinamento."
    ),
    "Grappa Barricata": drinkProfile(
      "Ingredienti e stile: acquavite di vinacce affinata in piccole botti di legno.",
      "La barrique dona colore ambrato e aromi dolci, ma la materia prima resta sempre la vinaccia."
    ),
    "Grappa Bianca": drinkProfile(
      "Ingredienti e stile: distillato limpido di vinacce, non affinato in legno.",
      "L'assenza di botte mantiene in primo piano i profumi varietali dell'uva e un finale più diretto."
    ),
    "Grappa Gialla": drinkProfile(
      "Ingredienti e stile: grappa di vinacce con affinamento che le conferisce colore paglierino o ambrato.",
      "Il colore segnala il passaggio in legno o un affinamento aromatico, dettaglio confermato dall'etichetta al banco."
    ),
    Grappino: drinkProfile(
      "Ingredienti e stile: piccola dose di grappa bianca da vinacce selezionate.",
      "Grappino indica il formato ridotto: il calice stretto permette comunque di percepirne i profumi."
    ),
    Rum: drinkProfile(
      "Ingredienti e stile: distillato di melassa o succo di canna da zucchero; la bottiglia scelta viene indicata al banco.",
      "La materia prima distingue due famiglie: i rum di melassa più rotondi e quelli di puro succo più vegetali."
    ),
  },
};
