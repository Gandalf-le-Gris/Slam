const nCol = 9;
const nRow = 8;
let domGrille = [];
let domGrille1 = [];
let domGrille2 = [];
let words = [];
let defs = [];
let quests = [];
let manche = true;





fillGridDiv();





function fillGridDiv() {
    for (let grille of [document.getElementById("grille"), document.getElementById("grille1"), document.getElementById("grille2")]) {
        let dsize = grille.id.endsWith("e") ? 0 : 1;
        let domG = grille.id.endsWith("e") ? domGrille : (grille.id === "grille1" ? domGrille1 : domGrille2);
        for (let i = -1; i <= nRow + dsize; i++) {
            domG.push([]);
            for (let j = -1; j <= nCol + dsize; j++) {
                let cell = document.createElement('input');
                cell.type = "text";
                if (i < 0 || i == nRow + dsize || j < 0 || j == nCol + dsize)
                    cell.classList.add("hidden");
                cell.onchange = () => writeCell(cell);
                cell.onkeydown = () => writeCell(cell);
                cell.addEventListener("keydown", (event) => {
                    let c = event.target || event.srcElement;
                    let pos = getGridElementsPosition(c);
                    let row = pos.row;
                    let col = pos.col;
                    let tRow = row;
                    let tCol = col;
                    let nRowL = nRow + (c.parentNode.parentNode.id.includes("1") || c.parentNode.parentNode.id.includes("2"));
                    let nColL = nCol + (c.parentNode.parentNode.id.includes("1") || c.parentNode.parentNode.id.includes("2"));
                    switch (event.key) {
                        case "ArrowUp":
                            if (row > 1)
                                tRow--;
                            break;
                        case "ArrowDown":
                            if (row < nRowL)
                                tRow++;
                            break;
                        case "ArrowLeft":
                            if (col > 1)
                                tCol--;
                            break;
                        case "ArrowRight":
                            if (col < nColL)
                                tCol++;
                            break;
                    }
                    if (row != tRow || col != tCol) {
                        for (let c2 of c.parentNode.parentNode.children) {
                            let pos2 = getGridElementsPosition(c2.children[0])
                            if (pos2.row == tRow && pos2.col == tCol) {
                                c2.children[0].focus();
                            }
                        }
                    }
                });
                cell.onpaste = () => writeCell(cell);
                cell.oninput = () => writeCell(cell);
                cell.onfocus = () => cursorToRight(cell);
                cell.pattern = "[a-zA-Z]?";
                let div = document.createElement("div");
                div.appendChild(cell);
                grille.appendChild(div);
                domG[i+1].push(cell);
            }
        }
        if (grille.id === "grille") {
            domGrille[domGrille.length - 1][domGrille[0].length - 1].parentElement.id = "points";
            domGrille[domGrille.length - 1][domGrille[0].length - 1].parentElement.setAttribute("data-number", "0");
        }
    }
}

function getGridElementsPosition(c) {
    const gridEl = c.parentNode.parentNode;
    const index = getNodeIndex(c);
    let offset = Number(window.getComputedStyle(gridEl.children[0]).gridColumnStart) - 1; 
    if (isNaN(offset))
        offset = 0;
    const colCount = window.getComputedStyle(gridEl).gridTemplateColumns.split(" ").length;
    const rowPosition = Math.floor((index + offset) / colCount);
    const colPosition = (index + offset) % colCount;
    return { row: rowPosition, col: colPosition };
}
  
function getNodeIndex(elm) {
    var c = elm.parentNode.parentNode.children, i = 0;
    for (; i < c.length; i++) if (c[i].children[0] === elm) return i;
}

function writeCell(cell) {
    if (cell.value != "") {
        cell.value = cell.value.substring(cell.value.length - 1);
        if (cell.value.match("[a-zA-Z]")) {
            cell.value = cell.value.toUpperCase();
            cell.classList.add("letter");
        } else {
            cell.value = "";
            cell.classList.remove("letter");
        }
    } else
        cell.classList.remove("letter");
    updateWords();
}

