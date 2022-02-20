const boton = document.getElementsByClassName("btn btn-success");

for(let i = 0; i<boton.length; i++){
    boton[i].addEventListener('click', function(){
        //console.log("Click index: "+boton[i].id);
        //console.log(sessionStorage.getItem("listaempleados"));
        var citas = JSON.parse(sessionStorage.getItem("listaCitas"));
        var empleados = JSON.parse(sessionStorage.getItem("listaEmpleados"));
        var clientes = JSON.parse(sessionStorage.getItem("listaClientes"));
        var servicios = JSON.parse(sessionStorage.getItem("listaServicios"));
        console.log(citas)
        const imgEmpleado = document.getElementById("imgEmpleado");
        const empleado = document.getElementById("modalEmpleado");
        const imgCliente = document.getElementById("imgCliente");
        const cliente = document.getElementById("modalCliente");
        const imgServicio = document.getElementById("imgServicio");
        const servicio = document.getElementById("modalServicio");
        const estado = document.getElementById("selEstado");
        const hora = document.getElementById("modalHora");
        const fecha = document.getElementById("modalFecha");
        const posicion = document.getElementById("modalPosicion");


        console.log("Estado: "+citas[i]["estado"]);
        empleado.innerHTML = empleados[i]["nombre"]+" "+empleados[i]["apellido"];
        cliente.innerHTML = clientes[i]["nombre"]+" "+clientes[i]["apellido"];
        servicio.innerHTML = servicios[i]["nombre"];
        estado.value = citas[i]["estado"];
        
        fecha.innerHTML = citas[i]["fechaCita"];
        hora.innerHTML = citas[i]["horaCita"];
        imgEmpleado.src = empleados[i]["urlimage"];
        console.log("Imagen"+empleados[i]["urlimage"]);
        imgCliente.src = clientes[i]["urlimage"];
        imgServicio.src = servicios[i]["urlimage"];
        posicion.value = i
        //onsole.log('empleados: ',empleados[i-1]["precio"]);
    });
}