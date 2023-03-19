const socket = io();
const room = document.getElementById("room").innerHTML;

let player = {
    host: false,
    roomId: parseInt(room),
    username: "",
    socketId: socket.id,
    ping:0
};

var id = socket.id;

function enterGame(event) {
    event.preventDefault();
    player.username = document.getElementById("nick").value;
    document.body.removeChild(document.getElementById("filter"));
    if (player.username == "")
        document.getElementsByClassName("buzzer")[0].style.visibility = "hidden";
    socket.emit("add-player", player);
    socket.emit("request-grid");
}

socket.on("get-grid", (g) => {
    grid = g;
});

socket.on("new-player", (player)=>{
    if (candidats.length < 3 && player.username != "") {
        candidats.push(player.username);
        let ind = candidats.length;
        document.getElementById("name" + ind).innerHTML = player.username;
        document.getElementById("score" + ind).innerHTML = "0";
    }
});

socket.on("player-init", (room, p)=>{
    player = p;
    for (let p of room.players)
        if (p.username !== "" && candidats.length < 3) {
            candidats.push(p.username);
            let ind = candidats.length;
            document.getElementById("name" + ind).innerHTML = p.username;
            document.getElementById("score" + ind).innerHTML = "0";
        }
        for (let i = 1; i <= 3; i++)
            document.getElementById("score" + i).innerHTML = room.scores[i - 1];
        if (room.dom)
            document.getElementById("grille").innerHTML = room.dom;
        if (room.currentQuestion > -1) {
            currentQuestion = room.currentQuestion;
            document.getElementById("question").innerHTML = currentQuestion < grilleQuestions.length ? grilleQuestions[currentQuestion].text : "Plus de questions !";
            document.getElementById("question").innerHTML = document.getElementById("question").innerHTML.replace("?&lt;br/&gt;", "<br/>");
        }
        if (room.slam > -1) {
            document.body.classList.add("slam-bg");
            document.getElementById("name" + (room.slam + 1).toString()).parentElement.style.background = "#f00";
        }
        if (room.locked || room.slam > -1) {
            let state = document.getElementsByClassName("buzzer-state")[0];
            state.innerHTML = "Fermé";
            state.classList.remove("unlocked");
            state.classList.add("locked");
            let buzzer = document.getElementsByClassName("buzzer")[0];
            buzzer.classList.add("locked");
            buzzer.innerHTML = "🔒";
        }
    
        window.onkeydown = (e) => {
            if (e && e.keyCode == 32)
                buzz();
        }
});

socket.on("host-leave", () => {
    alert("L'hôte a quitté le salon.");
    let form = document.createElement("form");
    form.method = "post";
    form.action = "leave";
    document.body.appendChild(form);
    form.submit();
});

socket.on("reconnect", () => {
    emit('user-reconnect', id);
});





socket.on("unlock-buzz",()=>{
    unlockBuzzer();
});

socket.on("lock-buzz",()=>{
    lockBuzzer();
});

socket.on("player-buzz",(buzzes)=>{
    addBuzzed(buzzes);
});

socket.on("clear-buzz",()=>{
    resetBuzzers();
});

function buzz() {
    let buzzer = document.getElementsByClassName("buzzer")[0];
    if (buzzer && !buzzer.classList.contains("buzzed") && !buzzer.classList.contains("locked")) {
        buzzer.classList.add("buzzed");
        buzzer.innerHTML = "🔒";
        socket.emit("player-buzz", player);
    }
}

function addBuzzed(players) {
    let buzzers = document.getElementById("buzzers");
    while (buzzers.lastElementChild && buzzers.lastElementChild.className.includes("buzz-name"))
        buzzers.removeChild(buzzers.lastElementChild);
    for (let p of players) {
        let buzz = document.createElement("div");
        buzz.className = "buzz-name";
        buzz.innerHTML = p.username;
        buzzers.appendChild(buzz);
    }
}

function resetBuzzers() {
    let buzzers = document.getElementById("buzzers");
    while (buzzers.lastElementChild && buzzers.lastElementChild.className.includes("buzz-name"))
        buzzers.removeChild(buzzers.lastElementChild);
    let buzzer = document.getElementsByClassName("buzzer")[0];
    if (buzzer) {
        buzzer.classList.remove("buzzed");
        buzzer.classList.remove("locked");
        buzzer.innerHTML = "BUZZ";
    }
    unlockBuzzer();
}

function lockBuzzer() {
    let state = document.getElementsByClassName("buzzer-state")[0];
    state.innerHTML = "Fermé";
    state.classList.remove("unlocked");
    state.classList.add("locked");
    let buzzer = document.getElementsByClassName("buzzer")[0];
    if (buzzer) {
        buzzer.classList.add("locked");
        buzzer.innerHTML = "🔒";
    }
    let options = document.getElementsByClassName("options")[0];
    if (options) {
        options.lastElementChild.innerHTML = "Débloquer";
    }
}

function unlockBuzzer() {
    let state = document.getElementsByClassName("buzzer-state")[0];
    state.innerHTML = "Ouvert";
    state.classList.add("unlocked");
    state.classList.remove("locked");
    let buzzer = document.getElementsByClassName("buzzer")[0];
    if (buzzer) {
        buzzer.classList.remove("locked");
        buzzer.innerHTML = "BUZZ";
    }
    let options = document.getElementsByClassName("options")[0];
    if (options) {
        options.lastElementChild.innerHTML = "Bloquer";
    }
}






