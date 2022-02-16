const boton = document.getElementsByClassName("btn btn-primary");

for(let i = 0; i<boton.length; i++){
    boton[i].addEventListener('click', function(){
        //console.log("Click index: "+boton[i].id);
        //console.log(sessionStorage.getItem("listaServicios"));
        var servicios = JSON.parse(sessionStorage.getItem("listaServicios"));
        const modalNombre = document.getElementById("modalNombre");
        const modalDescripcion = document.getElementById("modalDescripcion");
        const modalTipo = document.getElementById("modalTipo");
        const modalPrecio = document.getElementById("modalPrecio");
        const modalImg = document.getElementById("modalImg");
        const modalPosicion = document.getElementById("modalPosicion");
        modalNombre.value = servicios[i-1]["nombre"];
        modalDescripcion.value = servicios[i-1]["descripcion"];
        modalTipo.value = servicios[i-1]["tipo"];
        modalPrecio.value = servicios[i-1]["precio"];
        modalImg.src = servicios[i-1]["urlimage"];
        modalPosicion.value = i-1;
        //console.log('Servicios: ',servicios[i-1]);
    });
}