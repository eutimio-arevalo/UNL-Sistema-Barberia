const boton = document.getElementsByClassName("btn btn-success");

for(let i = 0; i<boton.length; i++){
    boton[i].addEventListener('click', function(){
        //console.log("Click index: "+boton[i].id);
        //console.log(sessionStorage.getItem("listaclientes"));
        var clientes = JSON.parse(sessionStorage.getItem("listaClientes"));
        var usuarios = JSON.parse(sessionStorage.getItem("listaUsuarios"));
        console.log(clientes)
        const modalNombre = document.getElementById("modalNombre");
        const modalApellido = document.getElementById("modalApellido");
        const modalNacimiento = document.getElementById("modalNacimiento");
        const modalTelefono = document.getElementById("modalTelefono");
        const modalCedula = document.getElementById("modalCedula");
        const modalEmail = document.getElementById("modalEmail");
        const modalPassword = document.getElementById("modalPassword");
        const modalImg = document.getElementById("modalImg");
        const modalPosicion = document.getElementById("modalPosicion");
        modalNombre.value = clientes[i]["nombre"];
        modalApellido.value = clientes[i]["apellido"];
        modalNacimiento.value = clientes[i]["nacimiento"];
        modalTelefono.value = clientes[i]["telefono"];
        modalCedula.value = clientes[i]["cedula"];
        modalEmail.value = usuarios[i]["email"];
        modalPassword.value = usuarios[i]["password"];
        modalImg.src = clientes[i]["urlimage"];

        modalPosicion.value = i;
        //onsole.log('clientes: ',clientes[i-1]["precio"]);
    });
}