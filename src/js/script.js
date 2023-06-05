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
    document.getElementById("question").innerHTML = currentQuestion < grilleQuestions.length ? grilleQuestions[currentQuestion].text : "Plus de questions !";

    var question = grilleQuestions[currentQuestion];
    document.getElementById("question").innerHTML = currentQuestion < grilleQuestions.length ? question.text : "Plus de questions !";
    if (question !== undefined) {
        var play = document.getElementById("play-button");
        if (question.audio !== undefined) {
            document.getElementById("music-player").src = "ressources/" + question.audio;
            play.style.visibility = "visible";
            play.src = "res/play.png";
            play.onclick = () => toggleAudio();
        } else if (question.image !== undefined) {
            play.style.visibility = "visible";
            play.src = "res/hide.png";
            play.onclick = () => toggleImage();
            document.getElementById("question").innerHTML = "";
            document.getElementById("image-display").src = "ressources/" + question.image;
            document.getElementById("image-displayer").style.visibility = "visible";
        } else {
            play.style.visibility = "hidden";
            play.onclick = () => { };
        }
    }
}

function toggleAudio() {
    var player = document.getElementById("music-player");
    var play = document.getElementById("play-button");
    if (play.src.includes("res/play.png")) {
        play.src = "res/pause.png";
        player.play();
    } else {
        play.src = "res/play.png";
        player.pause();
    }
}

function toggleImage() {
    var box = document.getElementById("image-displayer");
    var play = document.getElementById("play-button");
    if (play.src.includes("res/show.png")) {
        play.src = "res/hide.png";
        box.style.visibility = "visible";
        document.getElementById("question").innerHTML = "";
    } else {
        play.src = "res/show.png";
        box.style.visibility = "hidden";
        document.getElementById("question").innerHTML = grilleQuestions[currentQuestion].text;
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
        } else
            alert("Choisis d'abord un candidat !");
    }
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

    
    /* if (end)
        cyrilChad(); */
    

    clearTimeout(resetTO);

    switchToQuestions();
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

function cyrilChad() {
    document.body.classList.remove("slam-bg");
    let cyril = document.createElement('img');
    cyril.className = "cyril";
    cyril.src = "res/cyril.png";
    document.body.appendChild(cyril);

    marguerite(0);
    fireworks(0);
}

function marguerite(n) {
    let vache = document.createElement('img');
    vache.className = "marguerite";
    vache.id = "marguerite" + n;
    vache.src = "res/marguerite.png";
    vache.style.top = (30 + Math.floor(Math.random() * 70)).toString() + "vh";
    document.body.appendChild(vache);

    setTimeout(() => marguerite(n + 1), 500 + Math.floor(Math.random() * 2000));
    setTimeout(() => document.body.removeChild(document.getElementById("marguerite" + n)), 3000);
}

function fireworks(n) {
    let gif = document.createElement('img');
    gif.className = "fireworks";
    gif.id = "fireworks" + n;
    gif.src = "res/fireworks" + Math.floor(Math.random() * 3) + ".gif";
    gif.style.top = (10 + Math.floor(Math.random() * 65)).toString() + "vh";
    gif.style.left = (10 + Math.floor(Math.random() * 75)).toString() + "vw";
    gif.style.height = (10 + Math.floor(Math.random() * 11)).toString() + "vh";
    document.body.appendChild(gif);

    setTimeout(() => fireworks(n + 1), 500 + Math.floor(Math.random() * 500));
    setTimeout(() => document.body.removeChild(document.getElementById("fireworks" + n)), 10000);
}

function peekaboo() {
    setTimeout(() => {
        document.getElementById("marguerite").classList.add("peekaboo");
        setTimeout(() => document.getElementById("marguerite").classList.remove("peekaboo"), 3000);
        peekaboo();
    }, 90000 + Math.floor(Math.random() * 120000));
}