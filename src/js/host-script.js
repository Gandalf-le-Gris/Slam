const socket = io();
io.engine.pingTimeout = 99999999;
const room = document.getElementById("room").innerHTML;

var player = {
    host: true,
    roomId: parseInt(room),
    username: "",
    socketId: socket.id,
    ping:0
};

window.onload = () => {
    socket.emit("start-host", player);
    socket.emit("request-grid");
}

socket.on("new-player", (player)=>{
    if (candidats.length < 3 && player.username != "") {
        candidats.push(player.username);
        let ind = candidats.length;
        document.getElementById("name" + ind).innerHTML = player.username;
        document.getElementById("score" + ind).innerHTML = "0";
    }
});





socket.on("get-grid", (g) => {
    grid = g;
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

function resetBuzzersAction() {
    socket.emit("clear-buzz");
}

function toggleLockAction() {
    let options = document.getElementsByClassName("options")[0];
    if (options && options.lastElementChild.innerHTML == "Bloquer") {
        socket.emit("lock-buzz");
    } else if (options && options.lastElementChild.innerHTML != "Bloquer") {
        socket.emit("unlock-buzz");
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
    while (buzzers.lastElementChild.className.includes("buzz"))
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
            cell.onclick = () => { displayDefinition(grilleMots.findIndex(e => e === word)); };
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
    cell.onclick = () => { displayDefinition(n - 1); };
    setTimeout(() => alternateLabel(n1, n2, cell), 1500);
}

function showCandidates() {
    for (let i = 0; i < candidats.length; i++) {
        let ind = (i + 1).toString();
        document.getElementById("name" + ind).innerHTML = candidats[i];
        document.getElementById("score" + ind).innerHTML = "0";
    }
}

function nextQuestion() {
    let loop = true;
    while (loop) {
        currentQuestion++;
        loop = false;
        if (currentQuestion < grilleQuestions.length) {
            loop = true;
            for (let word of grilleMots) {
                for (let i = 0; i < word.word.length; i++) {
                    if (domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)].innerHTML === grilleQuestions[currentQuestion].letter
                    && !domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)].className.includes("found")) {
                        let completeWord = true;
                        for (let j = 0; j < word.word.length; j++) {
                            completeWord = completeWord && (domGrille[word.y + 1 + j * word.vert][word.x + 1 + j * (!word.vert)].innerHTML === grilleQuestions[currentQuestion].letter
                                || domGrille[word.y + 1 + j * word.vert][word.x + 1 + j * (!word.vert)].className.includes("found"));
                        }
                        loop = loop && completeWord;
                    }
                }
            }
        }
    }
    let cell;
    for (let word of grilleMots) {
        cell = domGrille[word.y + !word.vert][word.x + word.vert];
        cell.classList.add("number-cell");
    }

    var question = grilleQuestions[currentQuestion];
    document.getElementById("question").innerHTML = currentQuestion < grilleQuestions.length ? question.text : "Plus de questions !";
    document.getElementById("question").innerHTML = document.getElementById("question").innerHTML.replace("?&lt;br/&gt;", "<br/>");
    if (question !== undefined) {
        var play = document.getElementById("play-button");
        play.style.visibility = "hidden";
        play.onclick = () => { };
        document.getElementById("music-player").pause();
        document.getElementById("image-displayer").style.visibility = "hidden";
        if (question.audio !== undefined) {
            document.getElementById("music-player").src = question.audio;
            play.style.visibility = "visible";
            play.src = "/res/play.png";
            play.onclick = () => toggleAudio();
        } else if (question.image !== undefined) {
            play.style.visibility = "visible";
            play.src = "/res/hide.png";
            play.onclick = () => toggleImage();
            document.getElementById("question").innerHTML = "";
            document.getElementById("image-display").src = question.image;
            document.getElementById("image-displayer").style.visibility = "visible";
        }
    }

    socket.emit("question-change", currentQuestion);
}

function toggleAudio() {
    var player = document.getElementById("music-player");
    var play = document.getElementById("play-button");
    if (play.src.includes("play.png")) {
        play.src = "/res/pause.png";
        player.play();
        socket.emit("play-audio");
    } else {
        play.src = "/res/play.png";
        player.pause();
        socket.emit("pause-audio");
    }
}

