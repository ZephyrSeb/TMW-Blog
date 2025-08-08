
//var text = "<carddex><cards><card><name>Dawn Plaza Witch</name><text>Whenever you gain life, put a +1/+1 counter on Dawn Plaza Witch.</text><coloridentity>W</coloridentity><colors>W</colors><cmc>2</cmc><manacost>1W</manacost><pt>1/1</pt><type>Creature - Human Wizard</type><rarity>Common</rarity><set>KFS</set></card><card><name>Divine Arrow</name><text>Divine Arrow deals 4 damage to target attacking or blocking creature.</text><coloridentity>W</coloridentity><colors>W</colors><cmc>2</cmc><manacost>1W</manacost><pt></pt><type>Instant</type><rarity>Common</rarity><set>KFS</set></card><card><name>Herald of Good News</name><text>Flying \\n When Herald of Good News enters the battlefield, you gain 4 life.</text><coloridentity>W</coloridentity><colors>W</colors><cmc>4</cmc><manacost>2WW</manacost><pt>4/4</pt><type>Creature - Angel Faerie</type><rarity>Uncommon</rarity><set>KFS</set></card><card><name>Kindly Healer</name><text>Whenever another creature enters the battlefield under your control, you gain 1 life.</text><coloridentity>W</coloridentity><colors>W</colors><cmc>2</cmc><manacost>1W</manacost><pt>1/1</pt><type>Creature - Human Warlock</type><rarity>Common</rarity><set>KFS</set></card><card><name>Knight's Pledge</name><text>Enchant creature \\n Enchanted creature gets +2/+2.</text><coloridentity>W</coloridentity><colors>W</colors><cmc>2</cmc><manacost>1W</manacost><pt></pt><type>Enchantment - Aura</type><rarity>Common</rarity><set>KFS</set></card></cards></carddex>";
canvas = [];

var parser = new DOMParser();
var xmlDoc;
var page = 0;
var maxPage = 0;

async function OnLoad() {
    
    var xml = await fetch("assets/cards.xml");
    var text = await xml.text();
    xmlDoc = parser.parseFromString(text, "text/xml");
    Search();

    var input = document.getElementById("search")?.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        Search();
    }
});
}

function Prev() {
    if (page > 0) {
        page--;
        Search();
    }
}

function Next() {
    if (page < maxPage - 1) {
        page++;
        Search();
    }
}

async function LoadCards(cards) {
    var sortOption = document.getElementById("sort").value;
    cards = SortCards(cards, sortOption);
    var cardTable = document.getElementById("card_table");
    cardTable.innerHTML = '';
    var row;
    maxPage = Math.ceil(cards.length / 60);
    if (cards.length > 0) {
        for (let i = page * 60; i < cards.length && i < (page + 1) * 60; i++) {
            if (i % 4 == 0) {
                row = cardTable.insertRow();
            }
            var newCell = row.insertCell(-1);
            canvas[i] = document.createElement('canvas');
            newCell.appendChild(canvas[i]);
            canvas[i].style.width = 252 + 'px';
            canvas[i].style.height = 352 + 'px';
            canvas[i].width = 504;
            canvas[i].height = 704;
            if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("layout")[0].textContent == "transform") {
                let button = document.createElement('button');
                newCell.appendChild(button);
                button.style.paddingLeft = 10;
                button.style.paddingRight = 10;
                button.style.paddingTop = 5;
                button.style.paddingBottom = 5;
                button.textContent = "Transform";
                button.style.border = 0;
                button.style.display = "flex"
                button.style.justifySelf = "center";
                let transformed = false;
                button.addEventListener("click", function(){
                    let newCard;
                    let rawCards = xmlDoc.getElementsByTagName("carddex")[0].getElementsByTagName("cards")[0].getElementsByTagName("card");
                    for (let j = 0; j < rawCards.length; j++) {
                        if (rawCards[j].getElementsByTagName("name")[0].textContent == cards[i].getElementsByTagName('backface')[0].textContent) {
                            newCard = rawCards[j];
                        }
                    }
                    if (!transformed) {
                        DrawCard(canvas[i], newCard);
                        transformed = true;
                    }
                    else {
                        DrawCard(canvas[i], cards[i]);
                        transformed = false;
                    }
                    
                });
            }
        }

        for (let i = page * 60; i < cards.length && i < (page + 1) * 60; i++) {
            DrawCard(canvas[i], cards[i]);
        }
    }
    var cardCountText = document.getElementById("card-count");
    cardCountText.textContent = "Showing " + ((page * 60) + 1) + "-" + Math.min((page + 1) * 60, cards.length) + " of " + cards.length + " cards.";
}

