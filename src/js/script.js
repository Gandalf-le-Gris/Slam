var grilleMots = [
    new Word("PENCHANT", 0, 0, true, "?"),
    new Word("DECRYPTE", 2, 0, true, "?"),
    new Word("JUDO", 4, 2, true, "?"),
    new Word("OMERTA", 5, 2, true, "?"),
    new Word("GOYAVE", 6, 0, true, "?"),
    new Word("EQUESTRE", 8, 0, true, "?"),
    new Word("PEDAGOGUE", 0, 0, false, "?"),
    new Word("JOYAU", 4, 2, false, "?"),
    new Word("CURCUMA", 0, 3, false, "?"),
    new Word("DEVIS", 4, 4, false, "?"),
    new Word("AMPHORE", 0, 5, false, "?"),
    new Word("TRENTAINE", 0, 7, false, "?")
];
var grilleQuestions = [
	new Question("Q1", 'Y'),
    new Question("Q2", 'H'),
	new Question("Q3", 'Q'),
    new Question("Q4", 'J'),
    new Question("Q5", 'M'),
	new Question("Q6", 'R'),
	new Question("Q7", 'P'),
	new Question("Q8", 'D'),
	new Question("Q9", 'U'),
    new Question("Q10", 'V'),
    new Question("Q11", 'O'),
	new Question("Q12", 'E'),
	new Question("Q13", 'G'),
    new Question("Q14", 'A'),
	new Question("Q15", 'S'),
	new Question("Q16", 'I'),
    new Question("Q17", 'C'),
	new Question("Q18", 'T'),
	new Question("Q19", 'N'),
];
var candidats = [
    "FINALISTE 1",
    "FINALISTE 2",
	"FINALISTE 3",
];

/* var grilleMots = [
    new Word("ASTRONEF", 0, 0, true, "?"),
    new Word("SINGER", 2, 2, true, "?"),
    new Word("OUED", 3, 0, true, "Encore un truc à la noix"),
    new Word("RIGIDE", 4, 2, true, "?"),
    new Word("EGAL", 5, 0, true, "?"),
    new Word("CLIENT", 6, 2, true, "?"),
    new Word("MUNSTER", 8, 1, true, "?"),
    new Word("BODEGA", 2, 0, false, "?"),
    new Word("SERAC", 2, 2, false, "?"),
    new Word("RAIDILLON", 0, 3, false, "?"),
    new Word("NEGLIGENT", 0, 5, false, "?"),
    new Word("FERMENTER", 0, 7, false, "?")
];
var grilleQuestions = [
	new Question("L'extrême gauche de l'hémicycle...", 'C'),
    new Question("Quelle lettre manque 2 fois à ce collet monté ?</br>PUIBON", 'T'),
	new Question("Quelle lettre est commune aux noms de ceux qui ont créé South Park ?", 'B'),
    new Question("Quelle est l'initiale du nom de la chanteuse que voici ?", 'F'),
    new Question("Pour Monsieur, pas de ristourne...", 'U'),
    new Question("Quelle lettre s'entoure à deux reprises des mêmes lettres pour faire du...", 'O'),
	new Question("Quelle lettre est commune aux noms de ceux qui ont créé South Park ?", 'L'),
	new Question("Quelle lettre est au centre du nom du dentifrice du célèbre sketch des Nuls ?", 'M'),
	new Question("Outre le C, quelle consonne ne retrouve pas de voisine d'alphabet dans le chauvinisme ?", 'S'),
	new Question("Quelle lettre n'est ni la moins présente, ni la plus présente quand elle est...", 'D'),
    new Question("Quelle lettre faut-il ôter ou ajouter à l'aria pour tomber sur une personne marginale ?", 'R'),
    new Question("Quelle voyelle est la seule à ne pas avoir investi dans les...", 'I'),
	new Question("Quelle lettre précède par deux fois la même lettre dans la mastication ?", 'E'),
	new Question("Quelle est la dernière lettre du dessert que l'on peut préparer avec ces lettres ?</br>B-Y-N-O-S-A-A", 'G'),
    new Question("Quelle lettre est commune aux noms de ceux qui ont créé South Park ?", 'A'),
	new Question("Quelle lettre est commune aux noms de ceux qui ont créé South Park ?", 'N'),
];
var candidats = [
    "FINALISTE 1",
    "FINALISTE 2",
];
*/

/*

Pour modifier la grille :
 
1. Pour la grille en elle-même :
Il suffit de remplacer le mot et sa définition dans chaque ligne de grilleMots, ainsi que de modifier les coordonnées et l'orientation.
Les coordonnées sont colonne en x et ligne en y, et l'orientation est true pour vertical et false pour horizontal, comme dans l'exemple suivant :
    ___________________
    |_|_|_|_|_|_|_|_|_|
    |_|_|_|_|_|D|_|_|_|
    |A|B|C|_|_|E|_|_|_|
    |_|_|_|_|_|F|_|_|_|
    |_|_|_|_|_|G|_|_|_|
    |_|_|_|_|_|_|_|_|_|
    |_|_|_|_|_|_|_|_|_|
    |_|_|_|_|_|_|_|_|_|

ABC s'exprime avec new Word("ABC", 0, 2, false, "définition de ABC").
DEFG s'exprime avec new Word("DEFG", 5, 1, true, "définition de DEFG").
Les mots de la grille s'écrivent en capitales et sans accents.
Pour mettre un retour à la ligne, on insère </br> directement dans le texte (exemple : "Intitulé :</br>ABC").
Bien noter que les premières ligne et colonne ont 0 en coordonnées.

2. Pour les questions :
On remplace l'intitulé de la question, et la lettre en réponse (toujours en capitale).
Il est possible de rajouter des lignes pour mettre plus de questions, la liste peut être de longueur quelconque.
Pour ajouter un audio associé à la question, il faut placer le fichier audio (à un format quelconque : mp3, ogg, wav, etc...) dans le dossier ressources et le rattacher à la question ainsi :
new Question("Intitulé", "A", "audio.mp3") en remplaçant audio.mp3 par le nom du fichier.
Pour ajouter une image à une question, on place similairement l'image dans le dossier ressources et on déclare la question comme suit :
new Question("Intitulé", "A", undefined, "image.png") en remplaçant image.png par le nom du fichier (ne pas retirer undefined ou ce sera traité comme un audio).

3. Pour les candidats :
Sans surprise, on remplace les noms et ça marche.



Usage de l'outil :

Une fois la page ouverte dans un navigateur quelconque, la partie commence en cliquant sur Question suivante.
Lorsque quelqu'un a correctement répondu, on le sélectionne en haut à gauche et on clique sur Afficher réponse pour mettres les lettres dans la grille.
Puis on clique sur le numéro du mot dont on veut la définition.
Au bout de 12 secondes, la définition se masque automatiquement.
Si le candidat a correctement répondu, on clique sur Confirmer réponse. Sinon, si le temps n'est pas écoulé, on clique sur Mauvaise réponse.
Si on n'a pas eu le temps de valider la réponse, on peut resélectionner le candidat et la question et cliquer sur Confirmer réponse.
Une fois la définition vue, on clique sur Question suivante pour passer à la suite.
Si un candidat veut slammer, on le sélectionne en haut à gauche et on clique sur le bouton Slam.
Le candidat peut ensuite choisir les mots qu'il veut insérer dans la grille dans l'ordre qu'il veut.

*/








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