function toggleImage() {
    var box = document.getElementById("image-displayer");
    var play = document.getElementById("play-button");
    if (play.src.includes("show.png")) {
        play.src = "/res/hide.png";
        box.style.visibility = "visible";
        document.getElementById("question").innerHTML = "";
        socket.emit("image-show");
    } else {
        play.src = "/res/show.png";
        box.style.visibility = "hidden";
        document.getElementById("question").innerHTML = grilleQuestions[currentQuestion].text;
        document.getElementById("question").innerHTML = document.getElementById("question").innerHTML.replace("?&lt;br/&gt;", "<br/>");
        socket.emit("image-hide");
    }
}

function showAnswer() {
    if (currentQuestion >= 0 && currentQuestion < grilleQuestions.length) {
        if (currentCandidate >= 0) {
            for (let word of grilleMots) {
                let cell;
                for (let i = 0; i < word.word.length; i++) {
                    cell = domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
                    if (cell.innerHTML === grilleQuestions[currentQuestion].letter)
                        cell.classList.add("found-cell");
                }
            }

            let cell;
            for (let word of grilleMots) {
                cell = domGrille[word.y + !word.vert][word.x + word.vert];
                cell.classList.remove("number-cell");
            }

            let ind = (currentCandidate + 1).toString();
            for (let word of grilleMots) {
                if (!word.found) {
                    let found = true;
                    for (let i = 0; i < word.word.length; i++) {
                        if (!domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)].className.includes("found"))
                            found = false;
                    }
                    word.found = found;
                    if (found)
                        document.getElementById("score" + ind).innerHTML = (parseInt(document.getElementById("score" + ind).innerHTML) + word.word.length).toString();
                    else if (word.word.includes(grilleQuestions[currentQuestion].letter)) {
                        cell = domGrille[word.y + !word.vert][word.x + word.vert];
                        cell.classList.add("number-cell");
                    }
                }
            }

            updateGrid();
            updateScores();
        } else
            alert("Choisis d'abord un candidat !");
    }
}

function updateGrid() {
    socket.emit("dom-grid-change", document.getElementById("grille").innerHTML);
}

function updateScores() {
    let scores = [];
    for (let i = 1; i <= 3; i++)
        scores.push(document.getElementById("score" + i).innerHTML);
    socket.emit("score-change", scores);
}

function displayDefinition(n) {
    if (currentCandidate >= 0) {
        if (!grilleMots[n].found) {
            currentDef = n;
            let word = grilleMots[n];
            document.getElementById("questions").style.visibility = "hidden";
            document.getElementById("confirmAnswer").style.visibility = "hidden";
            document.getElementById("definitions").style.visibility = "visible";
            document.getElementById("wrongAnswer").style.visibility = "visible";
            document.getElementById("definition").innerHTML = slam ? "" : word.def;

            let cell;
            for (let i = 0; i < word.word.length; i++) {
                cell = domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
                cell.classList.add("tried-cell");
                cell.classList.add("focused-cell");
            }

            if (!slam)
                resetTO = setTimeout(() => {
                    document.getElementById("buzz").play();
                    switchToQuestions();
                }, 12000);
            
            updateGrid();
            socket.emit("show-def", slam ? "" : word.def);
        }
    } else
        alert("Choisis d'abord un candidat !");
}

function switchToQuestions() {
    if (!slam) {
        document.getElementById("questions").style.visibility = "visible";
        document.getElementById("confirmAnswer").style.visibility = "visible";
        document.getElementById("definitions").style.visibility = "hidden";
        document.getElementById("wrongAnswer").style.visibility = "hidden";

        document.getElementById("candidate1").classList.remove("selected");
        document.getElementById("candidate2").classList.remove("selected");
        document.getElementById("candidate3").classList.remove("selected");
    } else {
        document.getElementById("questions").style.visibility = "hidden";
        document.getElementById("confirmAnswer").style.visibility = "hidden";
        document.getElementById("definitions").style.visibility = "hidden";
        document.getElementById("wrongAnswer").style.visibility = "hidden";
    }

    let cell;
    let word = grilleMots[currentDef];
    for (let i = 0; i < word.word.length; i++) {
        cell = domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
        cell.classList.remove("focused-cell");
    }
    for (let word of grilleMots) {
        cell = domGrille[word.y + !word.vert][word.x + word.vert];
        cell.classList.add("number-cell");
    }
    currentDef = -1;

    socket.emit("question-change", currentQuestion);
    updateGrid();
    updateScores();
}

