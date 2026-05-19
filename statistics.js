
var parser = new DOMParser();
var xmlDoc;

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

function ResetSearch() {
    window.location.href = "statistics.html?search=" + document.getElementById("search").value;
}

function UpdateFields(cards) {
    let cardCount = cards.length;
    let manaCount = 0;
    let whiteCount = 0;
    let blueCount = 0;
    let blackCount = 0;
    let redCount = 0;
    let greenCount = 0;
    let colorlessCount = 0;
    let creatureCount = 0;
    let artifactCount = 0;
    let enchantmentCount = 0;
    let landCount = 0;
    let instantCount = 0;
    let sorceryCount = 0;
    let planeswalkerCount = 0;
    let battleCount = 0;
    let powerCount = 0;
    let toughnessCount = 0;
    let mysticalCount = 0;
    let potencyCount = 0;
    let typelineCount = 0;
    let types = ["Artifact", "Battle", "Condition", "Creature", "Emblem", "Enchantment", "Instant", "Land", "Planeswalker", "Sorcery"];
    let typeCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let subtypes = [];
    let subtypeCount = [];
    let barColors = [];
    let chartMV = [];
    let chartPow = [];
    let chartTou = [];
    let chartName = [];

    for (let i = 0; i < cards.length; i++) {
        manaCount += Number(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent);
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent.toLowerCase().includes("w")) whiteCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent.toLowerCase().includes("u")) blueCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent.toLowerCase().includes("b")) blackCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent.toLowerCase().includes("r")) redCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent.toLowerCase().includes("g")) greenCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("colors")[0].textContent.toLowerCase() == "") colorlessCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes("creature")) {
            creatureCount++;
            if (!isNaN(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("pt")[0].textContent.split("/")[0]))
            powerCount += Number(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("pt")[0].textContent.split("/")[0]);
            if (!isNaN(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("pt")[0].textContent.split("/")[1]))
            toughnessCount += Number(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("pt")[0].textContent.split("/")[1]);
            chartMV.push(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("cmc")[0].textContent);
            chartPow.push(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("pt")[0].textContent.split("/")[0]);
            chartTou.push(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("pt")[0].textContent.split("/")[1]);
            chartName.push(cards[i].getElementsByTagName("name")[0].textContent);
        }
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes("mystical")) {
            mysticalCount++;
            if (!isNaN(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("potency")[0].textContent))
            potencyCount += Number(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("potency")[0].textContent);
        }
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes("artifact")) artifactCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes("enchantment")) enchantmentCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes("land")) landCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes("instant")) instantCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes("sorcery")) sorceryCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes("planeswalker")) planeswalkerCount++;
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes("battle")) battleCount++;
        typelineCount += cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.split(" ").length;

        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes(String.fromCharCode(8212))) {
            for (let type in cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.split(String.fromCharCode(8212).concat(" "))[1].split(" ")) {
                if (!subtypes.includes(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.split(String.fromCharCode(8212).concat(" "))[1].split(" ")[type])) {
                    subtypes.push(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.split(String.fromCharCode(8212).concat(" "))[1].split(" ")[type]);
                }
            }
        }
        for (let type in cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.split(" ")) {
            if (types.includes(cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.split(" ")[type])) {
                for (let j = 0; j < types.length; j++) {
                    if (types[j] == cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.split(" ")[type]) typeCount[j]++;
                }
            }
        }
        subtypes.sort();
    }

    for (let j = 0; j < Math.max(subtypes.length, types.length); j++) {
        subtypeCount.push(0);
        if (j % 5 == 0) barColors.push("#FFFFA0");
        if (j % 5 == 1) barColors.push("blue");
        if (j % 5 == 2) barColors.push("#202020");
        if (j % 5 == 3) barColors.push("red");
        if (j % 5 == 4) barColors.push("green");
    }
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.includes(String.fromCharCode(8212))) {
            for (let k = 0; k < subtypes.length; k++) {
                for (let type in cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.split(String.fromCharCode(8212).concat(" "))[1].split(" ")) {
                    if (subtypes[k] == cards[i].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.split(String.fromCharCode(8212).concat(" "))[1].split(" ")[type]) {
                        subtypeCount[k]++;
                    }
                }
            }
        }
    }

    document.getElementById("no-cards").innerHTML = cardCount;
    document.getElementById("cards-w").innerHTML = ((whiteCount / cardCount) * 100).toFixed(1) + "%";
    document.getElementById("cards-u").innerHTML = ((blueCount / cardCount) * 100).toFixed(1) + "%";
    document.getElementById("cards-b").innerHTML = ((blackCount / cardCount) * 100).toFixed(1) + "%";
    document.getElementById("cards-r").innerHTML = ((redCount / cardCount) * 100).toFixed(1) + "%";
    document.getElementById("cards-g").innerHTML = ((greenCount / cardCount) * 100).toFixed(1) + "%";
    document.getElementById("cards-c").innerHTML = ((colorlessCount / cardCount) * 100).toFixed(1) + "%";
    document.getElementById("mv").innerHTML = (manaCount / cardCount).toFixed(2);
    document.getElementById("pow").innerHTML = (powerCount / creatureCount).toFixed(2);
    document.getElementById("tou").innerHTML = (toughnessCount / creatureCount).toFixed(2);
    document.getElementById("pot").innerHTML = (potencyCount / mysticalCount).toFixed(2);
    document.getElementById("no-types").innerHTML = (typelineCount / cardCount).toFixed(2);

    let sorted = false;
    while (!sorted) {
        sorted = true;
        for (let i = 0; i < chartMV.length - 1; i++) {
            if (Number(chartMV[i]) > Number(chartMV[i + 1])) {
                [chartMV[i], chartMV[i + 1]] = [chartMV[i + 1], chartMV[i]];
                [chartPow[i], chartPow[i + 1]] = [chartPow[i + 1], chartPow[i]];
                [chartTou[i], chartTou[i + 1]] = [chartTou[i + 1], chartTou[i]];
                sorted = false;
            }
        }
    }
    
    new Chart("pt-mana", {
        type: "line",
        data: {
            labels: chartMV,
            datasets: [{
                backgroundColor: "red",
                borderColor: "rgba(0,0,0,0)",
                data: chartPow,
                fill: false,
                label: "Power"
            },
            {
                backgroundColor: "blue",
                borderColor: "rgba(0,0,0,0)",
                data: chartTou,
                fill: false,
                label: "Toughness"
            }]
        },
        options: {
            title: {
                display: true,
                text: "Mana value vs pt"
            },
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        fontColor: "black",
                        fontSize: 14,
                        stepSize: 1,
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "black",
                        fontSize: 14
                    }
                }]
            }
        }
    });

    new Chart("type-breakdown", {
        type: "pie",
        data: {
            labels: types,
            datasets: [{
                backgroundColor: barColors,
                data: typeCount
            }]
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: "Type Distribution"
            }
        }
    });

    new Chart("subtype-breakdown", {
        type: "pie",
        data: {
            labels: subtypes,
            datasets: [{
                backgroundColor: barColors,
                data: subtypeCount
            }]
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: "Subtype Distribution"
            }
        }
    });
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
    if (searchCriteria == "") UpdateFields(cards);
    else {
        terms = searchCriteria.toLowerCase().split(" ");
        var newCards = [];
        for (let i = 0; i < cards.length; i++) {
            var include = [];
            for (let j = 0; j < terms.length; j++) {
                include.push(true);
                var negate = false;
                var check = terms[j];
                if (terms[j].substring(0,1) == "-") {
                    negate = true;
                    check = terms[j].slice(1);
                }
                if (!check.includes(":") && !check.includes("<") && !check.includes(">") && !check.includes("=") && !cards[i].getElementsByTagName("name")[0].textContent.toLowerCase().includes(check)) include[j] = false;
                if (check.substring(0,4) == "set:") {
                    var temp = false;
                    for (let k = 0; k < cards[i].getElementsByTagName("set").length; k++) {
                        if (cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent.toLowerCase() == check.split(":")[1].toLowerCase()) temp = true;
                    }
                    if (!temp) include[j] = false;
                }
                if (check.substring(0,2) == "c:" || check.substring(0,6) == "color:") {
                    if (!isNaN(check.split(":")[1])) {
                        if (!(check.split(":")[1] == cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length)) include[j] = false;
                    }
                    else {
                        for (let k = 0; k < check.split(":")[1].length; k++) {
                            if (!(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().includes(check.split(":")[1][k]))) include[j] = false;
                        }
                    }
                }
                if (check.substring(0,2) == "c=" || check.substring(0,6) == "color=") {
                    if (!isNaN(check.split("=")[1])) {
                        if (!(check.split("=")[1] == cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length)) include[j] = false;
                    }
                    else {
                        for (let k = 0; k < check.split("=")[1].length; k++) {
                            if (!(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().includes(check.split("=")[1][k]))) include[j] = false;
                        }
                        for (let k = 0; k < cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length; k++) {
                            if (!check.split("=")[1].includes(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase()[k])) include[j] = false;
                        }
                    }
                }
                if (check.substring(0,3) == "c>=" || check.substring(0,7) == "color>=") {
                    if (!isNaN(check.split(">=")[1])) {
                        if (!(check.split(">=")[1] <= cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length)) include[j] = false;
                    }
                    else {
                        for (let k = 0; k < check.split(">=")[1].length; k++) {
                            if (!(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().includes(check.split(">=")[1][k]))) include[j] = false;
                        }
                    }
                }
                else if (check.substring(0,2) == "c>" || check.substring(0,6) == "color>") {
                    if (!isNaN(check.split(">")[1])) {
                        if (!(check.split(">")[1] < cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length)) include[j] = false;
                    }
                    else {
                        for (let k = 0; k < check.split(">")[1].length; k++) {
                            if (!(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().includes(check.split(">")[1][k]))) include[j] = false;
                        }
                        if (cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase() == check.split(">")[1]) include[j] = false;
                    }
                }
                if (check.substring(0,3) == "c<=" || check.substring(0,7) == "color<=") {
                    if (!isNaN(check.split("<=")[1])) {
                        if (!(check.split("<=")[1] >= cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length)) include[j] = false;
                    }
                    else {
                        for (let k = 0; k < cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length; k++) {
                            if (!check.split("<=")[1].includes(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase()[k])) include[j] = false;
                        }
                    }
                }
                else if (check.substring(0,2) == "c<" || check.substring(0,6) == "color<") {
                    if (!isNaN(check.split("<")[1])) {
                        if (!(check.split("<")[1] > cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length)) include[j] = false;
                    }
                    else {
                        for (let k = 0; k < cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase().length; k++) {
                            if (!check.split("<")[1].includes(cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase()[k])) include[j] = false;
                        }
                        if (cards[i].getElementsByTagName("colors")[0].textContent.toLowerCase() == check.split("<")[1]) include[j] = false;
                    }
                }
                if (check.substring(0,3) == "ci:") {
                    for (let k = 0; k < check.split(":")[1].length; k++) {
                        if (!(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().includes(check.split(":")[1][k]))) include[j] = false;
                    }
                }
                if (check.substring(0,3) == "ci=") {
                    if (!(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase() == check.split("=")[1])) include[j] = false;
                }
                if (check.substring(0,4) == "ci>=") {
                    for (let k = 0; k < check.split(">=")[1].length; k++) {
                        if (!(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().includes(check.split(">=")[1][k]))) include[j] = false;
                    }
                }
                else if (check.substring(0,3) == "ci>") {
                    for (let k = 0; k < check.split(">")[1].length; k++) {
                        if (!(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().includes(check.split(">")[1][k]))) include[j] = false;
                    }
                    if (cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase() == check.split(">")[1]) include[j] = false;
                }
                if (check.substring(0,4) == "ci<=") {
                    for (let k = 0; k < cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().length; k++) {
                        if (!check.split("<=")[1].includes(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase()[k])) include[j] = false;
                    }
                }
                else if (check.substring(0,3) == "ci<") {
                    for (let k = 0; k < cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase().length; k++) {
                        if (!check.split("<")[1].includes(cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase()[k])) include[j] = false;
                    }
                    if (cards[i].getElementsByTagName("coloridentity")[0].textContent.toLowerCase() == check.split("<")[1]) include[j] = false;
                }
                if (check.substring(0,3) == "mv:") {
                    if (!(cards[i].getElementsByTagName("cmc")[0].textContent.toLowerCase() == check.split(":")[1])) include[j] = false;
                }
                if (check.substring(0,3) == "mv=") {
                    if (!(cards[i].getElementsByTagName("cmc")[0].textContent.toLowerCase() == check.split("=")[1])) include[j] = false;
                }
                if (check.substring(0,4) == "mv<=") {
                    if (!(Number(cards[i].getElementsByTagName("cmc")[0].textContent) <= Number(check.split("<=")[1]))) include[j] = false;
                }
                else if (check.substring(0,3) == "mv<") {
                    if (!(Number(cards[i].getElementsByTagName("cmc")[0].textContent) < Number(check.split("<")[1]))) include[j] = false;
                }
                if (check.substring(0,4) == "mv>=") {
                    if (!(Number(cards[i].getElementsByTagName("cmc")[0].textContent) >= Number(check.split(">=")[1]))) include[j] = false;
                }
                else if (check.substring(0,3) == "mv>") {
                    if (!(Number(cards[i].getElementsByTagName("cmc")[0].textContent) > Number(check.split(">")[1]))) include[j] = false;
                }
                if (check.substring(0,2) == "t:" || check.substring(0,5) == "type:") {
                    if (!cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes(check.split(":")[1])) include[j] = false;
                }
                if (check.substring(0,3) == "mc:" || check.substring(0,5) == "mana:") {
                    if (!cards[i].getElementsByTagName("manacost")[0].textContent.toLowerCase().includes(check.split(":")[1])) include[j] = false;
                }
                if (check.substring(0,7) == "flavor:") {
                    if (cards[i].getElementsByTagName("flavor").length > 0) {
                        if (!cards[i].getElementsByTagName("flavor")[0].textContent.toLowerCase().includes(check.split(":")[1])) include[j] = false;
                    }
                    else include[j] = false;
                }
                if (check.substring(0,2) == "o:" || check.substring(0,5) == "oracle:") {
                    let temp = false;
                    for (let j = 0; j < cards[i].getElementsByTagName("text").length; j++) {
                        if (cards[i].getElementsByTagName("text")[j].textContent.toLowerCase().includes(check.split(":")[1]))
                        temp = true;
                    }
                    if (!temp) include[j] = false;
                }
                if (check.substring(0,2) == "p:" || check.substring(0,4) == "pow:") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] == check.split(":")[1])) include[j] = false;
                }
                if (check.substring(0,2) == "p=" || check.substring(0,4) == "pow=") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] == check.split("=")[1])) include[j] = false;
                }
                if (check.substring(0,3) == "p<=" || check.substring(0,5) == "pow<=") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] <= check.split("<=")[1])) include[j] = false;
                }
                else if (check.substring(0,2) == "p<" || check.substring(0,4) == "pow<") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] < check.split("<")[1])) include[j] = false;
                }
                if (check.substring(0,3) == "p>=" || check.substring(0,5) == "pow>=") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] >= check.split(">=")[1])) include[j] = false;
                }
                else if (check.substring(0,2) == "p>" || check.substring(0,4) == "pow>") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[0] > check.split(">")[1])) include[j] = false;
                }
                if (check.substring(0,4) == "tou:") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] == check.split(":")[1])) include[j] = false;
                }
                if (check.substring(0,4) == "tou=") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] == check.split("=")[1])) include[j] = false;
                }
                if (check.substring(0,5) == "tou<=") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] <= check.split("<=")[1])) include[j] = false;
                }
                else if (check.substring(0,4) == "tou<") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] < check.split("<")[1])) include[j] = false;
                }
                if (check.substring(0,5) == "tou>=") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] >= check.split(">=")[1])) include[j] = false;
                }
                else if (check.substring(0,4) == "tou>") {
                    if (cards[i].getElementsByTagName("pt").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("pt")[0].textContent.toLowerCase().split("/")[1] > check.split(">")[1])) include[j] = false;
                }
                if (check.substring(0,8) == "potency:") {
                    if (cards[i].getElementsByTagName("potency").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("potency")[0].textContent.toLowerCase() == check.split(":")[1])) include[j] = false;
                }
                if (check.substring(0,8) == "potency=") {
                    if (cards[i].getElementsByTagName("potency").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("potency")[0].textContent.toLowerCase() == check.split("=")[1])) include[j] = false;
                }
                if (check.substring(0,9) == "potency<=") {
                    if (cards[i].getElementsByTagName("potency").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("potency")[0].textContent.toLowerCase() <= check.split("<=")[1])) include[j] = false;
                }
                else if (check.substring(0,8) == "potency<") {
                    if (cards[i].getElementsByTagName("potency").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("potency")[0].textContent.toLowerCase() < check.split("<")[1])) include[j] = false;
                }
                if (check.substring(0,9) == "potency>=") {
                    if (cards[i].getElementsByTagName("potency").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("potency")[0].textContent.toLowerCase() >= check.split(">=")[1])) include[j] = false;
                }
                else if (check.substring(0,8) == "potency>") {
                    if (cards[i].getElementsByTagName("potency").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("potency")[0].textContent.toLowerCase() > check.split(">")[1])) include[j] = false;
                }
                if (check.substring(0,8) == "loyalty:") {
                    if (cards[i].getElementsByTagName("loyalty").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("loyalty")[0].textContent.toLowerCase() == check.split(":")[1])) include[j] = false;
                }
                if (check.substring(0,8) == "loyalty=") {
                    if (cards[i].getElementsByTagName("loyalty").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("loyalty")[0].textContent.toLowerCase() == check.split("=")[1])) include[j] = false;
                }
                if (check.substring(0,9) == "loyalty<=") {
                    if (cards[i].getElementsByTagName("loyalty").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("loyalty")[0].textContent.toLowerCase() <= check.split("<=")[1])) include[j] = false;
                }
                else if (check.substring(0,8) == "loyalty<") {
                    if (cards[i].getElementsByTagName("loyalty").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("loyalty")[0].textContent.toLowerCase() < check.split("<")[1])) include[j] = false;
                }
                if (check.substring(0,9) == "loyalty>=") {
                    if (cards[i].getElementsByTagName("loyalty").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("loyalty")[0].textContent.toLowerCase() >= check.split(">=")[1])) include[j] = false;
                }
                else if (check.substring(0,8) == "loyalty>") {
                    if (cards[i].getElementsByTagName("loyalty").length == 0) include[j] = false;
                    else if (!(cards[i].getElementsByTagName("loyalty")[0].textContent.toLowerCase() > check.split(">")[1])) include[j] = false;
                }
                if (check == "is:dfc") {
                    if (cards[i].getElementsByTagName("layout")[0].textContent.toLowerCase() != "transform" &&
                        cards[i].getElementsByTagName("layout")[0].textContent.toLowerCase() != "restore") include[j] = false;
                }
                if (check == "is:split") {
                    if (cards[i].getElementsByTagName("layout")[0].textContent.toLowerCase() != "split") include[j] = false;
                }
                if (check == "is:hybrid") {
                    if (cards[i].getElementsByTagName("layout")[0].textContent.toLowerCase() != "hybrid") include[j] = false;
                }
                if (check == "is:permanent") {
                    if (cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("instant") ||
                        cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("sorcery") ||
                        cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("condition")) include[j] = false;
                }
                if (check == "is:historic") {
                    if (!cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("artifact") &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("legendary") &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("saga")) include[j] = false;
                }
                if (check == "is:undead") {
                    if (!cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("spirit") &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("vampire") &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("werewolf") &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("zombie")) include[j] = false;
                }
                if (check == "is:party") {
                    if (!cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("cleric") &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("rogue") &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("warrior") &&
                        !cards[i].getElementsByTagName("type")[0].textContent.toLowerCase().includes("wizard")) include[j] = false;
                }
                if (check == "is:vanilla") {
                    if (!cards[i].getElementsByTagName("text")[0].textContent == "") include[j] = false;
                }
                if (check == "is:flavor") {
                    if (cards[i].getElementsByTagName("flavor").length == 0) include[j] = false;
                }
                if (check == "is:watermark") {
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("watermark").length == 0) include[j] = false;
                }
                if (check.substring(0,2) == "w:") {
                    if (cards[i].getElementsByTagName("prop")[0].getElementsByTagName("watermark").length == 0) include[j] = false;
                    else {
                        if (!cards[i].getElementsByTagName("prop")[0].getElementsByTagName("watermark")[0].textContent.toLowerCase().includes(check.split(":")[1].toLowerCase())) include[j] = false;
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
                    if (cardRarityNo != rarityNo) include[j] = false;
                }
                if (check.substring(0,3) == "r<=" || check.substring(0,8) == "rarity<=") {
                    var rarity = check.split("<=")[1];
                    var rarityNo;
                    if (rarity.toLowerCase() == "common" || rarity.toLowerCase() == "c") rarityNo = 0;
                    if (rarity.toLowerCase() == "uncommon" || rarity.toLowerCase() == "u") rarityNo = 1;
                    if (rarity.toLowerCase() == "rare" || rarity.toLowerCase() == "r") rarityNo = 2;
                    if (rarity.toLowerCase() == "mythic" || rarity.toLowerCase() == "m") rarityNo = 3;
                    if (cardRarityNo > rarityNo) include[j] = false;
                }
                else if (check.substring(0,2) == "r<" || check.substring(0,7) == "rarity<") {
                    var rarity = check.split("<")[1];
                    var rarityNo;
                    if (rarity.toLowerCase() == "common" || rarity.toLowerCase() == "c") rarityNo = 0;
                    if (rarity.toLowerCase() == "uncommon" || rarity.toLowerCase() == "u") rarityNo = 1;
                    if (rarity.toLowerCase() == "rare" || rarity.toLowerCase() == "r") rarityNo = 2;
                    if (rarity.toLowerCase() == "mythic" || rarity.toLowerCase() == "m") rarityNo = 3;
                    if (cardRarityNo >= rarityNo) include[j] = false;
                }
                if (check.substring(0,3) == "r>=" || check.substring(0,8) == "rarity>=") {
                    var rarity = check.split(">=")[1];
                    var rarityNo;
                    if (rarity.toLowerCase() == "common" || rarity.toLowerCase() == "c") rarityNo = 0;
                    if (rarity.toLowerCase() == "uncommon" || rarity.toLowerCase() == "u") rarityNo = 1;
                    if (rarity.toLowerCase() == "rare" || rarity.toLowerCase() == "r") rarityNo = 2;
                    if (rarity.toLowerCase() == "mythic" || rarity.toLowerCase() == "m") rarityNo = 3;
                    if (cardRarityNo < rarityNo) include[j] = false;
                }
                else if (check.substring(0,2) == "r>" || check.substring(0,7) == "rarity>") {
                    var rarity = check.split(">")[1];
                    var rarityNo;
                    if (rarity.toLowerCase() == "common" || rarity.toLowerCase() == "c") rarityNo = 0;
                    if (rarity.toLowerCase() == "uncommon" || rarity.toLowerCase() == "u") rarityNo = 1;
                    if (rarity.toLowerCase() == "rare" || rarity.toLowerCase() == "r") rarityNo = 2;
                    if (rarity.toLowerCase() == "mythic" || rarity.toLowerCase() == "m") rarityNo = 3;
                    if (cardRarityNo <= rarityNo) include[j] = false;
                }
                if (check.substring(0,7) == "create:" || check.substring(0,8) == "creates:") {
                    var tokenType = check.split(":")[1];
                    if (cards[i].getElementsByTagName("related").length > 0) {
                        for (let k = 0; k < cards[i].getElementsByTagName("related").length; k++) {
                            var tempCards = xmlDoc.getElementsByTagName("carddex")[0].getElementsByTagName("cards")[0].getElementsByTagName("card");
                            var tokens = [];
                            for (let l = 0; l < tempCards.length; l++) {
                                if (tempCards[l].getElementsByTagName("name")[0].textContent == cards[i].getElementsByTagName("related")[0].textContent) {
                                        if (tempCards[l].getElementsByTagName("prop")[0].getElementsByTagName("type")[0].textContent.toLowerCase().includes(tokenType)) {
                                            tokens.push(tempCards[l]);
                                        }
                                }
                            }
                            if (tokens.length == 0) include[j] = false;
                        }
                    }
                    else include[j] = false;
                }
                if (check.substring(0,4) == "tag:") {
                    var tag = check.split(":")[1];
                    let containsTag = false;
                    if (cards[i].getElementsByTagName("tag").length > 0) {
                        for (let k = 0; k < cards[i].getElementsByTagName("tag").length; k++) {
                            if (tag.toLowerCase() == cards[i].getElementsByTagName("tag")[k].textContent.toLowerCase()) containsTag = true;
                        }
                    }
                    if (!containsTag) include[j] = false;
                }
                if (check == "legal:primordial" || check == "legal:pioneer") {
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
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "VCL" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "MSS" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "DRT" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "FES" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "POS" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "INF" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "PSB" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "BLZ" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "NGA" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "RST" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "SEI") format = true;
                    }
                    if (!format) include[j] = false;
                }
                if (check == "legal:standard") {
                    let format = false;
                    for (let k = 0; k < cards[i].getElementsByTagName("set").length; k++) {
                        if (
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "MSS" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "DRT" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "FES" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "POS" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "INF" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "PSB" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "BLZ" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "NGA" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "RST" ||
                        cards[i].getElementsByTagName("set")[k].getElementsByTagName("code")[0].textContent == "SEI") format = true;
                    }
                    if (!format) include[j] = false;
                }
                if (negate) {
                    if (include[j]) {include[j] = false;}
                    else {include[j] = true;}
                }
            }
            let inclusion = true;
            for (let j = 0; j < terms.length; j++) {
                if (include[j] == false) inclusion = false;
            }
            if (inclusion) newCards.push(cards[i]);
        }
        if (random) {
            let index = Math.floor(Math.random() * newCards.length);
            let newCard = newCards[index];
            newCards = [];
            newCards.push(newCard);
        }
        UpdateFields(newCards);
    }
}