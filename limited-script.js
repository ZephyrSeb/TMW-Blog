var parser = new DOMParser();
var xmlDoc;
var format;
var cardPool = [];
var sideboard = [];
var draftPacks = [,];
var aiPreferenceP = [];
var aiPreferenceS1 = [];
var aiPreferenceS2 = [];
var currentPack = -1;
var currentSet = 0;

async function OnLoad() {
    let set = document.getElementById("set-select").value;
    let jsonPath = "";
    if (set == "fes") jsonPath = await fetch("assets/limited/FES.json");
    if (set == "wog") jsonPath = await fetch("assets/limited/WOG.json");
    if (set == "kof") jsonPath = await fetch("assets/limited/KOF.json");
    if (set == "cro") jsonPath = await fetch("assets/limited/CRO.json");
    if (set == "aby") jsonPath = await fetch("assets/limited/ABY.json");
    if (set == "azu") jsonPath = await fetch("assets/limited/AZU.json");
    if (set == "ska") jsonPath = await fetch("assets/limited/SKA.json");
    if (set == "nat") jsonPath = await fetch("assets/limited/NAT.json");
    if (set == "vcl") jsonPath = await fetch("assets/limited/VCL.json");
    let text;
    if (set != "custom") {
        document.getElementById("custom-set").disabled = true;
        text = await jsonPath.text();
        format = JSON.parse(text);
    }
    if (set == "custom") {
        document.getElementById("custom-set").disabled = false;
        document.getElementById("custom-set").addEventListener("change", (e) => {
            let fileReader = new FileReader();
            var file = e.target.files[0];
            fileReader.readAsText(file);
            fileReader.onload = function(evt) {
                text = evt.target.result;
                format = JSON.parse(text);
            }
        })
    }
    
    var xml = await fetch("assets/cards.xml");
    var text2 = await xml.text();
    xmlDoc = parser.parseFromString(text2, "text/xml");
    urlParams = new URLSearchParams(window.location.search)
    var rawCards = xmlDoc.getElementsByTagName("carddex")[0].getElementsByTagName("cards")[0].getElementsByTagName("card");

    document.getElementById("card-display").style.width="252px";
    document.getElementById("card-display").style.height="352px";
}

function getImage(url) {
  return new Promise((resolve) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.src = url
  })
}

function Generate() {
    let format = document.getElementById("format-select").value;
    if (format == "sealed") GenerateSealed();
    if (format == "draft") GenerateDraft();
}

function GenerateSealed() {
    cardPool = [];
    sideboard = [];
    for (let i = 0; i < 6; i++) {
        cardPool = cardPool.concat(GeneratePacks());
    }
    document.getElementById("land-w").value = 0;
    document.getElementById("land-u").value = 0;
    document.getElementById("land-b").value = 0;
    document.getElementById("land-r").value = 0;
    document.getElementById("land-g").value = 0;
    DrawCards();
    UpdateDeckCount();
}

function GenerateDraft() {
    cardPool = [];
    sideboard = [];
    for (let i = 0; i < 24; i++) {
        draftPacks[i] = GeneratePacks();
    }
    document.getElementById("land-w").value = 0;
    document.getElementById("land-u").value = 0;
    document.getElementById("land-b").value = 0;
    document.getElementById("land-r").value = 0;
    document.getElementById("land-g").value = 0;
    currentPack = 0;
    for (let i = 0; i < 7; i++) {
        aiPreferenceP[i] = ChooseColor();
        aiPreferenceS1[i] = ChooseColor();
        aiPreferenceS2[i] = ChooseColor();
        while (aiPreferenceS1[i] == aiPreferenceP[i]) aiPreferenceS1[i] = ChooseColor();
        while (aiPreferenceS2[i] == aiPreferenceP[i]) aiPreferenceS2[i] = ChooseColor();
    }
    DrawCards();
    UpdateDeckCount();
}

