
canvas = [];

var parser = new DOMParser();
var xmlDoc;
var page = 0;
var maxPage = 0;

async function OnLoad() {
    
    var xml = await fetch("assets/cards.xml");
    var text = await xml.text();
    xmlDoc = parser.parseFromString(text, "text/xml");
    urlParams = new URLSearchParams(window.location.search)
    document.getElementById("search").value = urlParams.get('search');
    Search();

    var input = document.getElementById("search")?.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            ResetSearch();
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
    let size = 1;
    if (cards.length == 1) size = 1.5;
    if (cards.length > 0) {
        for (let i = page * 60; i < cards.length && i < (page + 1) * 60; i++) {
            if (i % Math.max(1, Math.floor(innerWidth / 300)) == 0) {
                row = cardTable.insertRow();
            }
            var newCell = row.insertCell(-1);
            canvas[i] = document.createElement('canvas');
            canvas[i].classList.add("card");
            newCell.appendChild(canvas[i]);
            canvas[i].style.width = 252 * size + 'px';
            canvas[i].style.height = 352 * size + 'px';
            canvas[i].width = 504 * size;
            canvas[i].height = 704 * size;
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
                        DrawCard(canvas[i], newCard, size);
                        transformed = true;
                    }
                    else {
                        DrawCard(canvas[i], cards[i], size);
                        transformed = false;
                    }
                    
                });
            }
            canvas[i].addEventListener("click", function() {
                window.location.href = "carddex.html?search=" + cards[i].getElementsByTagName("name")[0].textContent;
            });
        }

        for (let i = page * 60; i < cards.length && i < (page + 1) * 60; i++) {
            DrawCard(canvas[i], cards[i], size);
        }
    }
    if (cards.length == 1) {
        var newCell = row.insertCell(-1);
        let setTable = document.createElement('table');
        setTable.classList.add("alt-table");
        setTable.style.width = 400;
        newCell.appendChild(setTable);
        let setRow = setTable.insertRow(-1);
        let setCell1 = setRow.insertCell(-1);
        setCell1.style.width = 300;
        setCell1.innerHTML = "<b>Sets</b>";
        for (let i = 0; i < cards[0].getElementsByTagName("set").length; i++) {
            let setRow2 = setTable.insertRow(-1);
            let setCell2 = setRow2.insertCell(-1);
            setCell2.innerHTML = "<img align='center' src='" + GetSetSymbol(cards[0].getElementsByTagName("set")[i].getElementsByTagName("code")[0].textContent, "Common") + "' height='20px'/> " + GetSetName(cards[0].getElementsByTagName("set")[i].getElementsByTagName("code")[0].textContent);
            setCell2.style.cursor = "pointer";
            setCell2.addEventListener("click", function() {
                window.location.href = "carddex.html?search=set:" + cards[0].getElementsByTagName("set")[i].getElementsByTagName("code")[0].textContent;
            })
        }

        if (cards[0].getElementsByTagName("related").length > 0) {
            let tokenTable = document.createElement('table');
            tokenTable.classList.add("alt-table");
            tokenTable.style.width = 400;
            tokenTable.style.marginTop = 100;
            newCell.appendChild(tokenTable);
            let tokenRow = tokenTable.insertRow(-1);
            let tokenCell = tokenRow.insertCell(-1);
            tokenCell.style.width = 300;
            tokenCell.innerHTML = "<b>Tokens</b>";
            for (let i = 0; i < cards[0].getElementsByTagName("related").length; i++) {
                let tableRow2 = tokenTable.insertRow(-1);
                let tableCell2 = tableRow2.insertCell(-1);
                if (cards[0].getElementsByTagName("related")[i].getElementsByTagName("name").length == 0) {
                    tableCell2.innerHTML = cards[0].getElementsByTagName("related")[i].textContent;
                }
                else {
                    tableCell2.innerHTML = cards[0].getElementsByTagName("related")[i].getElementsByTagName("name")[0].textContent;
                }
                tableCell2.style.cursor = "pointer";
                tableCell2.addEventListener("click", function() {
                    let set = cards[0].getElementsByTagName("set")[0].getElementsByTagName("code")[0].textContent;
                    if (cards[0].getElementsByTagName("related")[i].getElementsByTagName("name").length == 0) {
                        window.location.href = "carddex.html?search=set:" + set + "%20" + cards[0].getElementsByTagName("related")[i].textContent;
                    }
                    else {
                        window.location.href = "carddex.html?search=set:" + set + "%20" + cards[0].getElementsByTagName("related")[i].getElementsByTagName("name")[0].textContent + "%20p:" + cards[0].getElementsByTagName("related")[i].getElementsByTagName("id")[0].textContent;
                    }
            })
            }
        }
    }
    var cardCountText = document.getElementById("card-count");
    cardCountText.textContent = "Showing " + ((page * 60) + 1) + "-" + Math.min((page + 1) * 60, cards.length) + " of " + cards.length + " cards.";
}

