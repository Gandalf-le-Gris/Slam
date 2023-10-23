const socket = io();
const room = document.getElementById("room").innerHTML;

var player = {
    host: true,
    roomId: parseInt(room),
    username: "",
    socketId: socket.id,
    ping:0
};

var id = socket.id;

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

socket.on("reconnect", () => {
    socket.emit('user-reconnect', id);
    console.log("reconnected");
});





socket.on("get-grid", (r) => {
    let g = JSON.parse(r.grid);
    if (!g.finale) {
        grid = g;
        grilleMots = grid.mots;
        fillGridDiv();
        grilleQuestions = grid.questions;
        prepareDefinitionsTooltip();
    } else {
        grid1.mots = g.grilles[0];
        grid2.mots = g.grilles[1];
        theme1 = g.themes[0];
        theme2 = g.themes[1];
        finalLetters = g.lettres;
        toggleFinal();
        fillFinalGridDiv();
        finale = true;
    }

    window.onkeydown = (e) => {
        if (e) {
            switch (e.keyCode) {
                case 76: // L
                    toggleLockAction();
                    break;
                case 78: // N
                    nextQuestion();
                    break;
                case 80: // P
                    let question = grilleQuestions[currentQuestion];
                    if (question) {
                        if (question.image)
                            toggleImage();
                        else if (question.audio)
                            toggleAudio();
                    }
                    break;
                case 82: // R
                    resetBuzzersAction();
                    break;
                case 83: // S
                    stopSound();
                    break;
                default:
            }
        }
    }
});

socket.on("unlock-buzz",()=>{
    unlockBuzzer();
});

socket.on("lock-buzz",()=>{
    lockBuzzer();
});

socket.on("unlock-slam",()=>{
    openSlam();
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
    if (options && options.children[1].innerHTML == "Bloquer") {
        socket.emit("lock-buzz");
    } else if (options && options.children[1].innerHTML != "Bloquer") {
        socket.emit("unlock-buzz");
    }
}

function toggleSlamBuzzer() {
    let state = document.getElementsByClassName("buzzer-state")[0];
    if (state) {
        if (state.classList.contains("slam-open"))
            socket.emit("lock-buzz");
        else
            socket.emit("open-slam");
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
        buzzer.classList.remove("slam-open");
        buzzer.innerHTML = "BUZZ";
    }
    unlockBuzzer();
}

function lockBuzzer() {
    let state = document.getElementsByClassName("buzzer-state")[0];
    state.innerHTML = "Fermé";
    state.classList.remove("unlocked");
    state.classList.remove("slam-open");
    state.classList.add("locked");
    let buzzer = document.getElementsByClassName("buzzer")[0];
    if (buzzer) {
        buzzer.classList.add("locked");
        buzzer.classList.remove("slam-open");
        buzzer.innerHTML = "🔒";
    }
    let options = document.getElementsByClassName("options")[0];
    if (options) {
        options.children[1].innerHTML = "Débloquer";
    }
}

function unlockBuzzer() {
    let state = document.getElementsByClassName("buzzer-state")[0];
    state.innerHTML = "Ouvert";
    state.classList.add("unlocked");
    state.classList.remove("slam-open");
    state.classList.remove("locked");
    let buzzer = document.getElementsByClassName("buzzer")[0];
    if (buzzer) {
        buzzer.classList.remove("locked");
        buzzer.classList.remove("slam-open");
        buzzer.innerHTML = "BUZZ";
    }
    let options = document.getElementsByClassName("options")[0];
    if (options) {
        options.children[1].innerHTML = "Bloquer";
    }
}

function openSlam() {
    let state = document.getElementsByClassName("buzzer-state")[0];
    state.innerHTML = "Slam ouvert";
    state.classList.remove("unlocked");
    state.classList.add("slam-open");
    state.classList.remove("locked");
    let buzzer = document.getElementsByClassName("buzzer")[0];
    if (buzzer) {
        buzzer.classList.remove("locked");
        buzzer.classList.add("slam-open");
        buzzer.innerHTML = "SLAM";
    }
    let options = document.getElementsByClassName("options")[0];
    if (options) {
        options.children[1].innerHTML = "Bloquer";
    }
}







var grid;
var grid1 = {mots: []};
var grid2 = {mots: []};
var grilleMots;
var grilleQuestions;
var candidats = [];
var finale = false;


var nCol = 9;
var nRow = 8;
var domGrille = [];
var domGrille1 = [];
var domGrille2 = [];
var theme1;
var theme2;
var finalLetters = [];
var currentQuestion = -1;
var currentDef = -1;
var currentCandidate = -1;
var currentGrid = -1;
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
    let points = 0;
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
        points += w.length;
    }
    
    document.getElementById("slam-button").innerHTML = "Slam <font size='3'>(" + points + " points)</font>";
    socket.emit("dom-grid-change", document.getElementById("grille").innerHTML, 0);
}