function DrawCard(canvas, card) {
    let imgPT = new Image();
    imgPT.src = GetCardPT(card);
    let imgRarity = new Image();
    imgRarity.src = GetSetSymbol(card.getElementsByTagName("set")[0].getElementsByTagName("code")[0].textContent, card.getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent);
    manaBack = new Image();
    var manaSymbol = [];
    manaBack.src = "assets/card-parts/mana-symbol-back.svg";
    var manacost = card.getElementsByTagName("prop")[0].getElementsByTagName("manacost")[0].textContent;
            manaSymbol = [];
            for (let j = 0; j < manacost.length; j++) {
                manaSymbol[j] = new Image();
                manaSymbol[j].src = findManaSymbol(manacost.at(manacost.length - 1 - j));
            }
    let imgBack = new Image();
    imgBack.src = GetCardBack(card);
            
    imgBack.onload = function() {
        context = canvas.getContext('2d');
        let name = card.getElementsByTagName("name")[0].textContent;
        let type = card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent;
        let textbox = card.getElementsByTagName("text")[0].textContent;
        let pt = card.getElementsByTagName("prop")[0].getElementsByTagName("pt")[0].textContent;
        let setno = "TMW-"+ card.getElementsByTagName("set")[0].getElementsByTagName("code")[0].textContent + " " + card.getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent.at(0);
        let manacost = card.getElementsByTagName("prop")[0].getElementsByTagName("manacost")[0].textContent;
        let manavalue = card.getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent;
        let pw = 0;
        if (type.includes("Planeswalker")) pw = 10
        context.drawImage(imgBack, 0, 0, 504, 704);
        if (type.includes("Creature") || type.includes("Vehicle")) context.drawImage(imgPT, 390, 626, 88, 42);
        for (let j = 0; j < manacost.length; j++) {
            context.drawImage(manaBack, 439.5 - 26 * j, 42 - pw, 24, 24);
            context.drawImage(manaSymbol[j], 440 - 26 * j, 40 - pw, 24, 24);
        }
        context.font="20pt Beleren";
        context.fillStyle = "#000000";
        context.fillText(name, 48, 64 - pw, 396 - 20 * manacost.length);
        if (!type.includes("Saga") && !type.includes("Planeswalker")) {
            context.font="18pt Beleren";
            context.fillText(type, 48, 424, 384);
            context.font="16pt MPlantin";
            wrapText(context, textbox, 48, 544, 408, 20);
            context.drawImage(imgRarity, 432, 400, 32, 32);
        }
        if (type.includes("Saga")) {
            context.font="18pt Beleren";
            context.fillText(type, 48, 624, 384);
            context.drawImage(imgRarity, 432, 600, 32, 32);
            context.font="16pt MPlantin";
            let uniqueChapters = card.getElementsByTagName("text").length;
            let chapters = card.getElementsByTagName("text")[uniqueChapters - 1].textContent.split(" — ")[0].split(",")[card.getElementsByTagName("text")[uniqueChapters - 1].textContent.split(" — ")[0].split(",").length - 1];
            wrapText(context, card.getElementsByTagName("text")[0].textContent, 42, 102, 206, 20, "Saga");
            for (let s = 0; s < uniqueChapters - 1; s++) {
                wrapText(context, card.getElementsByTagName("text")[s + 1].textContent.split(" — ")[1], 64, 228 + (s * 428 / uniqueChapters), 184, 20, "Saga");
            }
        }
        context.font="Bold 22pt MPlantin"
        context.textAlign = "center";
        context.fillText(pt, 434, 656);
        if (type.includes("Planeswalker")) {
            context.textAlign = "left";
            context.font="18pt Beleren";
            context.fillText(type, 48, 424, 384);
            context.drawImage(imgRarity, 432, 400, 32, 32);
            for (let s = 0; s < card.getElementsByTagName("text").length; s++) {
                let text = card.getElementsByTagName("text")[s].textContent;
                if (card.getElementsByTagName("text")[s].textContent.indexOf(": ") > -1) {
                    text = card.getElementsByTagName("text")[s].textContent.split(": ")[1];
                }
                if (Number(card.getElementsByTagName("text")[s].textContent.split(": ")[0]) > 0) {
                    let img = new Image();
                    img.src = "assets/card-parts/loyalty-up.svg";
                    context.drawImage(img, 22, 448 + 64 * s, 64, 40);
                    context.font="Bold 17pt Beleren";
                    context.fillStyle = "#FFFFFF";
                    context.textAlign = "center";
                    context.fillText(card.getElementsByTagName("text")[s].textContent.split(": ")[0], 52, 477 + 64 * s);
                }
                if (Number(card.getElementsByTagName("text")[s].textContent.split(": ")[0]) < 0) {
                    let img = new Image();
                    img.src = "assets/card-parts/loyalty-down.svg";
                    context.drawImage(img, 22, 456 + 64 * s, 64, 40);
                    context.font="Bold 17pt Beleren";
                    context.fillStyle = "#FFFFFF";
                    context.textAlign = "center";
                    context.fillText(card.getElementsByTagName("text")[s].textContent.split(": ")[0], 52, 480 + 64 * s);
                }
                if (Number(card.getElementsByTagName("text")[s].textContent.split(": ")[0]) == 0) {
                    let img = new Image();
                    img.src = "assets/card-parts/loyalty-0.svg";
                    context.drawImage(img, 22, 456 + 64 * s, 64, 40);
                }
                context.textAlign = "left";
                context.font="14pt MPlantin";
                context.fillStyle = "#000000";
                wrapText(context, text, 92, 478 + s * 64, 460-92, 16, "Planeswalker");
            }
            context.font="Bold 22pt Beleren";
            context.textAlign = "center";
            context.fillStyle = "#FFFFFF";
            context.fillText(card.getElementsByTagName("prop")[0].getElementsByTagName("loyalty")[0].textContent, 442, 654);
        }
        context.font="12pt Beleren Small Caps";
        context.textAlign = "left";
        context.fillStyle = "#FFFFFF";
        context.fillText(setno, 32, 672);
    }
}

