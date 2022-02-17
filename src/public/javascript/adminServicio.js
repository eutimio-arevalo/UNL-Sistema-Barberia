const boton = document.getElementsByClassName("btn btn-success");

for(let i = 0; i<boton.length; i++){
    boton[i].addEventListener('click', function(){
        //console.log("Click index: "+boton[i].id);
        //console.log(sessionStorage.getItem("listaServicios"));
        var servicios = JSON.parse(sessionStorage.getItem("listaServicios"));
        const modalNombre = document.getElementById("modalNombre");
        const modalDescripcion = document.getElementById("modalDescripcion");
        const modalPrecio = document.getElementById("modalPrecio");
        const modalImg = document.getElementById("modalImg");
        const modalPosicion = document.getElementById("modalPosicion");
        modalNombre.value = servicios[i-1]["nombre"];
        modalDescripcion.value = servicios[i-1]["descripcion"];
        modalPrecio.value = servicios[i-1]["precio"];
        modalImg.src = servicios[i-1]["urlimage"];
        modalPosicion.value = i-1;
        //onsole.log('Servicios: ',servicios[i-1]["precio"]);
         
    });
}