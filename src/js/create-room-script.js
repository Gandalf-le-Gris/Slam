window.addEventListener("dragover",function(e){
    e = e || event;
    e.preventDefault();
},false);
window.addEventListener("drop",function(e){
    e = e || event;
    e.preventDefault();
},false);

function dropHandler(ev) {
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    [...ev.dataTransfer.items].forEach((item, i) => {
      if (item.kind === "file") {
        const file = item.getAsFile();
        sendFileContent(file);
      }
    });
  } else {
    [...ev.dataTransfer.files].forEach((file, i) => {
      sendFileContent(file);
    });
  }
}

function dragOverHandler(ev) {
    ev.preventDefault();
}

function sendFile() {
  let reader = checkFileAPI();
  if (reader) {
    reader.onload = (evt) => {
      try {
        let grid = JSON.parse(evt.target.result);
        if (!grid.questions || !grid.mots) {
          alert("Impossible de lire le contenu de cette grille.");
        } else {
          document.getElementById("grid-input").value = evt.target.result;
          document.gridForm.submit();
        }
      } catch (e) {
        alert("Impossible de lire le contenu de cette grille.");
      }
    };
    reader.readAsText(document.getElementById("file-select").files[0], 'UTF-8');
  }
}

function sendFileContent(file) {
  let reader = checkFileAPI();
  if (reader) {
    reader.onload = (evt) => {
      try {
        let grid = JSON.parse(evt.target.result);
        if (!grid.questions || !grid.mots) {
          alert("Impossible de lire le contenu de cette grille.");
        } else {
          document.getElementById("grid-input").value = evt.target.result;
          document.gridForm.submit();
        }
      } catch (e) {
        alert("Impossible de lire le contenu de cette grille.");
      }
    };
    reader.readAsText(file, 'UTF-8');
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





function createGrid() {
  let form = document.createElement("form");
  form.method = "post";
  form.action = "create-grid";
  document.body.appendChild(form);
  form.submit();
}