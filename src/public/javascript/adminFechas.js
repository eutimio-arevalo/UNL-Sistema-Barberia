const fecha = document.getElementById("selFecha");
const selhora = document.getElementById("selHora");
fecha.disabled = true;
selhora.disabled = true;


const radio = document.getElementsByClassName("btn-check");

for (let i = 0; i < radio.length; i++) {
    radio[i].checked = false;
}

var empleados = JSON.parse(sessionStorage.getItem("listaEmpleados"));
console.log(empleados)
var empleado = null;
for (let i = 0; i < radio.length; i++) {
    radio[i].addEventListener('click', function () {
        console.log("click");
        empleado = empleados[i];
        console.log(empleado);
        fecha.disabled = false;
        selhora.disabled = false;
        selhora.value = null;
        fecha.value = null;
    });
}

fecha.addEventListener('change', function () {
    removeOptions(selhora);
    var citas = JSON.parse(sessionStorage.getItem("listaCitas"));
    //console.log(citas);
    var aux = ":00";
    var hora = "";

    var listaEmpleadosCitas = [];
    citas.forEach(function (cita, i) {
        if (cita.empleado == empleado._id) {
            listaEmpleadosCitas.push(cita);
        }
    });

    var listaFechas = [];
    listaEmpleadosCitas.forEach(function (cita, i) {
        if (cita.fechaCita == fecha.value) {
            listaFechas.push(cita);
        }
    });
    var listaHoras = [];
    for (let i = 9; i < 19; i++) {
        if (i < 10) {
            hora = "0" + i + aux;
        } else {
            hora = i + aux;
        }
        listaHoras.push(hora);
    }

    listaFechas.forEach(function (cita, i) {
        listaHoras = listaHoras.filter((hora) => hora !== cita.horaCita);
    });

    listaHoras.forEach((hora) => {
        var opt = document.createElement('option');
        opt.value = hora;
        opt.innerHTML = hora;
        selhora.appendChild(opt);
    });

});

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
}