socket.on("question-change", (n) => {
    currentQuestion = n;
    document.getElementById("music-player").pause();
    document.getElementById("image-displayer").style.visibility = "hidden";
    if (grilleQuestions[currentQuestion].image == undefined) {
        document.getElementById("question").innerHTML = currentQuestion < grilleQuestions.length ? grilleQuestions[currentQuestion].text : "Plus de questions !";
        document.getElementById("question").innerHTML = document.getElementById("question").innerHTML.replace("?&lt;br/&gt;", "<br/>");
    } else {
        document.getElementById("question").innerHTML = "";
        document.getElementById("image-display").src = grilleQuestions[currentQuestion].image;
        document.getElementById("image-displayer").style.visibility = "visible";
    }
});

socket.on("dom-grid-change", (dom) => {
    document.getElementById("grille").innerHTML = dom;
});

socket.on("score-change", (scores) => {
    for (let i = 1; i <= 3; i++)
        document.getElementById("score" + i).innerHTML = scores[i - 1];
});

socket.on("show-def", (def) => {
    document.getElementById("question").innerHTML = def;
});

socket.on("toggle-slam", (slam, n) => {
    if (slam) {
        document.body.classList.add("slam-bg");
        document.getElementById("name" + (n + 1).toString()).parentElement.style.background = "#f00";
    } else {
        document.body.classList.remove("slam-bg");
        for (let i = 1; i <= 3; i++)
            document.getElementById("name" + (n + 1).toString()).parentElement.style.removeProperty("background");
    }
});

socket.on("game-end", (r) => {
    let scores = [];
    for (let s of r.scores)
        if (s != "")
            scores.push(parseInt(s));
    let winner = candidats[scores.indexOf(Math.max.apply(null, scores))];
    let loser = candidats[scores.indexOf(Math.min.apply(null, scores))];
    let winDiv = document.createElement("div");
    winDiv.className = "end-display";
    document.body.appendChild(winDiv);
    let w = document.createElement("div");
    w.id = "winner";
    w.innerHTML = winner + " l'emporte !";
    winDiv.appendChild(w);
    let l = document.createElement("div");
    l.id = "loser";
    l.innerHTML = loser + " est éliminé.";
    winDiv.appendChild(l);

    setTimeout(() => {
        winDiv.style.opacity = 1;
    }, 3000);
    setTimeout(() => {
        winDiv.style.removeProperty("opacity");
    }, 8000);
});

socket.on("play-audio", () => {
    let audio = document.getElementById("music-player");
    if (audio.src != grilleQuestions[currentQuestion].audio)
        audio.src = grilleQuestions[currentQuestion].audio;
    audio.play();
});

socket.on("pause-audio", () => {
    document.getElementById("music-player").pause();
});

socket.on("image-show", () => {
    document.getElementById("image-displayer").style.visibility = "visible";
    document.getElementById("image-display").src = grilleQuestions[currentQuestion].image;
    document.getElementById("question").innerHTML = "";
});

socket.on("image-hide", () => {
    document.getElementById("image-displayer").style.visibility = "hidden";
    document.getElementById("question").innerHTML = currentQuestion < grilleQuestions.length ? grilleQuestions[currentQuestion].text : "Plus de questions !";
    document.getElementById("question").innerHTML = document.getElementById("question").innerHTML.replace("?&lt;br/&gt;", "<br/>");
});







var grid = JSON.parse(document.getElementById("grid-data").innerHTML);
var grilleMots = grid.mots;
var grilleQuestions = grid.questions;
var candidats = [];


const nCol = 9;
const nRow = 8;
var domGrille = [];
var currentQuestion = -1;
var currentDef = -1;
var currentCandidate = -1;
var slam = false;
var resetTO = undefined;

function Word(name, x, y, vert, def) {
    this.word = name;
    this.x = x;
    this.y = y;
    this.vert = vert;
    this.def = def;
    this.found = false;
}

function Question(text, letter, audio, image) {
    this.text = text;
    this.letter = letter;
    this.audio = audio;
    this.image = image;
}

document.addEventListener('DOMContentLoaded', init);

function init() {
    fillGridDiv();
    showCandidates();
    peekaboo();
}

function fillGridDiv() {
    let grille = document.getElementById("grille");
    for (let i = -1; i <= nRow; i++) {
        domGrille.push([]);
        for (let j = -1; j <= nCol; j++) {
            let cell = document.createElement('div');
            grille.appendChild(cell);
            domGrille[i+1].push(cell);
        }
    }
    let cell;
    for (let word of grilleMots) {
        cell = domGrille[word.y + !word.vert][word.x + word.vert];
        cell.classList.add("number-cell");
        if (cell.innerHTML === "") {
            cell.innerHTML = (grilleMots.findIndex(e => e === word) + 1).toString();
        } else {
            alternateLabel(parseInt(cell.innerHTML), grilleMots.findIndex(e => e === word) + 1, cell);
        }

        let w = word.word;
        for (let i = 0; i < w.length; i++) {
            cell = domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
            cell.classList.add("used-cell");
            cell.innerHTML = w[i];
        }
    }
}

function alternateLabel(n1, n2, cell) {
    let n = parseInt(cell.innerHTML) === n1 ? n2 : n1;
    cell.innerHTML = n.toString();
    setTimeout(() => alternateLabel(n1, n2, cell), 1500);
}

function showCandidates() {
    for (let i = 0; i < candidats.length; i++) {
        let ind = (i + 1).toString();
        document.getElementById("name" + ind).innerHTML = candidats[i];
        document.getElementById("score" + ind).innerHTML = "0";
    }
}

function peekaboo() {
    setTimeout(() => {
        document.getElementById("marguerite").classList.add("peekaboo");
        setTimeout(() => document.getElementById("marguerite").classList.remove("peekaboo"), 3000);
        peekaboo();
    }, 90000 + Math.floor(Math.random() * 120000));
}