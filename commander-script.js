async function CopyDeck(id) {
    let path = "";
    if (id.id == "milo") path = await fetch("assets/commander-decks/milo demaret, assembly speaker.txt");
    if (id.id == "first-painter") path = await fetch("assets/commander-decks/the first painter.txt");
    if (id.id == "baxia") path = await fetch("assets/commander-decks/general baxia, wu tactician.txt");
    if (id.id == "bear") path = await fetch("assets/commander-decks/the inevitable bear.txt");
    if (id.id == "lord-labine") path = await fetch("assets/commander-decks/lord labine, outpost captain.txt");
    if (id.id == "rosie") path = await fetch("assets/commander-decks/rosie mason, private investigator.txt");
    if (id.id == "idrasa") path = await fetch("assets/commander-decks/idrasa alma, shadelord.txt");
    if (id.id == "jarad") path = await fetch("assets/commander-decks/jarad killian, travelling artist.txt");
    if (id.id == "dreselia") path = await fetch("assets/commander-decks/dreselia of the pine grove.txt");
    if (id.id == "sasai") path = await fetch("assets/commander-decks/sasai, scion of urborgh.txt");
    if (id.id == "christian") path = await fetch("assets/commander-decks/christian stensen, godslayer.txt");
    if (id.id == "naia") path = await fetch("assets/commander-decks/naia, angelic artifice.txt");
    if (id.id == "slizaar") path = await fetch("assets/commander-decks/slizaar, serpentine artifice.txt");
    if (id.id == "blagghrt") path = await fetch("assets/commander-decks/the great beluging beast of blagghrt.txt");
    if (id.id == "artzon") path = await fetch("assets/commander-decks/artzon, tabaxi hero.txt");
    if (id.id == "brack") path = await fetch("assets/commander-decks/brack, the usurper.txt");
    if (id.id == "mundoug-jorisli") path = await fetch("assets/commander-decks/mundoug and jorisli herog.txt");
    if (id.id == "ornwin") path = await fetch("assets/commander-decks/ornwin, spiritual guide.txt");
    let text = await path.text();
    await navigator.clipboard.writeText(text);
    alert("Copied deck");
}