function updateWords() {
    words = [];
    for (let dom of [domGrille, domGrille1, domGrille2]) {
        let k = 0;
        for (let j = 0; j < dom[0].length - 1; j++) {
            for (let i = 0; i < dom.length - 1; i++) {
                let c = dom[i][j];
                c.parentElement.removeAttribute("data-number");

                if (!c.classList.contains("letter")) {
                    let n = 0;
                    while (n < 2 && dom[i + n + 1][j].classList.contains("letter"))
                        n++;
                    if (n > 1) {
                        k++;
                        c.parentElement.setAttribute("data-number", k);
                        if (dom == domGrille) {
                            let word = "";
                            n = 0;
                            while (i + n + 1 <= nRow && dom[i + n + 1][j].classList.contains("letter")) {
                                word += dom[i + n + 1][j].value;
                                n++;
                            }
                            words.push(word);
                            if (defs.findIndex(e => e.word == word) == -1)
                                defs.push({word: word, def: ""});
                        }
                    }
                }
            }
        }

        for (let i = 0; i < dom.length - 1; i++) {
            for (let j = 0; j < dom[0].length - 1; j++) {
                let c = dom[i][j];

                if (!c.classList.contains("letter")) {
                    let n = 0;
                    while (n < 2 && dom[i][j + n + 1].classList.contains("letter"))
                        n++;
                    if (n > 1) {
                        k++;
                        c.parentElement.setAttribute("data-number", k);
                        if (dom == domGrille) {
                            let word = "";
                            n = 0;
                            while (j + n + 1 <= nCol && domGrille[i][j + n + 1].classList.contains("letter")) {
                                word += domGrille[i][j + n + 1].value;
                                n++;
                            }
                            words.push(word);
                            if (defs.findIndex(e => e.word == word) == -1)
                                defs.push({word: word, def: ""});
                        }
                    }
                }
            }
        }
    }

    let points = 0;
    for (let w of words)
        points += w.length;
    document.getElementById("points").setAttribute("data-number", points.toString());

    updateDefinitions();
}

function updateDefinitions() {
    let definitions = document.getElementById("definitions");
    definitions.innerHTML = "";

    for (let word of words) {
        let w = document.createElement("div");
        definitions.appendChild(w);

        let name = document.createElement("div");
        name.innerHTML = word;
        w.appendChild(name);

        let def = document.createElement("input");
        def.type = "text";
        def.onchange = () => changeDefinition(def, word);
        def.onkeydown = () => changeDefinition(def, word);
        def.onpaste = () => changeDefinition(def, word);
        def.oninput = () => changeDefinition(def, word);
        let i = defs.findIndex(e => e.word == word);
        if (i > -1)
            def.value = defs[i].def;
        w.appendChild(def);
    }
}

function changeDefinition(def, word) {
    let i = defs.findIndex(e => e.word == word);
    if (i > -1) {
        defs[i].def = def.value;
    }
}

function cursorToRight(cell) {
    setTimeout(function(){ cell.selectionStart = cell.selectionEnd = 10000; }, 0);
}

function compileWords() {
    let w = [];
    for (let j = 0; j < domGrille[0].length - 1; j++) {
        for (let i = 0; i < domGrille.length - 1; i++) {
            let c = domGrille[i][j];

            if (!c.classList.contains("letter")) {
                let n = 0;
                while (n < 2 && domGrille[i + n + 1][j].classList.contains("letter"))
                    n++;
                if (n > 1) {
                    let word = "";
                    n = 0;
                    while (i + n + 1 <= nRow && domGrille[i + n + 1][j].classList.contains("letter")) {
                        word += domGrille[i + n + 1][j].value;
                        n++;
                    }
                    w.push({word: word, x: j-1, y: i, vert: true, found: false, def: defs[defs.findIndex(e => e.word == word)].def});
                }
            }
        }
    }

    for (let i = 0; i < domGrille.length - 1; i++) {
        for (let j = 0; j < domGrille[0].length - 1; j++) {
            let c = domGrille[i][j];

            if (!c.classList.contains("letter")) {
                let n = 0;
                while (n < 2 && domGrille[i][j + n + 1].classList.contains("letter"))
                    n++;
                if (n > 1) {
                    let word = "";
                    n = 0;
                    while (j + n + 1 <= nCol && domGrille[i][j + n + 1].classList.contains("letter")) {
                        word += domGrille[i][j + n + 1].value;
                        n++;
                    }
                    w.push({word: word, x: j, y: i-1, vert: false, found: false, def: defs[defs.findIndex(e => e.word == word)].def});
                }
            }
        }
    }

    return w;
}