function fillFinalGridDiv() {
    let grille = document.getElementById("grille1");
    for (let i = -1; i <= nRow; i++) {
        domGrille1.push([]);
        for (let j = -1; j <= nCol; j++) {
            let cell = document.createElement('div');
            grille.appendChild(cell);
            domGrille1[i+1].push(cell);
        }
    }
    let cell;
    for (let word of grid1.mots) {
        cell = domGrille1[word.y + !word.vert][word.x + word.vert];
        cell.classList.add("number-cell");
        if (cell.innerHTML === "") {
            cell.innerHTML = (grid1.mots.findIndex(e => e === word) + 1).toString();
            cell.onclick = () => { displayDefinition(grid1.mots.findIndex(e => e === word), 1); };
        } else {
            alternateLabel(parseInt(cell.innerHTML), grid1.mots.findIndex(e => e === word) + 1, cell);
        }

        let w = word.word;
        for (let i = 0; i < w.length; i++) {
            cell = domGrille1[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
            cell.classList.add("used-cell");
            cell.innerHTML = w[i];
        }
    }
    socket.emit("dom-grid-change", document.getElementById("grille1").innerHTML, 1);
  
    grille = document.getElementById("grille2");
    for (let i = -1; i <= nRow; i++) {
        domGrille2.push([]);
        for (let j = -1; j <= nCol; j++) {
            let cell = document.createElement('div');
            grille.appendChild(cell);
            domGrille2[i+1].push(cell);
        }
    }
    for (let word of grid2.mots) {
        cell = domGrille2[word.y + !word.vert][word.x + word.vert];
        cell.classList.add("number-cell");
        if (cell.innerHTML === "") {
            cell.innerHTML = (grid2.mots.findIndex(e => e === word) + 1).toString();
            cell.onclick = () => { displayDefinition(grid2.mots.findIndex(e => e === word), 2); };
        } else {
            alternateLabel(parseInt(cell.innerHTML), grid2.mots.findIndex(e => e === word) + 1, cell);
        }

        let w = word.word;
        for (let i = 0; i < w.length; i++) {
            cell = domGrille2[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
            cell.classList.add("used-cell");
            cell.innerHTML = w[i];
        }
    }
    socket.emit("dom-grid-change", document.getElementById("grille2").innerHTML, 2);
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
    do
        currentQuestion++;
    while (currentQuestion < grilleQuestions.length && !isValidQuestion(currentQuestion))
        
    
    let nLetters = 0;
    if (currentQuestion < grilleQuestions.length)
        for (let i = 0; i < domGrille.length; i++)
            for (let j = 0; j < domGrille[0].length; j++)
                if (domGrille[i][j].innerHTML === grilleQuestions[currentQuestion].letter && !domGrille[i][j].className.includes("found"))
                    nLetters++;

    let cell;
    for (let word of grilleMots) {
        cell = domGrille[word.y + !word.vert][word.x + word.vert];
        cell.classList.add("number-cell");
    }

    var question = grilleQuestions[currentQuestion];
    document.getElementById("question").innerHTML = currentQuestion < grilleQuestions.length ? question.text + " (" + question.letter.toUpperCase() + " ×" + nLetters + ")" : "Plus de questions !";
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

function isValidQuestion(n) {
    let nLetters = 0;
    if (n < grilleQuestions.length)
        for (let i = 0; i < domGrille.length; i++)
            for (let j = 0; j < domGrille[0].length; j++)
                if (domGrille[i][j].innerHTML === grilleQuestions[n].letter && !domGrille[i][j].className.includes("found"))
                    nLetters++;
    if (nLetters == 0)
        return false;

    for (let word of grilleMots) {
        for (let i = 0; i < word.word.length; i++) {
            if (domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)].innerHTML === grilleQuestions[n].letter
            && !domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)].className.includes("found")) {
                let completeWord = true;
                for (let j = 0; j < word.word.length; j++) {
                    completeWord = completeWord && (domGrille[word.y + 1 + j * word.vert][word.x + 1 + j * (!word.vert)].innerHTML === grilleQuestions[n].letter
                        || domGrille[word.y + 1 + j * word.vert][word.x + 1 + j * (!word.vert)].className.includes("found"));
                }
                if (!completeWord)
                    return true;
            }
        }
    }
    return false;
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
      let nLetters = 0;
      for (let i = 0; i < domGrille.length; i++)
          for (let j = 0; j < domGrille[0].length; j++)
              if (domGrille[i][j].innerHTML === grilleQuestions[currentQuestion].letter && !domGrille[i][j].className.includes("found"))
                  nLetters++;
      
        play.src = "/res/show.png";
        box.style.visibility = "hidden";
        document.getElementById("question").innerHTML = grilleQuestions[currentQuestion].text  + " (" + grilleQuestions[currentQuestion].letter.toUpperCase() + " ×" + nLetters + ")";
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
                    if (found) {
                        word.autofound = true
                        document.getElementById("score" + ind).innerHTML = (parseInt(document.getElementById("score" + ind).innerHTML) + word.word.length).toString();
                    } else if (word.word.includes(grilleQuestions[currentQuestion].letter)) {
                        cell = domGrille[word.y + !word.vert][word.x + word.vert];
                        cell.classList.add("number-cell");
                    }
                }
            }

            playSound("../res/correct.mp3");
            updateGrid();
            updateScores();
            prepareDefinitionsTooltip();
        } else
            alert("Choisis d'abord un candidat !");
    }
}