function UpdateDeckCount() {
    let deckSize = document.getElementById("deck-count");
    let landW = Number(document.getElementById("land-w").value);
    let landU = Number(document.getElementById("land-u").value);
    let landB = Number(document.getElementById("land-b").value);
    let landR = Number(document.getElementById("land-r").value);
    let landG = Number(document.getElementById("land-g").value);
    deckSize.textContent = landW + landU + landB + landR + landG + cardPool.length;
    if (currentPack > -1 && currentSet < 3) {
        let set = currentSet + 1;
        let pack = 15 - draftPacks[currentPack].length;
        document.getElementById("draft-count").innerHTML = "Pack " + set + ", Pick " + pack;
    }
}

async function DrawCards() {
    cardPool.sort();
    sideboard.sort();
    document.getElementById("column-0").innerHTML = "";
    document.getElementById("column-1").innerHTML = "";
    document.getElementById("column-2").innerHTML = "";
    document.getElementById("column-3").innerHTML = "";
    document.getElementById("column-4").innerHTML = "";
    document.getElementById("sideboard-0").innerHTML = "";
    document.getElementById("sideboard-1").innerHTML = "";
    document.getElementById("sideboard-2").innerHTML = "";
    document.getElementById("sideboard-3").innerHTML = "";
    document.getElementById("sideboard-4").innerHTML = "";
    let cardDisplay = document.getElementById("card-display");
    for (let cardName in cardPool) {
        //console.log(cardPool[cardName]);
        let mv = FindCard(cardPool[cardName]).getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent;
        let mvm = mv;
        if (mv > 4) mvm = 4;
        let div = document.createElement("div");
        let canvas = document.createElement("canvas");
        div.name = cardPool[cardName];
        div.addEventListener("click", function() {RemoveCard(div, "main")});
        div.addEventListener("mouseenter", function() {DrawCard(cardDisplay, FindCard(cardPool[cardName]), 1)});
        document.getElementById("column-" + mvm.toString()).appendChild(div);
        canvas.style.width="189px";
        canvas.style.height="33px";
        canvas.width=504;
        canvas.height=88;
        DrawCardTruncated(canvas, FindCard(cardPool[cardName]), 1);
        div.appendChild(canvas);
    }
    i = 0;
    for (let cardName in sideboard) {
        let mv = FindCard(sideboard[cardName]).getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent;
        let mvm = mv;
        if (mv > 4) mvm = 4;
        let div = document.createElement("div");
        let canvas = document.createElement("canvas");
        div.name = sideboard[cardName];
        div.addEventListener("click", function() {RemoveCard(div, "side")});
        div.addEventListener("mouseenter", function() {DrawCard(cardDisplay, FindCard(sideboard[cardName]), 1)});
        document.getElementById("sideboard-" + mvm.toString()).appendChild(div);
        canvas.style.width="189px";
        canvas.style.height="33px";
        canvas.width=504;
        canvas.height=88;
        DrawCardTruncated(canvas, FindCard(sideboard[cardName]), 1);
        div.appendChild(canvas);
    }
    if (currentPack > -1) {
        let packDisplay = document.getElementById("draft");
        packDisplay.innerHTML = '';
        for (let cardName in draftPacks[currentPack]) {
            let div = document.createElement("div");
            div.style.display = 'inline-block';
            let canvas = document.createElement("canvas");
            div.addEventListener("mouseenter", function() {DrawCard(cardDisplay, FindCard(draftPacks[currentPack][cardName]), 1)});
            div.addEventListener("click", function() {
                cardPool.push(draftPacks[currentPack][cardName]);
                draftPacks[currentPack].splice(cardName, 1);
                AdvanceDraftPacks();
            })
            packDisplay.appendChild(div);
            canvas.style.width="252px";
            canvas.style.height="352px";
            canvas.width=504;
            canvas.height=704;
            DrawCard(canvas, FindCard(draftPacks[currentPack][cardName]), 1);
            div.appendChild(canvas);
        }
    }
}