function DrawCard(canvas, card, size) {
    let imgPT = new Image();
    imgPT.src = GetCardPT(card);
    let imgPotency = new Image();
    imgPotency.src = "assets/card-parts/potency-symbol-large.svg";
    let imgDefense = new Image();
    imgDefense.src = "assets/card-parts/defense-symbol-large.svg";
    let imgRarity = new Image();
    imgRarity.src = GetSetSymbol(card.getElementsByTagName("set")[0].getElementsByTagName("code")[0].textContent, card.getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent);
    manaBack = new Image();
    var manaSymbol = [];
    manaBack.src = "assets/card-parts/mana-symbol-back.svg";
    let manacost = card.getElementsByTagName("prop")[0].getElementsByTagName("manacost")[0].textContent.split(" // ")[0];
    manalength = 0;
    let j = 0;
    let pos = 0;
    while (pos < manacost.length) {
        manaSymbol[j] = new Image();
        if (manacost.at(pos) == "{") {
            let length = 0;
            if (manacost.at(pos + 2) == "}") length = 2;
            if (manacost.at(pos + 3) == "}") length = 3;
            if (manacost.at(pos + 4) == "}") length = 4;
            manaSymbol[j].src = findManaSymbol(manacost.substring(pos + 1, pos + length)); pos += length + 1;
        }
        else {manaSymbol[j].src = findManaSymbol(manacost.at(pos)); pos++;}
        j++;
    }
    manalength = j;
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("layout")[0].textContent == "split") {
        var manacost2 = card.getElementsByTagName("prop")[0].getElementsByTagName("manacost")[0].textContent.split(" // ")[1];
        var manaSymbol2 = [];
        let j = 0;
        let pos = 0;
        while (pos < manacost2.length) {
            manaSymbol2[j] = new Image();
            if (manacost2.at(pos) == "{") {
                let length = 0;
                if (manacost.at(pos + 2) == "}") length = 2;
                if (manacost.at(pos + 3) == "}") length = 3;
                if (manacost.at(pos + 4) == "}") length = 4;
                manaSymbol2[j].src = findManaSymbol(manacost2.substring(pos + 1, pos + length)); pos += length + 1;
            }
            else {manaSymbol2[j].src = findManaSymbol(manacost2.at(pos)); pos++;}
            j++;
        }
    }
    let imgBack = new Image();
    imgBack.src = GetCardBack(card);

    
    
    let name = card.getElementsByTagName("name")[0].textContent;
    let type = card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent;
    let textbox = card.getElementsByTagName("text")[0].textContent;
    let pt = "";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("pt").length > 0) {
        pt = card.getElementsByTagName("prop")[0].getElementsByTagName("pt")[0].textContent;
    }
    let setno = "TMW-"+ card.getElementsByTagName("set")[0].getElementsByTagName("code")[0].textContent + " " + card.getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent.at(0);
    let manavalue = card.getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent;
    let potency = "";
    let defense = "";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("potency").length > 0) potency = card.getElementsByTagName("prop")[0].getElementsByTagName("potency")[0].textContent;
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("defense").length > 0) defense = card.getElementsByTagName("prop")[0].getElementsByTagName("defense")[0].textContent;
    let pw = 0;

    let img_dict = {
        0: imgBack.src,
        1: imgRarity.src,
        2: "assets/card-parts/loyalty-0.svg",
        3: "assets/card-parts/loyalty-up.svg",
        4: "assets/card-parts/loyalty-down.svg",
        5: "assets/card-parts/saga-chapter-1.svg",
        6: "assets/card-parts/saga-chapter-2.svg",
        7: "assets/card-parts/saga-chapter-3.svg",
        8: "assets/card-parts/saga-chapter-4.svg",
        9: "assets/card-parts/saga-chapter-5.svg",
        10: "assets/card-parts/saga-chapter-6.svg",
        11: "assets/card-parts/saga-chapter-7.svg",
        12: "assets/card-parts/chapter-separator.svg"
    }
    for (let n = 0; n < Object.entries(img_dict).length; n++) {
        Object.entries(img_dict)[n][1].onload = function() {n++;}
    }

    imgBack.onload = function() {
        context = canvas.getContext('2d');
        if (type.includes("Planeswalker")) pw = 10
        context.drawImage(imgBack, 0, 0, 504 * size, 704 * size);
        if (card.getElementsByTagName("prop")[0].getElementsByTagName("watermark").length > 0) {
            let watermark = new Image();
            if (card.getElementsByTagName("watermark")[0].textContent == "The Lost") watermark.src = "assets/card-parts/watermark-the-lost.svg";
            if (card.getElementsByTagName("watermark")[0].textContent == "Chi Yu") watermark.src = "assets/card-parts/watermark-chi-yu.svg";
            if (card.getElementsByTagName("watermark")[0].textContent == "Sanada") watermark.src = "assets/card-parts/watermark-sanada.svg";
            if (card.getElementsByTagName("watermark")[0].textContent == "Icejade Cradle") watermark.src = "assets/card-parts/watermark-icejade-cradle.svg";
            if (card.getElementsByTagName("watermark")[0].textContent == "Land of Iron") watermark.src = "assets/card-parts/watermark-land-of-iron.svg";
            if (card.getElementsByTagName("watermark")[0].textContent == "Dragma") watermark.src = "assets/card-parts/watermark-dragma.svg";
            if (card.getElementsByTagName("watermark")[0].textContent == "Despia") watermark.src = "assets/card-parts/watermark-despia.svg";
            context.drawImage(watermark, 156 * size, 448 * size, 192 * size, 192 * size);
        }
        if (card.getElementsByTagName("prop")[0].getElementsByTagName("layout")[0].textContent == "split") {
            for (let sp = 0; sp < 2; sp++) {
                if (sp == 0) {
                    for (let j = 0; j < manaSymbol.length; j++) {
                        context.drawImage(manaBack, (439.5 - 26 * (manaSymbol.length - j - 1)) * size, (42 + 312 * sp) * size, 24 * size, 24 * size);
                        context.drawImage(manaSymbol[j], (440 - 26 * (manaSymbol.length - j - 1)) * size, (40 + 312 * sp) * size, 24 * size, 24 * size);
                    }
                }
                else {
                    for (let j = 0; j < manaSymbol2.length; j++) {
                        context.drawImage(manaBack, (439.5 - 26 * (manaSymbol2.length - j - 1)) * size, (42 + 312 * sp) * size, 24 * size, 24 * size);
                        context.drawImage(manaSymbol2[j], (440 - 26 * (manaSymbol2.length - j - 1)) * size, (40 + 312 * sp) * size, 24 * size, 24 * size);
                    }
                }
                context.font=20 * size + "pt Beleren";
                context.fillStyle = "#000000";
                context.fillText(card.getElementsByTagName("name")[0].textContent.split(" // ")[sp], 48 * size, (64 + 312 * sp) * size, (396 - 20 * manacost.length) * size);
                context.font=18 * size + "pt Beleren";
                context.fillText(type, 48 * size, (312 + 312 * sp) * size, 384 * size);
                context.font=16 * size + "pt MPlantin";
                wrapText(context, card.getElementsByTagName("text")[sp].textContent, 48 * size, (104 + 312 * sp) * size, 192 * size, 20 * size, size, "split");
                context.drawImage(imgRarity, 432 * size, (288 + 312 * sp) * size, 32 * size, 32 * size);
            }
        }
        else {
            if (type.includes("Creature") || type.includes("Vehicle")) context.drawImage(imgPT, 390 * size, 626 * size, 88 * size, 42 * size);
            if (type.includes("Mystical")) {
                context.drawImage(imgPotency, 440 * size, 588 * size, 44 * size, 76 * size);
                context.font = 20 * size + "pt Beleren";
                context.fillStyle = "#FFF";
                context.textAlign = "center";
                context.fillText(potency, 462 * size, 652 * size);
            }
            if (type.includes("Battle")) {
                context.drawImage(imgDefense, 436 * size, 616 * size, 52 * size, 52 * size);
                context.font = 20 * size + "pt Beleren";
                context.fillStyle = "#FFF";
                context.textAlign = "center";
                context.fillText(defense, 462 * size, 652 * size);
            }
            for (let j = 0; j < manaSymbol.length; j++) {
                context.drawImage(manaBack, (439.5 - 26 * (manaSymbol.length - j - 1)) * size, (42 - pw) * size, 24 * size, 24 * size);
                context.drawImage(manaSymbol[j], (440 - 26 * (manaSymbol.length - j - 1)) * size, (40 - pw) * size, 24 * size, 24 * size);
            }
            context.font=20 * size + "pt Beleren";
            context.fillStyle = "#000000";
            context.textAlign = "left";
            context.fillText(name, 48 * size, (64 - pw) * size, (396 - 20 * manalength) * size);
            if (!type.includes("Saga") && !type.includes("Planeswalker") && !type.includes("Class")) {
                context.font=18 * size + "pt Beleren";
                context.fillText(type, 48 * size, 424 * size, 384 * size);
                context.font=16 * size + "pt MPlantin";
                wrapText(context, textbox, 48 * size, 544 * size, 408 * size, 20 * size, size);
                context.drawImage(imgRarity, 432 * size, 400 * size, 32 * size, 32 * size);
            }
            if (type.includes("Class")) {
                context.font="Italic " + 14 * size + "pt MPlantin";
                context.fillStyle = "#000000";
                context.textAlign = "left";
                wrapText(context, card.getElementsByTagName("text")[0].textContent, 258 * size, 104 * size, 206 * size, 20 * size, size, "Saga");
                context.font=14 * size + "pt MPlantin";
                wrapText(context, card.getElementsByTagName("text")[1].textContent, 258 * size, 160 * size, 206 * size, 20 * size, size, "Saga");
                wrapText(context, card.getElementsByTagName("text")[3].textContent, 258 * size, 328 * size, 206 * size, 20 * size, size, "Saga");
                wrapText(context, card.getElementsByTagName("text")[5].textContent, 258 * size, 488 * size, 206 * size, 20 * size, size, "Saga");
                wrapText(context, card.getElementsByTagName("text")[2].textContent, 258 * size, 296 * size, 206 * size, 20 * size, size, "Saga");
                wrapText(context, card.getElementsByTagName("text")[4].textContent, 258 * size, 456 * size, 206 * size, 20 * size, size, "Saga");
            }
            if (type.includes("Saga")) {
                chapter_dict = {
                    "1": "assets/card-parts/saga-chapter-1.svg",
                    "2": "assets/card-parts/saga-chapter-2.svg",
                    "3": "assets/card-parts/saga-chapter-3.svg",
                    "4": "assets/card-parts/saga-chapter-4.svg",
                    "5": "assets/card-parts/saga-chapter-5.svg",
                    "6": "assets/card-parts/saga-chapter-6.svg",
                    "7": "assets/card-parts/saga-chapter-7.svg"
                }
                context.font=18 * size + "pt Beleren";
                context.fillText(type, 48 * size, 624 * size, 384 * size);
                context.drawImage(imgRarity, 432 * size, 600 * size, 32 * size, 32 * size);
                context.font=16 * size + "pt MPlantin";
                let uniqueChapters = card.getElementsByTagName("text").length;
                let chapters = card.getElementsByTagName("text")[uniqueChapters - 1].textContent.split(": ")[0].split(",")[card.getElementsByTagName("text")[uniqueChapters - 1].textContent.split(": ")[0].split(",").length - 1];
                wrapText(context, card.getElementsByTagName("text")[0].textContent, 42 * size, 102 * size, 206 * size, 20 * size, size, "Saga");
                let chapterSeparator = new Image();
                chapterSeparator.src = "assets/card-parts/chapter-separator.svg";
                for (let s = 0; s < uniqueChapters - 1; s++) {
                    let chapterText = card.getElementsByTagName("text")[s + 1].textContent.split(": ")[1];
                    wrapText(context, chapterText, 64 * size, (228 + (s * 428 / uniqueChapters)) * size, 184 * size, 20 * size, size, "Saga");
                    context.drawImage(chapterSeparator, 56 * size, (208 + ((s+1) * 428 / uniqueChapters)) * size, 192 * size, 4 * size);
                    let currentChapters = card.getElementsByTagName("text")[s + 1].textContent.split(": ")[0].split(",");
                    for (let t = 0; t < currentChapters.length; t++) {
                        let chapterBanner = new Image();
                        chapterBanner.src = chapter_dict[currentChapters[t]];
                        context.drawImage(chapterBanner, 18 * size, (260 + (s * 428 / uniqueChapters) + (t * 46) - currentChapters.length * 23) * size, 40 * size, 46 * size);
                    }
                }
            }
            context.font="Bold " + 22 * size + "pt MPlantin"
            context.textAlign = "center";
            context.fillText(pt, 434 * size, 656 * size);
            if (type.includes("Planeswalker")) {
                let layout = 0;
                if (card.getElementsByTagName("prop")[0].getElementsByTagName("layout")[0].textContent == "tall") layout = -48;
                context.textAlign = "left";
                context.font=18 * size + "pt Beleren";
                context.fillText(type, 48 * size, (424 + layout) * size, 384 * size);
                context.drawImage(imgRarity, 432 * size, (400 + layout) * size, 32 * size, 32 * size);
                for (let s = 0; s < card.getElementsByTagName("text").length; s++) {
                    let text = card.getElementsByTagName("text")[s].textContent;
                    if (card.getElementsByTagName("text")[s].textContent.indexOf(": ") > -1 && card.getElementsByTagName("text")[s].textContent.indexOf(": ") < 5) {
                        text = card.getElementsByTagName("text")[s].textContent.split(": ")[1];
                    }
                    if (Number(card.getElementsByTagName("text")[s].textContent.split(": ")[0]) > 0) {
                        let img = new Image();
                        img.src = "assets/card-parts/loyalty-up.svg";
                        context.drawImage(img, 22 * size, (448 + 64 * s + layout) * size, 64 * size, 40 * size);
                        context.font="Bold " + 17 * size + "pt Beleren";
                        context.fillStyle = "#FFFFFF";
                        context.textAlign = "center";
                        context.fillText(card.getElementsByTagName("text")[s].textContent.split(": ")[0], 52 * size, (477 + 64 * s + layout) * size);
                    }
                    if (Number(card.getElementsByTagName("text")[s].textContent.split(": ")[0]) < 0) {
                        let img = new Image();
                        img.src = "assets/card-parts/loyalty-down.svg";
                        context.drawImage(img, 22 * size, (456 + 64 * s + layout) * size, 64 * size, 40 * size);
                        context.font="Bold " + 17 * size + "pt Beleren";
                        context.fillStyle = "#FFFFFF";
                        context.textAlign = "center";
                        context.fillText(card.getElementsByTagName("text")[s].textContent.split(": ")[0], 52 * size, (480 + 64 * s + layout) * size);
                    }
                    if (Number(card.getElementsByTagName("text")[s].textContent.split(": ")[0]) == 0) {
                        let img = new Image();
                        img.src = "assets/card-parts/loyalty-0.svg";
                        context.drawImage(img, 22 * size, (456 + 64 * s + layout) * size, 64 * size, 40 * size);
                    }
                    context.textAlign = "left";
                    context.font=14 * size + "pt MPlantin";
                    context.fillStyle = "#000000";
                    wrapText(context, text, 92 * size, (472 + s * 64 + layout - 12) * size, (460-92) * size, 16 * size, size, "Planeswalker");
                }
                context.font="Bold " + 22 * size + "pt Beleren";
                context.textAlign = "center";
                context.fillStyle = "#FFFFFF";
                context.fillText(card.getElementsByTagName("prop")[0].getElementsByTagName("loyalty")[0].textContent, 442 * size, 654 * size);
            }
        }
        context.font=12 * size + "pt Beleren Small Caps";
        context.textAlign = "left";
        context.fillStyle = "#FFFFFF";
        context.fillText(setno, 32 * size, 672 * size);
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
    else return cards;
}