function updateGrid(n) {
    socket.emit("dom-grid-change", !n ? document.getElementById("grille").innerHTML : (n == 1 ? document.getElementById("grille1").innerHTML : document.getElementById("grille2").innerHTML), n);
}

function updateScores(end) {
    let scores = [];
    for (let i = 1; i <= 3; i++)
        scores.push(document.getElementById("score" + i).innerHTML);
    socket.emit("score-change", scores, end);
}

function displayDefinition(n, g) {
    if (currentCandidate >= 0 || finale) {
        let grille;
        if (g)
            grille = g == 1 ? grid1 : grid2;
        if ((grille && !grille.mots[n].found) || !grilleMots[n].found) {
            currentDef = n;
            let word = g ? (g == 1 ? grid1.mots[n] : grid2.mots[n]) : grilleMots[n];
            document.getElementById("questions").style.visibility = "hidden";
            document.getElementById("confirmAnswer").style.visibility = "hidden";
            document.getElementById("definitions").style.visibility = "visible";
            document.getElementById("wrongAnswer").style.visibility = "visible";
            document.getElementById("definition").innerHTML = (word.def ? word.def : "") + " (" + word.word + ")";

            let cell;
            let dom = g ? (g == 1 ? domGrille1 : domGrille2) : domGrille;
            for (let i = 0; i < word.word.length; i++) {
                cell = dom[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
                cell.classList.add("tried-cell");
                cell.classList.add("focused-cell");
            }

            if (!slam && word.def) {
                playSound("../res/reflexion.mp3");
                resetTO = setTimeout(() => {
                    playSound("../res/buzz.mp3");
                    switchToQuestions();
                }, 12000);
            }
            
            updateGrid();
            socket.emit("show-def", slam || !word.def ? "" : word.def);
        }
    } else
        alert("Choisis d'abord un candidat !");
}

function switchToQuestions(end) {
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
    let mots = currentGrid > 0 ? (currentGrid == 1 ? grid1.mots : grid2.mots) : grilleMots;
    let dom = currentGrid > 0 ? (currentGrid == 1 ? domGrille1 : domGrille2) : domGrille;
    let word = mots[currentDef];
    for (let i = 0; i < word.word.length; i++) {
        cell = dom[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
        cell.classList.remove("focused-cell");
    }
    for (let word of mots) {
        cell = dom[word.y + !word.vert][word.x + word.vert];
        cell.classList.add("number-cell");
    }
    currentDef = -1;

    socket.emit("question-change", currentQuestion);
    if (!finale) {
      updateScores(end);
      updateGrid();
    } else if (currentGrid > 0) {
      updateGrid(currentGrid);
    }
}

function confirmWord() {
    if (!finale) {
        let cell;
        let word = grilleMots[currentDef];
        for (let i = 0; i < word.word.length; i++) {
            cell = domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
            cell.classList.add("found-cell");
        }
        word.found = true;

        let ind = (currentCandidate + 1).toString();
        let points = 0;
        for (let word of grilleMots) {
            if (!word.found) {
                points += word.word.length;
                let found = true;
                for (let i = 0; i < word.word.length; i++) {
                    if (!domGrille[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)].className.includes("found"))
                        found = false;
                }
                word.found = found;
                if (found)
                    word.autofound = true
                if (found && !slam)
                    document.getElementById("score" + ind).innerHTML = (parseInt(document.getElementById("score" + ind).innerHTML) + word.word.length).toString();
            }
        }
        if (!slam)
            document.getElementById("slam-button").innerHTML = "Slam <font size='3'>(" + points + " points)</font>";

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

        if (end) {
            if (!slam)
                playSound("../res/complet.mp3");
            else
                playSound("../res/correct.mp3");
        } else {
            playSound("../res/correct.mp3");
        }
  
        clearTimeout(resetTO);

        prepareDefinitionsTooltip();
        switchToQuestions(end);
    } else {
        let cell;
        let word = (currentGrid == 1 ? grid1.mots : grid2.mots)[currentDef];
        for (let i = 0; i < word.word.length; i++) {
            cell = (currentGrid == 1 ? domGrille1 : domGrille2)[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)];
            cell.classList.add("found-cell");
        }
        word.found = true;
      
        for (let word of (currentGrid == 1 ? grid1.mots : grid2.mots)) {
            if (!word.found) {
                let found = true;
                for (let i = 0; i < word.word.length; i++) {
                    if (!(currentGrid == 1 ? domGrille1 : domGrille2)[word.y + 1 + i * word.vert][word.x + 1 + i * (!word.vert)].className.includes("found"))
                        found = false;
                }
                word.found = found;
            }
        }

        let end = true;
        for (let word of (currentGrid == 1 ? grid1.mots : grid2.mots))
            if (!word.found)
                end = false;
      
        switchToQuestions();
      
        if (end)
            selectTheme(currentGrid);
    }
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
            playSound("../res/rate.mp3");
            switchToQuestions();
        } else {
            stopSound();
            switchToQuestions();
            clearTimeout(resetTO);
        }
    }
}