function SortCards(cards, sort) {
    if (cards.length > 0) {
        if (sort == "name") {
            let sorted = false;
            let smartI = 0;
            while (!sorted) {
                sorted = true;
                for (let i = 0; i < cards.length - 1 - smartI; i++) {
                    if (cards[i].getElementsByTagName("name")[0].textContent.localeCompare(cards[i+1].getElementsByTagName("name")[0].textContent) == 1) {
                        let temp = cards[i+1];
                        cards[i+1] = cards[i];
                        cards[i] = temp;
                        sorted = false;
                    }
                }
                smartI++;
            }
            return cards;
        }
        if (sort == "color") {
            let sorted = false;
            let smartI = 0;
            while (!sorted) {
                sorted = true;
                for (let i = 0; i < cards.length - 1 - smartI; i++) {
                    let color = 6;
                    let resort = false;
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "W") color = 0;
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "U") color = 1;
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "B") color = 2;
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "R") color = 3;
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "G") color = 4;
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent.length > 1) color = 5;
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Land")) color = 7;

                    let nextColor = 6;
                    if (cards[i+1].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "W") nextColor = 0;
                    if (cards[i+1].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "U") nextColor = 1;
                    if (cards[i+1].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "B") nextColor = 2;
                    if (cards[i+1].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "R") nextColor = 3;
                    if (cards[i+1].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "G") nextColor = 4;
                    if (cards[i+1].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent.length > 1) nextColor = 5;
                    if (cards[i+1].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Land")) nextColor = 7;
                    if (color == nextColor) {
                        if (cards[i].getElementsByTagName("name")[0].textContent.localeCompare(cards[i+1].getElementsByTagName("name")[0].textContent) == 1) resort = true;
                    }
                    if (color > nextColor) resort = true;
                    if (resort) {
                        let temp = cards[i+1];
                        cards[i+1] = cards[i];
                        cards[i] = temp;
                        sorted = false;
                    }
                }
                smartI++;
            }
            return cards;
        }
        if (sort="mv") {
            let sorted = false;
            let smartI = 0;
            while (!sorted) {
                sorted = true;
                for (let i = 0; i < cards.length - 1 - smartI; i++) {
                    let resort = false;
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent >
                        cards[i+1].getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent) resort = true;
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent ==
                        cards[i+1].getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent) {
                            if (cards[i].getElementsByTagName("name")[0].textContent.localeCompare(cards[i+1].getElementsByTagName("name")[0].textContent) == 1) resort = true;
                        }
                    if (resort) {
                        let temp = cards[i+1];
                        cards[i+1] = cards[i];
                        cards[i] = temp;
                        sorted = false;
                    }
                }
                smartI++;
            }
            return cards;
        }
    }
}