function AdvanceDraftPacks() {
    if (draftPacks[currentPack].length > 0) {
        for (let i = currentSet * 8; i < (currentSet + 1) * 8; i++) {
            if (i != currentPack) RemoveCardAtRandom(i);
        }
        currentPack++;
        if (currentPack >= 8 * (currentSet + 1)) currentPack = 8 * currentSet;
    }
    else {
        currentSet++;
        currentPack = currentSet * 8;
    }
    DrawCards();
    UpdateDeckCount();
}

function RemoveCardAtRandom(pack) {
    let ai = (pack - currentPack) % 8;
    let index = draftPacks[pack].length;
    let weights = [];
    let totalWeight = 0;
    for (let i = 0; i < index; i++) {
        let card = FindCard(draftPacks[pack][i]);
        let rarity = card.getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent;
        let color = card.getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent;
        let type = card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent;
        let weight = 0;
        if (rarity.toLowerCase() == "common") weight += 1;
        if (rarity.toLowerCase() == "uncommon") weight += 3;
        if (rarity.toLowerCase() == "rare") weight += 7;
        if (rarity.toLowerCase() == "mythic") weight += 9;
        if (color.includes(aiPreferenceP[ai])) weight += 5;
        if (color.includes(aiPreferenceS1[ai])) weight += 3;
        if (color.includes(aiPreferenceS2[ai])) weight += 3;
        if (type.toLowerCase().includes("land")) weight += 3;
        weights[i] = weight;
        totalWeight += weight;
    }
    let rand = Math.floor(Math.random() * totalWeight);
    let testWeight = 0;
    let finalCard = -1;
    for (let i = 0; i < index; i++) {
        testWeight += weights[i];
        if (testWeight > rand && finalCard == -1) finalCard = i;
    }
    draftPacks[pack].splice(finalCard, 1);
}

function GeneratePacks() {
    let cardPool = [];
    for (let j in format.slots) {
        for (let roll = 0; roll < format.slots[j].rolls; roll++) {
            let possibleSlots = format.slots[j].slot;
            let finalSlot = -1;
            if (possibleSlots.length > 0) {
                let totalWeight = 0;
                for (let loop in possibleSlots) {
                    totalWeight += possibleSlots[loop].weight;
                }
                chosenSlot = Math.floor(Math.random() * totalWeight);
                let cumulativeWeight = 0;
                for (let loop in possibleSlots) {
                    cumulativeWeight += possibleSlots[loop].weight;
                    if (chosenSlot < cumulativeWeight && finalSlot == -1) finalSlot = loop;
                }
                for (let loop in format.lists) {
                    if (format.lists[loop].name == format.slots[j].slot[finalSlot].name) {
                        cardPool.push(format.lists[loop].list[Math.floor(Math.random() * format.lists[loop].list.length)]);
                    }
                }
            }
            else {
                for (let loop in format.lists) {
                    if (format.lists[loop].name == format.slots[j].slot.name) {
                        cardPool.push(format.lists[loop].list[Math.floor(Math.random() * format.lists[loop].list.length)]);
                    }
                }
            }
        }
    }
    return cardPool;
}

function FindCard(name) {
    let cards = xmlDoc.getElementsByTagName("carddex")[0].getElementsByTagName("cards")[0];
    for (let card in cards.getElementsByTagName("card")) {
        if (cards.getElementsByTagName("card")[card].getElementsByTagName("name")[0].textContent == name) return cards.getElementsByTagName("card")[card];
    }
    return "";
}