function wrapText(context, text, x, y, maxWidth, lineHeight, size, type = "") {
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
        "{A}": "assets/card-parts/gold-mana-symbol.svg",
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
        "{10}": "assets/card-parts/generic-mana-symbol-10.svg",
        "{11}": "assets/card-parts/generic-mana-symbol-11.svg",
        "{12}": "assets/card-parts/generic-mana-symbol-12.svg",
        "{13}": "assets/card-parts/generic-mana-symbol-13.svg",
        "{14}": "assets/card-parts/generic-mana-symbol-14.svg",
        "{15}": "assets/card-parts/generic-mana-symbol-15.svg",
        "{16}": "assets/card-parts/generic-mana-symbol-16.svg",
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
        "{G/U}": "assets/card-parts/simic-mana-symbol.svg",
        "{A/P}": "assets/card-parts/prism-mana-symbol.svg",
        "{2/W}": "assets/card-parts/twobrid-white-mana-symbol.svg",
        "{2/U}": "assets/card-parts/twobrid-blue-mana-symbol.svg",
        "{2/B}": "assets/card-parts/twobrid-black-mana-symbol.svg",
        "{2/R}": "assets/card-parts/twobrid-red-mana-symbol.svg",
        "{2/G}": "assets/card-parts/twobrid-green-mana-symbol.svg",
        "{2/C}": "assets/card-parts/twobrid-colorless-mana-symbol.svg",
        "{3/A}": "assets/card-parts/threebrid-gold-mana-symbol.svg",
        "{1/P}": "assets/card-parts/phyrexian-mana-symbol.svg",
        "{L}": "assets/card-parts/land-mana-symbol.svg",
        "{S}": "assets/card-parts/snow-mana-symbol.svg",
        "{F}": "assets/card-parts/fiery-mana-symbol.svg",
        "{P}": "assets/card-parts/potency-symbol.svg",
        "{P/1}": "assets/card-parts/potency-symbol-1.svg",
        "{P/2}": "assets/card-parts/potency-symbol-2.svg",
        "{P/3}": "assets/card-parts/potency-symbol-3.svg",
        "{P/4}": "assets/card-parts/potency-symbol-4.svg",
        "{S/+1}": "assets/card-parts/spark-up-1.svg",
        "{S/+2}": "assets/card-parts/spark-up-2.svg",
        "{S/-1}": "assets/card-parts/spark-down-1.svg",
        "{S/-2}": "assets/card-parts/spark-down-2.svg",
        "{S/-3}": "assets/card-parts/spark-down-3.svg",
        "{S/-4}": "assets/card-parts/spark-down-4.svg",
        "{S/-5}": "assets/card-parts/spark-down-5.svg",
        "{S/-6}": "assets/card-parts/spark-down-6.svg",
        "{S/-7}": "assets/card-parts/spark-down-7.svg",
        "{S/-8}": "assets/card-parts/spark-down-8.svg",
        "{S/-9}": "assets/card-parts/spark-down-9.svg",
        "{S/-10}": "assets/card-parts/spark-down-10.svg"
    };

    for (let n = 0; n < Object.entries(mana_dict).length; n++) {
        Object.entries(mana_dict)[n][1].onload = function() {n++;}
    }
    writeText();

    function writeText() {
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
        if (type != "Saga" && type != "split"  && type != "Planeswalker") y = Math.max(y - ((lines - 1) / 2) * lineHeight, 232 * 2 * size);
        if (type == "Planeswalker") {
            if (lines>=4) {
                context.font = 12 * size + "pt MPlantin";
                lineHeight = 14 * size;
                y -= 4;
            }
            if (lines>=5) {
                context.font = 10 * size + "pt MPlantin";
                lineHeight = 12 * size;
                y -= 4;
            }
            if (lines>=6) {
                context.font = 8 * size + "pt MPlantin";
                lineHeight = 10 * size;
                y -= 4;
            }
        }
        
        if (type == "Saga" && lines>=6) {
            context.font = 14 * size + "pt MPlantin";
            lineHeight = 16 * size;
            y -= 6;
        }
        if (type == "Saga" && lines>=8) {
            context.font = 12 * size + "pt MPlantin";
            lineHeight = 14 * size;
            y -= 6;
        }
        if (type != "Saga" && lines >= 10) {
            context.font = 14 * size + "pt MPlantin";
            lineHeight = 18 * size;
        }
        if (type != "Saga" && lines >= 14) {
            context.font = 12 * size + "pt MPlantin";
            lineHeight = 14 * size;
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
                let height = 1;
                let width = 1;
                let woffset = 0;
                let hoffset = 0;
                if (words[n].substring(0,2) == "{P") {height *= 1.5; hoffset = -6;}
                if (words[n].substring(0,3) == "{S/") {width *= 3; height *= 1.8; woffset = -5; hoffset = -6;}
                context.drawImage(img, x + context.measureText(line).width + 1 + woffset * size, y - lineHeight + 4 + hoffset * size, width * (lineHeight - 2), height * (lineHeight - 2));
                if (words[n].substring(0,3) == "{S/") line = line + '    ';
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
}

function findManaSymbol(s) {
    if (s == "W") return "assets/card-parts/white-mana-symbol.svg";
    else if (s == "U") return "assets/card-parts/blue-mana-symbol.svg";
    else if (s == "B") return "assets/card-parts/black-mana-symbol.svg";
    else if (s == "R") return "assets/card-parts/red-mana-symbol.svg";
    else if (s == "G") return "assets/card-parts/green-mana-symbol.svg";
    else if (s == "A") return "assets/card-parts/gold-mana-symbol.svg";
    else if (s == "1") return "assets/card-parts/generic-mana-symbol-1.svg";
    else if (s == "2") return "assets/card-parts/generic-mana-symbol-2.svg";
    else if (s == "3") return "assets/card-parts/generic-mana-symbol-3.svg";
    else if (s == "4") return "assets/card-parts/generic-mana-symbol-4.svg";
    else if (s == "5") return "assets/card-parts/generic-mana-symbol-5.svg";
    else if (s == "6") return "assets/card-parts/generic-mana-symbol-6.svg";
    else if (s == "7") return "assets/card-parts/generic-mana-symbol-7.svg";
    else if (s == "8") return "assets/card-parts/generic-mana-symbol-8.svg";
    else if (s == "9") return "assets/card-parts/generic-mana-symbol-9.svg";
    else if (s == "10") return "assets/card-parts/generic-mana-symbol-10.svg";
    else if (s == "11") return "assets/card-parts/generic-mana-symbol-11.svg";
    else if (s == "12") return "assets/card-parts/generic-mana-symbol-12.svg";
    else if (s == "13") return "assets/card-parts/generic-mana-symbol-13.svg";
    else if (s == "14") return "assets/card-parts/generic-mana-symbol-14.svg";
    else if (s == "15") return "assets/card-parts/generic-mana-symbol-15.svg";
    else if (s == "16") return "assets/card-parts/generic-mana-symbol-16.svg";
    else if (s == "X") return "assets/card-parts/generic-mana-symbol-x.svg";
    else if (s == "C") return "assets/card-parts/colorless-mana-symbol.svg";
    else if (s == "W/U") return "assets/card-parts/azorius-mana-symbol.svg";
    else if (s == "U/B") return "assets/card-parts/dimir-mana-symbol.svg";
    else if (s == "B/R") return "assets/card-parts/rakdos-mana-symbol.svg";
    else if (s == "R/G") return "assets/card-parts/gruul-mana-symbol.svg";
    else if (s == "G/W") return "assets/card-parts/selesnya-mana-symbol.svg";
    else if (s == "W/B") return "assets/card-parts/orzhov-mana-symbol.svg";
    else if (s == "U/R") return "assets/card-parts/izzet-mana-symbol.svg";
    else if (s == "B/G") return "assets/card-parts/golgari-mana-symbol.svg";
    else if (s == "R/W") return "assets/card-parts/boros-mana-symbol.svg";
    else if (s == "G/U") return "assets/card-parts/simic-mana-symbol.svg";
    else if (s == "A/P") return "assets/card-parts/prism-mana-symbol.svg";
    else if (s == "2/C") return "assets/card-parts/twobrid-colorless-mana-symbol.svg";
    else if (s == "3/A") return "assets/card-parts/threebrid-gold-mana-symbol.svg";
    else if (s == "1/P") return "assets/card-parts/phyrexian-mana-symbol.svg";
    else if (s == "L") return "assets/card-parts/land-mana-symbol.svg";
    else if (s == "S") return "assets/card-parts/snow-mana-symbol.svg";
    else if (s == "F") return "assets/card-parts/fiery-mana-symbol.svg";
    else if (s == "P") return "assets/card-parts/potency-symbol.svg";
    else if (s == "P/1") return "assets/card-parts/potency-symbol-1.svg";
    else if (s == "P/2") return "assets/card-parts/potency-symbol-2.svg";
    else if (s == "P/3") return "assets/card-parts/potency-symbol-3.svg";
    else if (s == "P/4") return "assets/card-parts/potency-symbol-4.svg";
    else return "assets/card-parts/white-mana-symbol.svg";
}

function ResetSearch() {
    window.location.href = "carddex.html?search=" + document.getElementById("search").value;
}

function Search() {
    window.scrollTo(0,0);
    var searchCriteria = document.getElementById("search").value;   
    var rawCards = xmlDoc.getElementsByTagName("carddex")[0].getElementsByTagName("cards")[0].getElementsByTagName("card");
    var cards = [];
    let showTokens = false;
    let random = false;
    if (searchCriteria != "") {
        for (let i = 0; i < searchCriteria.toLowerCase().split(" ").length; i++) {
            if (searchCriteria.toLowerCase().split(" ")[i] == "t:token" || searchCriteria.toLowerCase().split(" ")[i] == "is:token") showTokens = true;
            if (searchCriteria.toLowerCase().split(" ")[i] == "is:random") random = true;
        }
    }
    for (let i = 0; i < rawCards.length; i++) {
        if (rawCards[i].getElementsByTagName("side")[0].textContent == "front" && !showTokens) {
            if (rawCards[i].getElementsByTagName("token").length == 0) {
                cards.push(rawCards[i]);
            }
        }
        if (rawCards[i].getElementsByTagName("side")[0].textContent == "front" && showTokens) {
            if (rawCards[i].getElementsByTagName("token").length > 0) {
                cards.push(rawCards[i]);
            }
        }
        if (rawCards[i].getElementsByTagName("token").length > 0 && searchCriteria.toLowerCase().includes(rawCards[i].getElementsByTagName("name")[0].textContent.toLowerCase())) cards.push(rawCards[i]);
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
                if (check == "is:watermark") {
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("watermark").length == 0) include = false;
                }
                if (check.substring(0,2) == "w:") {
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("watermark").length == 0) include = false;
                    else {
                        if (!cards[i].getElementsByTagName("prop")[0].getElementsByTagName("watermark")[0].textContent.toLowerCase().includes(check.split(":")[1].toLowerCase())) include = false;
                    }
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
                if (check == "legal:standard") {
                    let format = false;
                    for (let k = 0; k < cards[i].getElementsByTagName("set").length; k++) {
                        if (cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "KFS" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "KOF" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "CRO" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "ABY" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "WOG" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "SKA" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "EXS" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "AZU" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "NAT" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "VCL") format = true;
                    }
                    if (!format) include = false;
                }
                if (negate) {
                    if (include) include = false;
                    else include = true;
                }
            }
                
            if (include) newCards.push(cards[i]);
        }
        if (random) {
            let index = Math.floor(Math.random() * newCards.length);
            let newCard = newCards[index];
            newCards = [];
            newCards.push(newCard);
        }
        LoadCards(newCards);
    }
}