function wrapText(context, text, x, y, maxWidth, lineHeight, type = "") {
    var words = text.split(' ');
    var line = '';
    var lines = 0;
    mana_dict = {
        "{W}": "assets/card-parts/white-mana-symbol.svg",
        "{U}": "assets/card-parts/blue-mana-symbol.svg",
        "{B}": "assets/card-parts/black-mana-symbol.svg",
        "{R}": "assets/card-parts/red-mana-symbol.svg",
        "{G}": "assets/card-parts/green-mana-symbol.svg",
        "{C}": "assets/card-parts/colorless-mana-symbol.svg",
        "{T}": "assets/card-parts/tap-symbol.svg",
        "{1}": "assets/card-parts/generic-mana-symbol-1.svg",
        "{2}": "assets/card-parts/generic-mana-symbol-2.svg",
        "{3}": "assets/card-parts/generic-mana-symbol-3.svg",
        "{4}": "assets/card-parts/generic-mana-symbol-4.svg",
        "{5}": "assets/card-parts/generic-mana-symbol-5.svg",
        "{6}": "assets/card-parts/generic-mana-symbol-6.svg",
        "{7}": "assets/card-parts/generic-mana-symbol-7.svg",
        "{8}": "assets/card-parts/generic-mana-symbol-8.svg",
        "{9}": "assets/card-parts/generic-mana-symbol-9.svg",
        "{X}": "assets/card-parts/generic-mana-symbol-x.svg",
        "{W/U}": "assets/card-parts/azorius-mana-symbol.svg",
        "{U/B}": "assets/card-parts/dimir-mana-symbol.svg",
        "{B/R}": "assets/card-parts/rakdos-mana-symbol.svg",
        "{R/G}": "assets/card-parts/gruul-mana-symbol.svg",
        "{G/W}": "assets/card-parts/selesnya-mana-symbol.svg",
        "{W/B}": "assets/card-parts/orzhov-mana-symbol.svg",
        "{U/R}": "assets/card-parts/izzet-mana-symbol.svg",
        "{B/G}": "assets/card-parts/golgari-mana-symbol.svg",
        "{R/W}": "assets/card-parts/boros-mana-symbol.svg",
        "{G/U}": "assets/card-parts/simic-mana-symbol.svg"
    };

    for (let n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            line = words[n].split('\n')[0] + ' ';
            if (words[n].includes('\n')) {
                if (words[n].split('\n')[1].length > 0) {
                    lines += 1.5;
                }
            }
            lines++;
        }
        else {
            if (words[n].includes('\n')) {
                lines += 1.5;
            }
            else line = testLine;
        }
    }
    lines++;
    line = '';
    if (type != "Saga") y = Math.max(y - ((lines - 1) / 2) * lineHeight, 232 * 2);
    if (type == "Planeswalker" && lines>=5) {
        context.font = "12pt MPlantin";
        lineHeight = 14;
        y -= 6;
    }
    if (lines >= 10) {
        context.font="14pt MPlantin";
        lineHeight = 18;
    }

    for(let n = 0; n < words.length; n++) {
        if (words[n].includes("\n")) {
            
            var testLine = line + words[n].split('\n')[0];
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n].split('\n')[0];
                y += lineHeight;
                context.fillText(words[n].split('\n')[0], x, y);
                y += lineHeight * 1.5;
            }
            else {
                line = testLine;
                context.fillText(line, x, y);
                y += lineHeight * 1.5;
            }
            words[n] = words[n].split('\n')[1]
            n--;
            line = '';
        }
        else if (words[n].substring(0,1) == "{") {
            let img = new Image;
            img.src = mana_dict[words[n].substring(0, words[n].indexOf("}") + 1)]
            context.drawImage(img, x + context.measureText(line).width + 1, y - lineHeight + 4, 18, 18);
            words[n] = words[n].slice(words[n].indexOf("}") + 1);
            n--;
            line = line + '    ';
        }
        else {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
    }
    context.fillText(line, x, y);
}

