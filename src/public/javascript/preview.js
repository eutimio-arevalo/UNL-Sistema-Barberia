
const formFile = document.getElementById('formFile');
const preview = document.getElementById('preview');
formFile.onchange = evt => {
    const [file] = formFile.files
    if (file) {
      preview.src = URL.createObjectURL(file)
    }
}