function confirmWord() {
    let cell;
    let word = grilleMots[currentDef];
    for (let i = 0; i < word.word.length; i++) {
        cell = domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
        cell.classList.add("found-cell");
    }
    word.found = true;

    let ind = (currentCandidate + 1).toString();
    for (let word of grilleMots) {
        if (!word.found) {
            let found = true;
            for (let i = 0; i < word.word.length; i++) {
                if (!domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)].className.includes("found"))
                    found = false;
            }
            word.found = found;
            if (found && !slam)
                document.getElementById("score" + ind).innerHTML = (parseInt(document.getElementById("score" + ind).innerHTML) + word.word.length).toString();
        }
    }

    let end = true;
    for (let word of grilleMots)
        if (!word.found)
            end = false;

    let score = document.getElementById("score" + ind);
    if (!slam)
        score.innerHTML = (parseInt(score.innerHTML) + word.word.length).toString();
    else {
        if (end) {
            let s = 0;
            for (let word of grilleMots)
                if (word.slam)
                    s += word.word.length;
            score.innerHTML = (parseInt(score.innerHTML) + s).toString();
        }
    }

    clearTimeout(resetTO);

    switchToQuestions();

    if (end)
        socket.emit("game-end");
}

function selectCandidate(n) {
    let ind = (n + 1).toString();
    let cell = document.getElementById("candidate" + ind);
    if (cell.className.includes("selected")) {
        cell.classList.remove("selected");
        currentCandidate = -1;
    } else {
        document.getElementById("candidate1").classList.remove("selected");
        document.getElementById("candidate2").classList.remove("selected");
        document.getElementById("candidate3").classList.remove("selected");
        cell.classList.add("selected");
        currentCandidate = n;
    }
}

function toggleSlam() {
    if (currentCandidate >= 0) {
        document.getElementById("play-button").style.visibility = "hidden";
        document.getElementById("image-displayer").style.visibility = "hidden";
        document.getElementById("music-player").pause();

        slam = !slam;
        if (slam) {
            document.getElementById("questions").style.visibility = "hidden";
            document.getElementById("confirmAnswer").style.visibility = "hidden";
            document.getElementById("definitions").style.visibility = "hidden";
            document.getElementById("wrongAnswer").style.visibility = "hidden";
            document.body.classList.add("slam-bg");
            for (let word of grilleMots)
                if (!word.found)
                    word.slam = true;
            socket.emit("lock-buzz");
        } else {
            document.getElementById("questions").style.visibility = "visible";
            document.getElementById("confirmAnswer").style.visibility = "visible";
            document.getElementById("definitions").style.visibility = "hidden";
            document.getElementById("wrongAnswer").style.visibility = "hidden";
            document.getElementById("candidate1").classList.remove("selected");
            document.getElementById("candidate2").classList.remove("selected");
            document.getElementById("candidate3").classList.remove("selected");
            document.body.classList.remove("slam-bg");
            for (let i = 1; i <= nRow; i++)
                for (let j = 1; j <= nCol; j++)
                    domGrille[i][j].classList.remove("focused-cell");
            for (let word of grilleMots)
                if (word.slam)
                    word.slam = undefined;
        }

        socket.emit("toggle-slam", slam, currentCandidate);
    } else {
        alert("Choisis d'abord un candidat !");
    }
}

function wrongAnswer() {
    if (currentDef >= 0) {
        if (slam) {
            for (let word of grilleMots) {
                if (word.slam !== undefined) {
                    for (let i = 1; i <= candidats.length; i++)
                        if (i != currentCandidate + 1)
                            document.getElementById("score" + i).innerHTML = (parseInt(document.getElementById("score" + i).innerHTML) + word.word.length).toString();
                    word.slam = undefined;
                }
            }
        } else {
            switchToQuestions();
            clearTimeout(resetTO);
        }
    }
}

function peekaboo() {
    setTimeout(() => {
        document.getElementById("marguerite").classList.add("peekaboo");
        setTimeout(() => document.getElementById("marguerite").classList.remove("peekaboo"), 3000);
        peekaboo();
    }, 90000 + Math.floor(Math.random() * 120000));
}

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