function findManaSymbol(s) {
    if (s == "W") return "assets/card-parts/white-mana-symbol.svg";
    else if (s == "U") return "assets/card-parts/blue-mana-symbol.svg";
    else if (s == "B") return "assets/card-parts/black-mana-symbol.svg";
    else if (s == "R") return "assets/card-parts/red-mana-symbol.svg";
    else if (s == "G") return "assets/card-parts/green-mana-symbol.svg";
    else if (s == "1") return "assets/card-parts/generic-mana-symbol-1.svg";
    else if (s == "2") return "assets/card-parts/generic-mana-symbol-2.svg";
    else if (s == "3") return "assets/card-parts/generic-mana-symbol-3.svg";
    else if (s == "4") return "assets/card-parts/generic-mana-symbol-4.svg";
    else if (s == "5") return "assets/card-parts/generic-mana-symbol-5.svg";
    else if (s == "6") return "assets/card-parts/generic-mana-symbol-6.svg";
    else if (s == "7") return "assets/card-parts/generic-mana-symbol-7.svg";
    else if (s == "8") return "assets/card-parts/generic-mana-symbol-8.svg";
    else if (s == "9") return "assets/card-parts/generic-mana-symbol-9.svg";
    else if (s == "X") return "assets/card-parts/generic-mana-symbol-x.svg";
    else return "assets/card-parts/white-mana-symbol.svg";
}

function ResetSearch() {
    page = 0;
    Search();
}

