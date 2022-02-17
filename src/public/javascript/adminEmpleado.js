const boton = document.getElementsByClassName("btn btn-success");

for(let i = 0; i<boton.length; i++){
    boton[i].addEventListener('click', function(){
        //console.log("Click index: "+boton[i].id);
        //console.log(sessionStorage.getItem("listaempleados"));
        var empleados = JSON.parse(sessionStorage.getItem("listaEmpleados"));
        var usuarios = JSON.parse(sessionStorage.getItem("listaUsuarios"));
        console.log(empleados)
        const modalNombre = document.getElementById("modalNombre");
        const modalApellido = document.getElementById("modalApellido");
        const modalNacimiento = document.getElementById("modalNacimiento");
        const modalTelefono = document.getElementById("modalTelefono");
        const modalCedula = document.getElementById("modalCedula");
        const modalEmail = document.getElementById("modalEmail");
        const modalPassword = document.getElementById("modalPassword");
        const modalImg = document.getElementById("modalImg");
        const modalPosicion = document.getElementById("modalPosicion");
        modalNombre.value = empleados[i]["nombre"];
        modalApellido.value = empleados[i]["apellido"];
        modalNacimiento.value = empleados[i]["nacimiento"];
        modalTelefono.value = empleados[i]["telefono"];
        modalCedula.value = empleados[i]["cedula"];
        modalEmail.value = usuarios[i]["email"];
        modalPassword.value = usuarios[i]["password"];
        modalImg.src = empleados[i]["urlimage"];

        modalPosicion.value = i;
        //onsole.log('empleados: ',empleados[i-1]["precio"]);
    });
}