function CopyDeck() {
    if (cardPool.length > 0) {
        let clipboard = "";
        let uniqueCard = [...new Set(cardPool)];
        for (let i in uniqueCard) {
            if (uniqueCard[i] != "") {
                clipboard += cardPool.filter((value) => value == uniqueCard[i]).length + " " + uniqueCard[i] + "\n";
            }
        }
        let landW = Number(document.getElementById("land-w").value);
        let landU = Number(document.getElementById("land-u").value);
        let landB = Number(document.getElementById("land-b").value);
        let landR = Number(document.getElementById("land-r").value);
        let landG = Number(document.getElementById("land-g").value);
        if (landW > 0) clipboard += landW + " Plains\n";
        if (landU > 0) clipboard += landU + " Island\n";
        if (landB > 0) clipboard += landB + " Swamp\n";
        if (landR > 0) clipboard += landR + " Mountain\n";
        if (landG > 0) clipboard += landG + " Forest\n";
        if (sideboard.length > 0) {
            clipboard += "\n";
            let uniqueCard = [...new Set(sideboard)];
            for (let i in uniqueCard) {
                if (uniqueCard[i] != "") {
                    clipboard += sideboard.filter((value) => value == uniqueCard[i]).length + " " + uniqueCard[i] + "\n";
                }
            }
        }
        navigator.clipboard.writeText(clipboard);
        alert("Copied deck");
    }
}

function RemoveCard(id, board) {
    let cardName = id.name;
    let index;
    if (board == "main") index = cardPool.indexOf(cardName);
    else index = sideboard.indexOf(cardName);
    if (board == "main") {
        cardPool[index] = "";
        cardPool.splice(index, 1);
        sideboard.push(cardName);
    }
    else {
        sideboard[index] = "";
        sideboard.splice(index, 1);
        cardPool.push(cardName);
    }
    DrawCards();
    UpdateDeckCount();
}