function Search() {
    window.scrollTo(0,0);
    var searchCriteria = document.getElementById("search").value;   
    var rawCards = xmlDoc.getElementsByTagName("carddex")[0].getElementsByTagName("cards")[0].getElementsByTagName("card");
    var cards = [];
    for (let i = 0; i < rawCards.length; i++) {
        if (rawCards[i].getElementsByTagName("side")[0].textContent == "front") cards.push(rawCards[i]);
    }
    if (searchCriteria == "") LoadCards(cards);
    else {
        terms = searchCriteria.toLowerCase().split(" ");
        var newCards = [];
        for (let i = 0; i < cards.length; i++) {
            var include = true;
            for (let j = 0; j < terms.length; j++) {
                var negate = false;
                var check = terms[j];
                if (terms[j].substring(0,1) == "-") {
                    negate = true;
                    check = terms[j].slice(1);
                }
                if (!check.includes(":") && !check.includes("<") && !check.includes(">") && !check.includes("=") && !cards[i].getElementsByTagName("name")[0].textContent.toLowerCase().includes(check)) include = false;
                if (check.substring(0,4) == "set:") {
                    var temp = false;
                    for (let k = 0; k < cards[i].getElementsByTagName("set").length; k++) {
                        if (cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent.toLowerCase() == check.split(":")[1].toLowerCase()) temp = true;
                    }
                    if (!temp) include = false;
                }
                if (check.substring(0,2) == "c:" || check.substring(0,6) == "color:") {
                    for (let k = 0; k < check.split(":")[1].length; k++) {
                        if (!(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().includes(check.split(":")[1][k]))) include = false;
                    }
                }
                if (check.substring(0,3) == "c=" || check.substring(0,6) == "color=") {
                    if (!(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase() == check.split("=")[1])) include = false;
                }
                if (check.substring(0,2) == "c>" || check.substring(0,6) == "color>") {
                    for (let k = 0; k < check.split(">")[1].length; k++) {
                        if (!(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().includes(check.split(">")[1][k]))) include = false;
                    }
                    if (cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase() == check.split(">")[1]) include = false;
                }
                else if (check.substring(0,3) == "c>=" || check.substring(0,7) == "color>=") {
                    for (let k = 0; k < check.split(">=")[1].length; k++) {
                        if (!(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().includes(check.split(">=")[1][k]))) include = false;
                    }
                }
                if (check.substring(0,2) == "c<" || check.substring(0,6) == "color<") {
                    for (let k = 0; k < cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length; k++) {
                        if (!check.split("<")[1].includes(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase()[k])) include = false;
                    }
                    if (cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase() == check.split("<")[1]) include = false;
                }
                else if (check.substring(0,3) == "c<=" || check.substring(0,7) == "color<=") {
                    for (let k = 0; k < cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length; k++) {
                        if (!check.split("<=")[1].includes(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase()[k])) include = false;
                    }
                }
                if (check.substring(0,3) == "ci:") {
                    for (let k = 0; k < check.split(":")[1].length; k++) {
                        if (!(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().includes(check.split(":")[1][k]))) include = false;
                    }
                }
                if (check.substring(0,3) == "ci=") {
                    if (!(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase() == check.split("=")[1])) include = false;
                }
                if (check.substring(0,3) == "ci>") {
                    for (let k = 0; k < check.split(">")[1].length; k++) {
                        if (!(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().includes(check.split(">")[1][k]))) include = false;
                    }
                    if (cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase() == check.split(">")[1]) include = false;
                }
                else if (check.substring(0,4) == "ci>=") {
                    for (let k = 0; k < check.split(">=")[1].length; k++) {
                        if (!(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().includes(check.split(">=")[1][k]))) include = false;
                    }
                }
                if (check.substring(0,3) == "ci<") {
                    for (let k = 0; k < cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().length; k++) {
                        if (!check.split("<")[1].includes(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase()[k])) include = false;
                    }
                    if (cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase() == check.split("<")[1]) include = false;
                }
                else if (check.substring(0,4) == "ci<=") {
                    for (let k = 0; k < cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().length; k++) {
                        if (!check.split("<=")[1].includes(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase()[k])) include = false;
                    }
                }
                if (check.substring(0,3) == "mv:") {
                    if (!(cards[i].getElementsByTagName("cmc")[0].textContent.toLowerCase() == check.split(":")[1])) include = false;
                }
                if (check.substring(0,3) == "mv=") {
                    if (!(cards[i].getElementsByTagName("cmc")[0].textContent.toLowerCase() == check.split("=")[1])) include = false;
                }
                if (check.substring(0,3) == "mv<") {
                    if (!(Number(cards[i].getElementsByTagName("cmc")[0].textContent) < Number(check.split("<")[1]))) include = false;
                }
                if (check.substring(0,4) == "mv<=") {
                    if (!(Number(cards[i].getElementsByTagName("cmc")[0].textContent) <= Number(check.split("<=")[1]))) include = false;
                }
                if (check.substring(0,3) == "mv>") {
                    if (!(Number(cards[i].getElementsByTagName("cmc")[0].textContent) > Number(check.split(">")[1]))) include = false;
                }
                if (check.substring(0,4) == "mv>=") {
                    if (!(Number(cards[i].getElementsByTagName("cmc")[0].textContent) >= Number(check.split(">=")[1]))) include = false;
                }
                if (check.substring(0,2) == "t:" || check.substring(0,5) == "type:") {
                    if (!cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes(check.split(":")[1])) include = false;
                }
                if (check.substring(0,2) == "o:" || check.substring(0,5) == "oracle:") {
                    if (!cards[i].getElementsByTagName("text")[0].textContent.toLowerCase().includes(check.split(":")[1])) include = false;
                }
                if (check.substring(0,2) == "p:" || check.substring(0,4) == "pow:") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] == check.split(":")[1])) include = false;
                }
                if (check.substring(0,2) == "p=" || check.substring(0,4) == "pow=") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] == check.split("=")[1])) include = false;
                }
                if (check.substring(0,2) == "p<" || check.substring(0,4) == "pow<") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] < check.split("<")[1])) include = false;
                }
                if (check.substring(0,3) == "p<=" || check.substring(0,5) == "pow<=") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] <= check.split("<=")[1])) include = false;
                }
                if (check.substring(0,2) == "p>" || check.substring(0,4) == "pow>") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] > check.split(">")[1])) include = false;
                }
                if (check.substring(0,3) == "p>=" || check.substring(0,5) == "pow>=") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] >= check.split(">=")[1])) include = false;
                }
                if (check.substring(0,4) == "tou:") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] == check.split(":")[1])) include = false;
                }
                if (check.substring(0,4) == "tou=") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] == check.split("=")[1])) include = false;
                }
                if (check.substring(0,4) == "tou<") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] < check.split("<")[1])) include = false;
                }
                if (check.substring(0,5) == "tou<=") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] <= check.split("<=")[1])) include = false;
                }
                if (check.substring(0,4) == "tou>") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] > check.split(">")[1])) include = false;
                }
                if (check.substring(0,5) == "tou>=") {
                    if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] >= check.split(">=")[1])) include = false;
                }
                if (check == "is:dfc") {
                    if (cards[i].getElementsByTagName("layout")[0].textContent.toLowerCase() != "transform") include = false;
                }
                if (check == "is:split") {
                    if (cards[i].getElementsByTagName("layout")[0].textContent.toLowerCase() != "split") include = false;
                }
                if (check == "is:permanent") {
                    if (cards[i].getElementsByTagName("type")[0].textContent.toLowerCase() == "instant" ||
                        cards[i].getElementsByTagName("type")[0].textContent.toLowerCase() == "sorcery" ||
                        cards[i].getElementsByTagName("type")[0].textContent.toLowerCase() == "condition") include = false;
                }
                if (check == "is:historic") {
                    if (!cards[i].getElementsByTagName("type")[0].textContent.toLowerCase() == "artifact" &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase() == "legendary" &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase() == "saga") include = false;
                }
                if (check == "is:vanilla") {
                    if (!cards[i].getElementsByTagName("text")[0].textContent == "") include = false;
                }
                var cardRarityNo;
                if (cards[i].getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent.toLowerCase() == "common") cardRarityNo = 0;
                if (cards[i].getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent.toLowerCase() == "uncommon") cardRarityNo = 1;
                if (cards[i].getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent.toLowerCase() == "rare") cardRarityNo = 2;
                if (cards[i].getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent.toLowerCase() == "mythic") cardRarityNo = 3;
                if (check.substring(0,2) == "r:" || check.substring(0,2) == "r=" || check.substring(0,7) == "rarity:" || check.substring(0,7) == "rarity=") {
                    var rarity = check.split(/[:|=]+/)[1];
                    var rarityNo;
                    if (rarity.toLowerCase() == "common" || rarity.toLowerCase() == "c") rarityNo = 0;
                    if (rarity.toLowerCase() == "uncommon" || rarity.toLowerCase() == "u") rarityNo = 1;
                    if (rarity.toLowerCase() == "rare" || rarity.toLowerCase() == "r") rarityNo = 2;
                    if (rarity.toLowerCase() == "mythic" || rarity.toLowerCase() == "m") rarityNo = 3;
                    if (cardRarityNo != rarityNo) include = false;
                }
                if (check.substring(0,2) == "r<" || check.substring(0,7) == "rarity<") {
                    var rarity = check.split("<")[1];
                    var rarityNo;
                    if (rarity.toLowerCase() == "common" || rarity.toLowerCase() == "c") rarityNo = 0;
                    if (rarity.toLowerCase() == "uncommon" || rarity.toLowerCase() == "u") rarityNo = 1;
                    if (rarity.toLowerCase() == "rare" || rarity.toLowerCase() == "r") rarityNo = 2;
                    if (rarity.toLowerCase() == "mythic" || rarity.toLowerCase() == "m") rarityNo = 3;
                    if (cardRarityNo >= rarityNo) include = false;
                }
                else if (check.substring(0,3) == "r<=" || check.substring(0,8) == "rarity<=") {
                    var rarity = check.split("<=")[1];
                    var rarityNo;
                    if (rarity.toLowerCase() == "common" || rarity.toLowerCase() == "c") rarityNo = 0;
                    if (rarity.toLowerCase() == "uncommon" || rarity.toLowerCase() == "u") rarityNo = 1;
                    if (rarity.toLowerCase() == "rare" || rarity.toLowerCase() == "r") rarityNo = 2;
                    if (rarity.toLowerCase() == "mythic" || rarity.toLowerCase() == "m") rarityNo = 3;
                    if (cardRarityNo > rarityNo) include = false;
                }
                if (check.substring(0,2) == "r>" || check.substring(0,7) == "rarity>") {
                    var rarity = check.split(">")[1];
                    var rarityNo;
                    if (rarity.toLowerCase() == "common" || rarity.toLowerCase() == "c") rarityNo = 0;
                    if (rarity.toLowerCase() == "uncommon" || rarity.toLowerCase() == "u") rarityNo = 1;
                    if (rarity.toLowerCase() == "rare" || rarity.toLowerCase() == "r") rarityNo = 2;
                    if (rarity.toLowerCase() == "mythic" || rarity.toLowerCase() == "m") rarityNo = 3;
                    if (cardRarityNo <= rarityNo) include = false;
                }
                else if (check.substring(0,3) == "r>=" || check.substring(0,8) == "rarity>=") {
                    var rarity = check.split(">=")[1];
                    var rarityNo;
                    if (rarity.toLowerCase() == "common" || rarity.toLowerCase() == "c") rarityNo = 0;
                    if (rarity.toLowerCase() == "uncommon" || rarity.toLowerCase() == "u") rarityNo = 1;
                    if (rarity.toLowerCase() == "rare" || rarity.toLowerCase() == "r") rarityNo = 2;
                    if (rarity.toLowerCase() == "mythic" || rarity.toLowerCase() == "m") rarityNo = 3;
                    if (cardRarityNo < rarityNo) include = false;
                }
                if (negate) {
                    if (include) include = false;
                    else include = true;
                }
            }
                
            if (include) newCards.push(cards[i]);
        }
        LoadCards(newCards);
    }
}