function toggleFinal() {
  nCol++;
  nRow++;
  document.getElementsByClassName("candidates")[0].style.display = "none";
  document.getElementById("buzzers").style.display = "none";
  document.getElementById("questions").style.display = "none";
  document.getElementById("confirmAnswer").style.display = "none";
  document.getElementById("grille").style.display = "none";
  document.getElementById("marguerite").style.display = "none";
  document.getElementById("finale-grids").style.removeProperty("display");
  document.getElementById("themes").style.removeProperty("display");
  document.getElementById("time").style.removeProperty("display");
  document.getElementById("letters").style.removeProperty("display");
  document.getElementById("theme1").innerHTML = theme1;
  document.getElementById("theme2").innerHTML = theme2;
  initLetters();
}

function initLetters() {
  let lettersDiv = document.getElementById("letters");
  for (let l of finalLetters) {
    let cell = document.createElement('div');
    cell.className = "text-area";
    cell.innerHTML = l.toUpperCase();
    cell.onclick = () => selectLetter(l);
    lettersDiv.appendChild(cell);
    cell.style.setProperty("pointer-events", "all");
  }
}

let selectedLetters = 0;

function selectLetter(l) {
  for (let grid of [grid1, grid2]) {
    for (let word of grid.mots) {
      let cell;
      for (let i = 0; i < word.word.length; i++) {
        cell = (grid === grid1 ? domGrille1 : domGrille2)[word.y + 1 + i * word.vert][word.x + 1 + i * !word.vert];
        if (cell.innerHTML === l)
          cell.classList.add("found-cell");
      }
    }

    for (let word of grid.mots) {
      if (!word.found) {
        let found = true;
        for (let i = 0; i < word.word.length; i++) {
          if (
            !(grid === grid1 ? domGrille1 : domGrille2)[word.y + 1 + i * word.vert][
              word.x + 1 + i * !word.vert
            ].className.includes("found")
          )
            found = false;
        }
        word.found = found;
      }
    }
  }
  
  for (let letter of document.getElementById("letters").children)
    if (letter.innerHTML == l) {
      letter.style.opacity = .5;
      letter.style.setProperty("pointer-events", "none");
    }
  
  updateGrid(1);
  updateGrid(2);
  
  selectedLetters++;
  if (selectedLetters == 7) {
    document.getElementById("letters").style.setProperty("display", "none");
    document.getElementById("theme1").style.setProperty("pointer-events", "all");
    document.getElementById("theme2").style.setProperty("pointer-events", "all");
  }
}

