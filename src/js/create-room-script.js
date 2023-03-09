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

function sendFileContent(file) {
  let reader = checkFileAPI();
  if (reader) {
    reader.onload = (evt) => {
      document.getElementById("grid-input").value = evt.target.result;
      document.gridForm.submit();
    };
    reader.readAsBinaryString(file);
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