function GetCardBack(card) {
    cardURL = "assets/card-parts/card";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Legendary")) cardURL = cardURL + "-legend";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Basic")) cardURL = cardURL + "-basic";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Land")) cardURL = cardURL + "-land";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Artifact")) cardURL = cardURL + "-artifact";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Saga")) cardURL = cardURL + "-saga";

    if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Basic")) {
        if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "W") cardURL = cardURL + "-plains.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "U") cardURL = cardURL + "-island.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "B") cardURL = cardURL + "-swamp.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "R") cardURL = cardURL + "-mountain.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "G") cardURL = cardURL + "-forest.svg";
    }
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Land")) {
        if (card.getElementsByTagName("text")[0].textContent.includes("any")
            && card.getElementsByTagName("text")[0].textContent.includes("color")) cardURL = cardURL + "-gold.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "W") cardURL = cardURL + "-white.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "U") cardURL = cardURL + "-blue.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "B") cardURL = cardURL + "-black.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "R") cardURL = cardURL + "-red.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "G") cardURL = cardURL + "-green.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "") cardURL = cardURL + "-colorless.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "WU") cardURL = cardURL + "-azorius.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "UB") cardURL = cardURL + "-dimir.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "BR") cardURL = cardURL + "-rakdos.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "RG") cardURL = cardURL + "-gruul.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "WG") cardURL = cardURL + "-selesnya.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "WB") cardURL = cardURL + "-orzhov.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "UR") cardURL = cardURL + "-izzet.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "BG") cardURL = cardURL + "-golgari.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "WR") cardURL = cardURL + "-boros.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "UG") cardURL = cardURL + "-simic.svg";
        else cardURL = cardURL + "-gold.svg";
        return cardURL;
    }
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Planeswalker")) {
        if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "W") cardURL = cardURL + "-planeswalker-white.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "U") cardURL = cardURL + "-planeswalker-blue.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "BR") cardURL = cardURL + "-planeswalker-rakdos.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "UG") cardURL = cardURL + "-planeswalker-simic.svg";
    }

    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "W") cardURL = cardURL + "-white.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "U") cardURL = cardURL + "-blue.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "B") cardURL = cardURL + "-black.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "R") cardURL = cardURL + "-red.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "G") cardURL = cardURL + "-green.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "") cardURL = cardURL + "-colorless.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "WU") cardURL = cardURL + "-azorius.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "UB") cardURL = cardURL + "-dimir.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "BR") cardURL = cardURL + "-rakdos.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "RG") cardURL = cardURL + "-gruul.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "WG") cardURL = cardURL + "-selesnya.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "WB") cardURL = cardURL + "-orzhov.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "UR") cardURL = cardURL + "-izzet.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "BG") cardURL = cardURL + "-golgari.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "WR") cardURL = cardURL + "-boros.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "UG") cardURL = cardURL + "-simic.svg";
    else cardURL = cardURL + "-gold.svg";
    return cardURL;
}

function GetCardPT(card) {
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Artifact")) cardURL = "assets/card-parts/pt-colorless.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "W") cardURL = "assets/card-parts/pt-white.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "U") cardURL = "assets/card-parts/pt-blue.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "B") cardURL = "assets/card-parts/pt-black.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "R") cardURL = "assets/card-parts/pt-red.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "G") cardURL = "assets/card-parts/pt-green.svg";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "") cardURL = "assets/card-parts/pt-colorless.svg";
    else  cardURL = "assets/card-parts/pt-gold.svg";
    return cardURL;
}

function GetSetSymbol(set, rarity) {
    return "assets/card-parts/" + set.toLowerCase() + "-" + rarity.substring(0,1).toLowerCase() + ".svg";
}