function GetCardBack(card) {
    cardURL = "assets/card-parts/card";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Legendary")) cardURL = cardURL + "-legend";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("layout")[0].textContent.includes("hybrid")) cardURL = cardURL + "-hybrid";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Basic")) cardURL = cardURL + "-basic";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Snow")) cardURL = cardURL + "-snow";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Fiery")) cardURL = cardURL + "-fiery";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Land")) cardURL = cardURL + "-land";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Artifact")) cardURL = cardURL + "-artifact";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Saga")) cardURL = cardURL + "-saga";
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes("Class")) cardURL = cardURL + "-class";

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
        cardURL = cardURL + "-planeswalker";
        if (card.getElementsByTagName("prop")[0].getElementsByTagName("layout")[0].textContent == "tall") cardURL = cardURL + "-tall";
        if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "W") cardURL = cardURL + "-white.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "U") cardURL = cardURL + "-blue.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "B") cardURL = cardURL + "-black.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "R") cardURL = cardURL + "-red.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "G") cardURL = cardURL + "-green.svg";
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
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "") cardURL = cardURL + "-colorless.svg";
    }
    else if (card.getElementsByTagName("prop")[0].getElementsByTagName("layout")[0].textContent == "split") {
        if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "WU") cardURL = cardURL + "-split-azorius.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "UB") cardURL = cardURL + "-split-dimir.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "BR") cardURL = cardURL + "-split-rakdos.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "RG") cardURL = cardURL + "-split-gruul.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "WG") cardURL = cardURL + "-split-selesnya.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "WB") cardURL = cardURL + "-split-orzhov.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "UR") cardURL = cardURL + "-split-izzet.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "BG") cardURL = cardURL + "-split-golgari.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "WR") cardURL = cardURL + "-split-boros.svg";
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent == "UG") cardURL = cardURL + "-split-simic.svg";
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

function GetSetName(code) {
    setName = "";
    if (code == "KFS") setName = "Favola Starter Set";
    if (code == "KOF") setName = "Kingdom of Favola";
    if (code == "CRO") setName = "Chromatopia";
    if (code == "CCRO") setName = "Chromatopia Commander";
    if (code == "ABY") setName = "Tales From the Abyss - Adventures in Nautilus";
    if (code == "CABY") setName = "Tales From the Abyss Commander";
    if (code == "WOG") setName = "Garrem";
    if (code == "GEX") setName = "Garrem Expeditions";
    if (code == "CWOG") setName = "Garrem Commander";
    if (code == "CTMW") setName = "The Many Worlds Origins";
    return setName;
}