function selectTheme(n) {
  if (n == 1 && currentGrid != 1) {
    document.getElementById("grille1").style.setProperty("opacity", "1");
    document.getElementById("grille1").style.setProperty("pointer-events", "all");
    document.getElementById("theme1").style.setProperty("opacity", "1");
    document.getElementById("theme1").style.setProperty("pointer-events", "all");
    document.getElementById("grille2").style.setProperty("opacity", ".5");
    document.getElementById("grille2").style.setProperty("pointer-events", "none");
    document.getElementById("theme2").style.setProperty("opacity", ".5");
    document.getElementById("theme2").style.setProperty("pointer-events", "none");
    currentGrid = n;
    startGrid(1);
  } else if (n == 2 && currentGrid != 2) {
    document.getElementById("grille2").style.setProperty("opacity", "1");
    document.getElementById("grille2").style.setProperty("pointer-events", "all");
    document.getElementById("theme2").style.setProperty("opacity", "1");
    document.getElementById("theme2").style.setProperty("pointer-events", "all");
    document.getElementById("grille1").style.setProperty("opacity", ".5");
    document.getElementById("grille1").style.setProperty("pointer-events", "none");
    document.getElementById("theme1").style.setProperty("opacity", ".5");
    document.getElementById("theme1").style.setProperty("pointer-events", "none");
    currentGrid = n;
    startGrid(2);
  } else if (n == currentGrid) {
    document.getElementById("grille1").style.setProperty("opacity", "1");
    document.getElementById("grille1").style.setProperty("pointer-events", "all");
    document.getElementById("theme1").style.setProperty("opacity", "1");
    document.getElementById("theme1").style.setProperty("pointer-events", "all");
    document.getElementById("grille2").style.setProperty("opacity", "1");
    document.getElementById("grille2").style.setProperty("pointer-events", "all");
    document.getElementById("theme2").style.setProperty("opacity", "1");
    document.getElementById("theme2").style.setProperty("pointer-events", "all");
    currentGrid = -1;
    stopTimer();
  }
}

let timerTO;

function decreaseTimer() {
  let timer = document.getElementById("time");
  let time = parseInt(timer.innerHTML);
  if (time > 0)
    time--;
  timer.innerHTML = time;
  if (time > 0)
    timerTO = setTimeout(decreaseTimer, 1000);
  else
    document.getElementById("buzz").play();
}

function startGrid(n) {
  socket.emit("start-grid", n);
  timerTO = setTimeout(decreaseTimer, 1000);
}

function stopTimer() {
  socket.emit("stop-timer", document.getElementById("time").innerHTML);
  clearTimeout(timerTO);
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
    l.innerHTML = loser + " est éliminé(e).";
    winDiv.appendChild(l);

    setTimeout(() => {
        winDiv.style.opacity = 1;
    }, 3000);
    setTimeout(() => {
        winDiv.style.removeProperty("opacity");
    }, 8000);
});





function playSound(src) {
    let audio = document.getElementById("soundboard-player");
    audio.src = src;
    audio.play();
    socket.emit("soundboard-send", src);
}

function stopSound() {
    document.getElementById("soundboard-player").pause();
    socket.emit("stop-soundboard");
}

function openSoundboard() {
    document.getElementById("open-soundboard").style.display = "none";
    document.getElementById("soundboard-content").style.removeProperty("display");
}

function closeSoundboard() {
    document.getElementById("open-soundboard").style.removeProperty("display");
    document.getElementById("soundboard-content").style.display = "none";
}




function openDefinitions() {
    document.getElementById("open-defs").style.display = "none";
    document.getElementById("defs-content").style.removeProperty("display");
}

function closeDefinitions() {
    document.getElementById("open-defs").style.removeProperty("display");
    document.getElementById("defs-content").style.display = "none";
}

function prepareDefinitionsTooltip() {
    let defs = document.getElementById("defs");
    defs.style.removeProperty("display");
    let list = defs.children[1];
    list.innerHTML = "";
    let i = 0;
    for (let q of grilleQuestions) {
        let d = document.createElement('div');
        d.innerHTML = q.letter.toUpperCase() + " " + q.text;
        list.appendChild(d);
        if (!isValidQuestion(i))
            d.style.opacity = ".5";
        i++;
    }
    list.appendChild(document.createElement('h1'));
    i = 0;
    for (let q of grilleMots) {
        i++;
        let d = document.createElement('div');
        d.innerHTML = i + ". " + q.word.toUpperCase() + " : " + q.def;
        list.appendChild(d);
        if (q.found)
            d.style.opacity = ".5";
        if (q.autofound)
            d.style.fontStyle = "italic";
    }
}




function copyRoomId(div) {
    navigator.clipboard.writeText(room.id).then(() => {
        div.innerHTML = "Copié !";
        setTimeout(() => div.innerHTML = room.id, 2000);
    }, () => {
        div.innerHTML = "Echec...";
        setTimeout(() => div.innerHTML = room.id, 2000);
    });
}

function goToHome() {
  let form = document.createElement("form");
  form.method = "post";
  form.action = "leave";
  document.body.appendChild(form);
  form.submit();
}