function compileFinalWords(dom) {
    let w = [];
    for (let j = 0; j < dom[0].length - 1; j++) {
        for (let i = 0; i < dom.length - 1; i++) {
            let c = dom[i][j];

            if (!c.classList.contains("letter")) {
                let n = 0;
                while (n < 2 && dom[i + n + 1][j].classList.contains("letter"))
                    n++;
                if (n > 1) {
                    let word = "";
                    n = 0;
                    while (i + n + 1 <= nRow && dom[i + n + 1][j].classList.contains("letter")) {
                        word += dom[i + n + 1][j].value;
                        n++;
                    }
                    w.push({word: word, x: j-1, y: i, vert: true, found: false});
                }
            }
        }
    }

    for (let i = 0; i < dom.length - 1; i++) {
        for (let j = 0; j < dom[0].length - 1; j++) {
            let c = dom[i][j];

            if (!c.classList.contains("letter")) {
                let n = 0;
                while (n < 2 && dom[i][j + n + 1].classList.contains("letter"))
                    n++;
                if (n > 1) {
                    let word = "";
                    n = 0;
                    while (j + n + 1 <= nCol && dom[i][j + n + 1].classList.contains("letter")) {
                        word += dom[i][j + n + 1].value;
                        n++;
                    }
                    w.push({word: word, x: j, y: i-1, vert: false, found: false});
                }
            }
        }
    }

    return w;
}




function addQuestion() {
    let q = document.createElement("div");
    q.innerHTML = '<input type="text" class="question-letter-input" pattern="[a-zA-Z]" maxlength="1" minlength="1" value="A" onchange="updateQuestions(this)" onkeydown="updateQuestions(this)" onpaste="updateQuestions(this)" oninput="updateQuestions(this)">    <input type="text" placeholder="Question" onchange="updateQuestions()" onkeydown="updateQuestions()" onpaste="updateQuestions()" oninput="updateQuestions()">    <select onchange="updateQuestions()">        <option value="" selected></option>        <option value="Audio">Audio</option>        <option value="Image">Image</option>    </select>    <input class="attachment" type="text" placeholder="URL"  onchange="updateQuestions()" onkeydown="updateQuestions()" onpaste="updateQuestions()" oninput="updateQuestions()">    <div onclick="upQuestion(this)">        <img src="/res/up.png" alt="">    </div>    <div onclick="downQuestion(this)">        <img src="/res/down.png" alt="">    </div>    <div onclick="deleteQuestion(this)">        <img src="/res/delete.png" alt="">    </div>';
    document.getElementById("questions").appendChild(q);
    updateQuestions();
}

function deleteQuestion(e) {
    document.getElementById("questions").removeChild(e.parentElement);
}

function upQuestion(e) {
    let questions = document.getElementById("questions");
    let q = e.parentElement;
    let i = [...questions.children].findIndex(e => e === q);
    if (i > 0)
        questions.insertBefore(q, questions.children[i - 1]);
}

function downQuestion(e) {
    let questions = document.getElementById("questions");
    let q = e.parentElement;
    let i = [...questions.children].findIndex(e => e === q);
    if (i < questions.children.length - 1)
        questions.insertBefore(questions.children[i + 1], q);
}

function updateQuestions(input) {
    if (input && input.value != "") {
        if (input.value.match("[a-zA-Z]"))
            input.value = input.value.toUpperCase();
        else
            input.value = "";
    }

    let inputs = document.getElementsByClassName("question-letter-input");
    let letters = [];
    for (let i of inputs) {
        if (!letters.includes(i.value)) {
            letters.push(i.value);
            i.style.removeProperty("color");
        } else {
            i.style.color = "red";
        }
    }

    quests = [];
    let questions = document.getElementById("questions");
    for (let q of questions.children) {
        let quest = {
            letter: q.firstElementChild.value,
            text: q.children[1].value,
        };
        if (q.children[2].value == "Audio")
            quest.audio = q.children[3].value;
        else if (q.children[2].value == "Image")
            quest.image = q.children[3].value;
        quests.push(quest);
    }
}

function adjustLetterCase(input) {
    if (input && input.value != "") {
        input.value = input.value.substring(input.value.length - 1);
        if (input.value.match("[a-zA-Z]"))
            input.value = input.value.toUpperCase();
        else
            input.value = "";
    }

    let possibleLetters = Array.from(document.getElementsByClassName("possible-letter"));
    for (cell of possibleLetters) {
        if (possibleLetters.findIndex(e => e !== cell && e.value === cell.value) > -1)
            cell.style.color = "red";
        else
            cell.style.removeProperty("color");
    }
}

function compileJSON() {
    return {mots: compileWords(), questions: quests};
}

function compileJSONFinale() {
    let res = {finale: true, grilles: [compileFinalWords(domGrille1), compileFinalWords(domGrille2)], themes: [], lettres: []};
    for (let theme of document.getElementById("finale-themes").children)
        res.themes.push(theme.value);
    for (let letter of document.getElementById("finale-letters").children)
        res.lettres.push(letter.value);
    return res;
}

