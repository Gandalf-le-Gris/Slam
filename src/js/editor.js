const nCol = 9;
const nRow = 8;
let domGrille = [];
let words = [];
let defs = [];
let quests = [];





fillGridDiv();





function fillGridDiv() {
    let grille = document.getElementById("grille");
    for (let i = -1; i <= nRow; i++) {
        domGrille.push([]);
        for (let j = -1; j <= nCol; j++) {
            let cell = document.createElement('input');
            cell.type = "text";
            if (i < 0 || i == nRow || j < 0 || j == nCol)
                cell.classList.add("hidden");
            cell.onchange = () => writeCell(cell);
            cell.onkeydown = () => writeCell(cell);
            cell.onpaste = () => writeCell(cell);
            cell.oninput = () => writeCell(cell);
            cell.maxLength = "1";
            cell.pattern = "[a-zA-Z]?";
            let div = document.createElement("div");
            div.appendChild(cell);
            grille.appendChild(div);
            domGrille[i+1].push(cell);
        }
    }
    domGrille[domGrille.length - 1][domGrille[0].length - 1].parentElement.id = "points";
    domGrille[domGrille.length - 1][domGrille[0].length - 1].parentElement.setAttribute("data-number", "0");
}

function writeCell(cell) {
    if (cell.value != "") {
        if (cell.value.match("[a-zA-Z]")) {
            cell.value = cell.value.toUpperCase();
            cell.classList.add("letter");
        } else {
            cell.value = "";
        }
    } else
        cell.classList.remove("letter");
    updateWords();
}

function updateWords() {
    let k = 0;
    words = [];
    for (let j = 0; j < domGrille[0].length - 1; j++) {
        for (let i = 0; i < domGrille.length - 1; i++) {
            let c = domGrille[i][j];
            c.parentElement.removeAttribute("data-number");

            if (!c.classList.contains("letter")) {
                let n = 0;
                while (n < 2 && domGrille[i + n + 1][j].classList.contains("letter"))
                    n++;
                if (n > 1) {
                    k++;
                    c.parentElement.setAttribute("data-number", k);
                    let word = "";
                    n = 0;
                    while (i + n + 1 <= nRow && domGrille[i + n + 1][j].classList.contains("letter")) {
                        word += domGrille[i + n + 1][j].value;
                        n++;
                    }
                    words.push(word);
                    if (defs.findIndex(e => e.word == word) == -1)
                        defs.push({word: word, def: ""});
                }
            }
        }
    }

    for (let i = 0; i < domGrille.length - 1; i++) {
        for (let j = 0; j < domGrille[0].length - 1; j++) {
            let c = domGrille[i][j];

            if (!c.classList.contains("letter")) {
                n = 0;
                while (n < 2 && domGrille[i][j + n + 1].classList.contains("letter"))
                    n++;
                if (n > 1) {
                    k++;
                    c.parentElement.setAttribute("data-number", k);
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

function compileJSON() {
    return {mots: compileWords(), questions: quests};
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