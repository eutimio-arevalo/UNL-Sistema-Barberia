
const inputFile = document.getElementById("formFile");
const imgSrc = document.getElementById("preview");
inputFile.onchange = evt => {
    const [file] = inputFile.files
    if (file) {
      imgSrc.src = URL.createObjectURL(file)
    }
}

const minputFile = document.getElementById("mformFile");
const mimgSrc = document.getElementById("modalImg");
minputFile.onchange = evt => {
    const [file] = minputFile.files
    if (file) {
      mimgSrc.src = URL.createObjectURL(file)
    }
}