function saveJSON() {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compileJSON()));
    let dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "grille.json");
    dlAnchorElem.click();

    let form = document.createElement("form");
    form.method = "post";
    form.action = "save-json";
    document.body.appendChild(form);
    form.submit();
}

function saveJSONFinale() {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compileJSONFinale()));
    let dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "grille.json");
    dlAnchorElem.click();

    let form = document.createElement("form");
    form.method = "post";
    form.action = "save-json";
    document.body.appendChild(form);
    form.submit();
}

function utfifiy(str) {
    str = str.replace('é', '\\u00e9;');
    str = str.replace('è', '\\u00e8');
    str = str.replace('ê', '\\u00ea');
    str = str.replace('ë', '\\u00eb');
    str = str.replace('É', '\\u00c9');
    str = str.replace('È', '\\u00c8');
    str = str.replace('Ê', '\\u00ca');
    str = str.replace('Ë', '\\u00cb');
    str = str.replace('à', '\\u00e0');
    str = str.replace('â', '\\u00e2');
    str = str.replace('ä', '\\u00e4');
    str = str.replace('Â', '\\u00ca');
    str = str.replace('À', '\\u00c0');
    str = str.replace('Ä', '\\u00c4');
    str = str.replace('î', '\\u00ee');
    str = str.replace('ï', '\\u00ef');
    str = str.replace('Î', '\\u00ce');
    str = str.replace('Ï', '\\u00cf');
    str = str.replace('ô', '\\u00f4');
    str = str.replace('Ô', '\\u00d4');
    str = str.replace('ù', '\\u00f9');
    str = str.replace('û', '\\u00fb');
    str = str.replace('Ù', '\\u00d9');
    str = str.replace('Û', '\\u00db');
    str = str.replace('ç', '\\u00e7');
    str = str.replace('Ç', '\\u00c7');
    return str;
}

function toManche() {
    document.getElementById("finale").classList.remove("selected");
    document.getElementById("manche").classList.add("selected");
    document.getElementById("container1").style.removeProperty("display");
    document.getElementById("container2").style.display = "none";
    manche = true;
}

function toFinale() {
    document.getElementById("finale").classList.add("selected");
    document.getElementById("manche").classList.remove("selected");
    document.getElementById("container2").style.removeProperty("display");
    document.getElementById("container1").style.display = "none";
    manche = false;
}




function importGrid() {
    document.getElementById('file-select').click()
}

function sendFile() {
let reader = checkFileAPI();
    if (reader) {
        reader.onload = (evt) => {
            try {
                let grid = JSON.parse(evt.target.result);
                if ((!grid.questions || !grid.mots) && !grid.finale) {
                    alert("Impossible de lire le contenu de cette grille.");
                } else {
                    let data = JSON.parse(evt.target.result);
                    console.log(data);
                    if (!data.finale) {
                        toManche();
                        for (let row of domGrille) {
                            for (let cell of row) {
                                cell.classList.remove("letter");
                                cell.parentElement.removeAttribute("data-number");
                                cell.value = '';
                            }
                        }
                        defs = [];
                        for (let word of data.mots) {
                            defs.push({word: word.word, def: word.def});
                            let i = 0;
                            for (let l of word.word) {
                                let cell = domGrille[word.y + 1 + word.vert * i][word.x + 1 + (!word.vert) * i];
                                cell.value = l.toUpperCase();
                                cell.classList.add("letter");
                                i++;
                            }
                        }
                        updateWords();

                        let questions = document.getElementById("questions");
                        questions.innerHTML = "";
                        for (let q of data.questions) {
                            addQuestion();
                            let fields = questions.lastElementChild.children;
                            fields[0].value = q.letter.toUpperCase();
                            fields[1].value = q.text;
                            if (q.image) {
                                fields[2].value = "Image";
                                fields[3].value = q.image;
                            } else if (q.audio) {
                                fields[2].value = "Audio";
                                fields[3].value = q.audio;
                            }
                        }
                        updateQuestions();
                    }
                }
            } catch (e) {
                alert("Impossible de lire le contenu de cette grille.");
            }
        };
        reader.readAsText(document.getElementById("file-select").files[0], 'UTF-8');
    }
}

function checkFileAPI() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        let reader = new FileReader();
        return reader; 
    } else {
        alert('The File APIs are not fully supported by your browser. Fallback required.');
        return;
    }
}





function goToHome() {
  let form = document.createElement("form");
  form.method = "post";
  form.action = "leave";
  document.body.appendChild(form);
  form.submit();
}