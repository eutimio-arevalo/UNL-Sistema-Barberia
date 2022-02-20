const boton = document.getElementsByClassName("btn btn-outline-primary");

for(let i = 0; i<boton.length; i++){
    boton[i].addEventListener('click', function(){
        //console.log("Click index: "+boton[i].id);
        //console.log(sessionStorage.getItem("listaempleados"));
        var citas = JSON.parse(sessionStorage.getItem("listaCitas"));
        console.log(citas[i])
        const modalPosicion = document.getElementById("modalPosicion");
        modalPosicion.value = i;
        console.log(modalPosicion.value)
        //onsole.log('empleados: ',empleados[i-1]["precio"]);
    });
}