async function DrawCard(canvas, card, size) {
    let imgPT = await getImage(GetCardPT(card));
    let imgPotency = await getImage("assets/card-parts/potency-symbol-large.svg");
    let imgDefense = await getImage("assets/card-parts/defense-symbol-large.svg");
    let imgRarity = await getImage(GetSetSymbol(card.getElementsByTagName("set")[0].getElementsByTagName("code")[0].textContent, card.getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent));
    manaBack = await getImage("assets/card-parts/mana-symbol-back.svg");
    var manaSymbol = [];
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
            manaSymbol[j] = await getImage(findManaSymbol(manacost.substring(pos + 1, pos + length))); pos += length + 1;
        }
        else {manaSymbol[j] = await getImage(findManaSymbol(manacost.at(pos))); pos++;}
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
                manaSymbol2[j] = await getImage(findManaSymbol(manacost2.substring(pos + 1, pos + length))); pos += length + 1;
            }
            else {manaSymbol2[j] = await getImage(findManaSymbol(manacost2.at(pos))); pos++;}
            j++;
        }
    }
    let imgBack = await getImage(GetCardBack(card));
    
    let name = card.getElementsByTagName("name")[0].textContent;
    let type = card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent;
    let textbox = card.getElementsByTagName("text")[0].textContent;
    let pt = "";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("pt").length > 0) {
        pt = card.getElementsByTagName("prop")[0].getElementsByTagName("pt")[0].textContent;
    }
    let setno = "TMW-"+ card.getElementsByTagName("set")[0].getElementsByTagName("code")[0].textContent + " " + card.getElementsByTagName("set")[0].getElementsByTagName("rarity")[0].textContent.at(0).toUpperCase();
    let manavalue = card.getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent;
    let potency = "";
    let defense = "";
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("potency").length > 0) potency = card.getElementsByTagName("prop")[0].getElementsByTagName("potency")[0].textContent;
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("defense").length > 0) defense = card.getElementsByTagName("prop")[0].getElementsByTagName("defense")[0].textContent;
    let pw = 0;
    saga1 = await getImage("assets/card-parts/saga-chapter-1.svg");
    saga2 = await getImage("assets/card-parts/saga-chapter-2.svg");
    saga3 = await getImage("assets/card-parts/saga-chapter-3.svg");
    saga4 = await getImage("assets/card-parts/saga-chapter-4.svg");
    saga5 = await getImage("assets/card-parts/saga-chapter-5.svg");
    saga6 = await getImage("assets/card-parts/saga-chapter-6.svg");
    saga7 = await getImage("assets/card-parts/saga-chapter-7.svg");

    let context = canvas.getContext('2d');
    if (type.includes("Planeswalker")) pw = 10
    context.drawImage(imgBack, 0, 0, 504 * size, 704 * size);
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("watermark").length > 0) {
        let watermark = new Image();
        if (card.getElementsByTagName("watermark")[0].textContent == "The Lost") watermark = await getImage("assets/card-parts/watermark-the-lost.svg");
        if (card.getElementsByTagName("watermark")[0].textContent == "Chi Yu") watermark = await getImage("assets/card-parts/watermark-chi-yu.svg");
        if (card.getElementsByTagName("watermark")[0].textContent == "Sanada") watermark = await getImage("assets/card-parts/watermark-sanada.svg");
        if (card.getElementsByTagName("watermark")[0].textContent == "Icejade Cradle") watermark = await getImage("assets/card-parts/watermark-icejade-cradle.svg");
        if (card.getElementsByTagName("watermark")[0].textContent == "Land of Iron") watermark = await getImage("assets/card-parts/watermark-land-of-iron.svg");
        if (card.getElementsByTagName("watermark")[0].textContent == "Dragma") watermark = await getImage("assets/card-parts/watermark-dragma.svg");
        if (card.getElementsByTagName("watermark")[0].textContent == "Despia") watermark = await getImage("assets/card-parts/watermark-despia.svg");
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
            context.font=18 * size + "pt Beleren";
            context.fillText(type, 48 * size, 624 * size, 384 * size);
            context.drawImage(imgRarity, 432 * size, 600 * size, 32 * size, 32 * size);
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
                "1": saga1,
                "2": saga2,
                "3": saga3,
                "4": saga4,
                "5": saga5,
                "6": saga6,
                "7": saga7
            }
            context.font=18 * size + "pt Beleren";
            context.fillText(type, 48 * size, 624 * size, 384 * size);
            context.drawImage(imgRarity, 432 * size, 600 * size, 32 * size, 32 * size);
            context.font=16 * size + "pt MPlantin";
            let uniqueChapters = card.getElementsByTagName("text").length;
            let chapters = card.getElementsByTagName("text")[uniqueChapters - 1].textContent.split(": ")[0].split(",")[card.getElementsByTagName("text")[uniqueChapters - 1].textContent.split(": ")[0].split(",").length - 1];
            wrapText(context, card.getElementsByTagName("text")[0].textContent, 42 * size, 102 * size, 206 * size, 20 * size, size, "Saga");
            let chapterSeparator = await getImage("assets/card-parts/chapter-separator.svg");
            for (let s = 0; s < uniqueChapters - 1; s++) {
                let chapterText = card.getElementsByTagName("text")[s + 1].textContent.split(": ")[1];
                wrapText(context, chapterText, 64 * size, (228 + (s * 428 / uniqueChapters)) * size, 184 * size, 20 * size, size, "Saga");
                context.drawImage(chapterSeparator, 56 * size, (208 + ((s+1) * 428 / uniqueChapters)) * size, 192 * size, 4 * size);
                let currentChapters = card.getElementsByTagName("text")[s + 1].textContent.split(": ")[0].split(",");
                for (let t = 0; t < currentChapters.length; t++) {
                    let chapterBanner = chapter_dict[currentChapters[t]];
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
                    let img = await getImage("assets/card-parts/loyalty-up.svg");
                    context.drawImage(img, 22 * size, (448 + 64 * s + layout) * size, 64 * size, 40 * size);
                    context.font="Bold " + 17 * size + "pt Beleren";
                    context.fillStyle = "#FFFFFF";
                    context.textAlign = "center";
                    context.fillText(card.getElementsByTagName("text")[s].textContent.split(": ")[0], 52 * size, (477 + 64 * s + layout) * size);
                }
                if (Number(card.getElementsByTagName("text")[s].textContent.split(": ")[0]) < 0) {
                    let img = await getImage("assets/card-parts/loyalty-down.svg");
                    context.drawImage(img, 22 * size, (456 + 64 * s + layout) * size, 64 * size, 40 * size);
                    context.font="Bold " + 17 * size + "pt Beleren";
                    context.fillStyle = "#FFFFFF";
                    context.textAlign = "center";
                    context.fillText(card.getElementsByTagName("text")[s].textContent.split(": ")[0], 52 * size, (480 + 64 * s + layout) * size);
                }
                if (Number(card.getElementsByTagName("text")[s].textContent.split(": ")[0]) == 0) {
                    let img = await getImage("assets/card-parts/loyalty-0.svg");
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
    context.font=16 * size + "pt MPlantin";
}

async function DrawCardTruncated(canvas, card, size) {
    let type = card.getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent;
    manaBack = await getImage("assets/card-parts/mana-symbol-back.svg");
    var manaSymbol = [];
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
            manaSymbol[j] = await getImage(findManaSymbol(manacost.substring(pos + 1, pos + length))); pos += length + 1;
        }
        else {manaSymbol[j] = await getImage(findManaSymbol(manacost.at(pos))); pos++;}
        j++;
    }
    manalength = j;
    let imgBack = await getImage(GetCardBack(card));
    let name = card.getElementsByTagName("name")[0].textContent;
    let manavalue = card.getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent;
    let pw = 0;

    let context = canvas.getContext('2d');
    if (type.includes("Planeswalker")) pw = 10
    context.drawImage(imgBack, 0, 0, 504 * size, 704 * size);
    if (card.getElementsByTagName("prop")[0].getElementsByTagName("layout")[0].textContent == "split") {
        for (let sp = 0; sp < 2; sp++) {
            if (sp == 0) {
                for (let j = 0; j < manaSymbol.length; j++) {
                    context.drawImage(manaBack, (439.5 - 26 * (manaSymbol.length - j - 1)) * size, (42 + 312 * sp) * size, 24 * size, 24 * size);
                    context.drawImage(manaSymbol[j], (440 - 26 * (manaSymbol.length - j - 1)) * size, (40 + 312 * sp) * size, 24 * size, 24 * size);
                }
            }
        }
    }
    else {
        for (let j = 0; j < manaSymbol.length; j++) {
            context.drawImage(manaBack, (439.5 - 26 * (manaSymbol.length - j - 1)) * size, (42 - pw) * size, 24 * size, 24 * size);
            context.drawImage(manaSymbol[j], (440 - 26 * (manaSymbol.length - j - 1)) * size, (40 - pw) * size, 24 * size, 24 * size);
        }
        context.font=20 * size + "pt Beleren";
        context.fillStyle = "#000000";
        context.textAlign = "left";
        context.fillText(name, 48 * size, (64 - pw) * size, (396 - 20 * manalength) * size);
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
        else if (card.getElementsByTagName("prop")[0].getElementsByTagName("coloridentity")[0].textContent == "") cardURL = cardURL + "-wastes.svg";
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
        else cardURL = cardURL + "-gold.svg";
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
    if (code == "VCL") setName = "Vlad's Castle";
    if (code == "NAT") setName = "Naturia";
    if (code == "SKA") setName = "Shinkara";
    if (code == "EXS") setName = "Excavation Site";
    if (code == "MSS") setName = "Murders at the Swingin' Speakeasy";
    if (code == "DRT") setName = "Dogan: The Rose and the Tower";
    if (code == "AZU") setName = "Azure Archives";
    if (code == "AZA") setName = "Azure Mystical Archives";
    if (code == "FES") setName = "Festiville";
    if (code == "POS") setName = "Palace of Silence";
    if (code == "INF") setName = "Infinite Ravine";
    if (code == "PSB") setName = "Poisonous Swamp of Blagghrt";
    if (code == "BLZ") setName = "Blazing Inferno";
    if (code == "NGA") setName = "Nature's Garden";
    if (code == "RST") setName = "World's Rest";
    if (code == "PMW") setName = "Many Worlds Promo";
    return setName;
}

