var parser = new DOMParser();
var xmlSet;

async function OnLoad() {
    var xml2 = await fetch("assets/sets.xml");
    var set = await xml2.text();
    xmlSet = parser.parseFromString(set, "text/xml");
    DrawTable();
}

function DrawTable() {
    let table = document.getElementById("set-table");
    var rawSets = xmlSet.getElementsByTagName("sets")[0].getElementsByTagName("set");
    let html = `<table class="alt-table" id="set-table">
        <tr>
            <td><b>Symbol</b></td>
            <td><b>Set</b></td>
            <td><b>Set Code</b></td>
            <td><b>Cards</b></td>
            <td><b>Release Date</b></td>
        </tr>`;
    for (let i = rawSets.length - 1; i >= 0; i--) {
        let name = rawSets[i].getElementsByTagName("name")[0].textContent;
        let code = rawSets[i].getElementsByTagName("code")[0].textContent;
        let cards = rawSets[i].getElementsByTagName("cards")[0].textContent;
        let release = rawSets[i].getElementsByTagName("release")[0].textContent;
        html += `<tr>
            <td align="center"><img src="assets/card-parts/` + code + `-c.svg" height="20px"/></td>
            <td><a href="carddex.html?search=set:` + code + `">` + name + `</a></td>
            <td align="center">` + code + `</td>
            <td align="center">` + cards + `</td>
            <td align="center">` + release + `</td>
        </tr>`
    }
    html += `</table>`
    table.innerHTML = html;
}