async function wrapText(context, text, x, y, maxWidth, lineHeight, size, type = "") {
    let words = text.split(' ');
    let line = '';
    let lines = 0;
    mana_dict = {
        "{W}": "assets/card-parts/white-mana-symbol.svg",
        "{U}": "assets/card-parts/blue-mana-symbol.svg",
        "{B}": "assets/card-parts/black-mana-symbol.svg",
        "{R}": "assets/card-parts/red-mana-symbol.svg",
        "{G}": "assets/card-parts/green-mana-symbol.svg",
        "{C}": "assets/card-parts/colorless-mana-symbol.svg",
        "{A}": "assets/card-parts/gold-mana-symbol.svg",
        "{T}": "assets/card-parts/tap-symbol.svg",
        "{0}": "assets/card-parts/generic-mana-symbol-0.svg",
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
        "{A/T}": "assets/card-parts/treasure-mana-symbol.svg",
        "{A/C}": "assets/card-parts/clue-mana-symbol.svg",
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
        "{P/5}": "assets/card-parts/potency-symbol-5.svg",
        "{P/*}": "assets/card-parts/potency-symbol-star.svg",
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
        "{S/-10}": "assets/card-parts/spark-down-10.svg",
        "{V}": "assets/card-parts/void-mana-symbol.svg"
    };

    for (let n = 0; n < Object.entries(mana_dict).length; n++) {
        Object.entries(mana_dict)[n][1].onload = function() {n++;}
    }
    writeText();

    async function writeText() {
        context.textAlign = "left";
        context.font=16 * size + "pt MPlantin";
        let fontSize = 16;
        context.fillStyle = "#000000";
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
        if (type != "Saga" && type != "split" && type != "Planeswalker") y = Math.max(y - ((lines - 1) / 2) * lineHeight, 232 * 2 * size);
        if (type == "Planeswalker") {
            if (lines>=4) {
                fontSize = 12;
                lineHeight = 14 * size;
                y -= 4;
            }
            if (lines>=5) {
                fontSize = 10;
                lineHeight = 12 * size;
                y -= 4;
            }
            if (lines>=6) {
                fontSize = 8;
                lineHeight = 10 * size;
                y -= 4;
            }
        }
        
        if (type == "Saga" && lines>=6) {
            fontSize = 14;
            lineHeight = 16 * size;
            y -= 6;
        }
        if (type == "Saga" && lines>=8) {
            fontSize = 12;
            lineHeight = 14 * size;
            y -= 6;
        }
        if (type != "Saga" && lines >= 10) {
            fontSize = 14;
            lineHeight = 18 * size;
        }
        if (type != "Saga" && lines >= 14) {
            fontSize = 12;
            lineHeight = 14 * size;
        }

        for(let n = 0; n < words.length; n++) {
            context.font=fontSize * size + "pt MPlantin";
            context.fillStyle = "#000000";
            if (words[n].includes("\n")) {
                
                let testLine = line + words[n].split('\n')[0];
                let metrics = context.measureText(testLine);
                let testWidth = metrics.width;
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
                let img = await getImage(mana_dict[words[n].substring(0, words[n].indexOf("}") + 1)])
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
    else if (s == "0") return "assets/card-parts/generic-mana-symbol-0.svg";
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
    else if (s == "A/T") return "assets/card-parts/treasure-mana-symbol.svg";
    else if (s == "A/C") return "assets/card-parts/clue-mana-symbol.svg";
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
    else if (s == "P/5") return "assets/card-parts/potency-symbol-5.svg";
    else if (s == "P/*") return "assets/card-parts/potency-symbol-star.svg";
    else if (s == "V") return "assets/card-parts/void-mana-symbol.svg";
    else return "assets/card-parts/white-mana-symbol.svg";
}

function ChooseColor() {
    let x = Math.floor(Math.random() * 5)
    if (x < 1) return "W";
    else if (x < 2) return "U";
    else if (x < 3) return "B";
    else if (x < 4) return "R";
    else if (x < 5) return "G";
}