const router = require('express').Router();
const passport = require('passport');
const path = require('path');
const { unlink } = require('fs-extra');
const { cloudinary_keys } = require('../keys');
const Cloudinary = require('cloudinary');

if (typeof localStorage === "undefined" || localStorage === null) {
	var LocalStorage = require('node-localstorage').LocalStorage;
	localStorage = new LocalStorage('./scratch');
}

Cloudinary.config({
	cloud_name: cloudinary_keys.cloud_name,
	api_key: cloudinary_keys.api_key,
	api_secret: cloudinary_keys.api_secret
});

require('./rest-api')

const Usuarios = require('../models/user');
const Personas = require('../models/persona');
const Servicios = require('../models/servicio');
const Citas = require('../models/cita');
const Trabajos = require('../models/trabajo');

const { fstat } = require('fs');

//------------------------------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
	const usuarios = await Usuarios.findOne({ tipo: "Admin" });
	const trabajos = await Trabajos.find({})
	if (!usuarios) {
		const admin = await new Personas();
		const user = await new Usuarios();
		admin.nombre = "Admin-Nombre";
		admin.apellido = "Admin-Apellido";
		admin.nacimiento = "2001-01-01";
		admin.cedula = "";
		admin.telefono = "";
		admin.urlimage = "https://res.cloudinary.com/djsa7v6bs/image/upload/v1643855173/perfil_pzarxl.jpg";
		admin.public_id = "perfil_pzarxl";
		user.email = "admin@admin.com";
		user.password = "admin";
		user.tipo = "Admin";
		admin.usuario = user._id;
		user.save();
		admin.save();
	}
	//console.log(trabajos)
	res.render('home', {
		listaTrabajos: trabajos
	});
});


router.get('/register', (req, res, next) => {
	res.render('register');
});

router.post('/register', passport.authenticate('local-signup', {
	successRedirect: '/',
	failureRedirect: '/register',
	failureFlash: true
}));

router.get('/login', (req, res, next) => {
	res.render('login');
});

router.post('/login', passport.authenticate('local-signin', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

router.get('/logout', (req, res, next) => {
	req.logout();
	res.redirect('/');
});

function getEdad(dateString) {
	let fechaAct = new Date();
	let fechaNac = new Date(dateString);
	let edad = fechaAct.getFullYear() - fechaNac.getFullYear();
	let diferenciaMes = fechaAct.getMonth() - fechaNac.getMonth();
	if (diferenciaMes < 0 || diferenciaMes === 0 && fechaAct.getDate() < fechaNac.getDate()) {
		edad = edad - 1;
	}
	return edad;
}

router.get('/perfil', isAuthenticated, async (req, res, next) => {
	const usuario = req.user;
	const persona = await Personas.findOne({ usuario: usuario._id });
	res.render('perfil', {
		persona: persona,
		edad: getEdad(persona.nacimiento)
	});
});

router.post('/perfil', isAuthenticated, async (req, res, next) => {
	const usuario = req.user;
	const persona = await Personas.findOne({ usuario: usuario._id });
	const { nombre, apellido, nacimiento, telefono, email, password, image } = req.body;
	//console.log(req.body);
	//console.log(req.file);
	persona.nombre = nombre;
	persona.apellido = apellido;
	persona.nacimiento = nacimiento;
	persona.telefono = telefono;
	if (usuario.tipo == "Admin" && !(persona.cedula.length > 0)) {
		persona.cedula = req.body.cedula;
	}
	usuario.email = email;
	usuario.password = password;
	if (req.file) {
		//console.log("Hay imagen");
		const result = await Cloudinary.v2.uploader.upload(req.file.path);
		//console.log(result);
		persona.urlimage = result.url;
		persona.public_id = result.public_id;
	}
	await persona.save();
	await usuario.save();
	if (req.file) {
		await unlink(req.file.path);
	}
	res.render('perfil', {
		persona: persona,
		edad: getEdad(persona.nacimiento)
	});
});

router.get('/reservar', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({ tipo: "Fijo" });
	res.render('reservar', {
		ServiciosLista: servicios
	});
});

router.post('/reservar', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({ tipo: "Fijo" });
	const { btnRadio } = req.body;
	const userEmpleados = await Usuarios.find({ tipo: "Empleado" });
	const aux = await Usuarios.find({ tipo: "Empleado" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const personaEmpleados = await Personas.find({ usuario: { $in: ids } });
	localStorage.setItem("selServicio", JSON.stringify(servicios[parseInt(btnRadio)]));
	//console.log(personaEmpleados)
	const citas = await Citas.find({});

	res.render('seleccionar-empleado', {
		userEmpleados: userEmpleados,
		personaEmpleados: personaEmpleados,
		selServicios: servicios[parseInt(btnRadio)],
		listaCitas: citas
	});
});


router.post('/seleccionar-empleado', isAuthenticated, async (req, res, next) => {

	const aux = await Usuarios.find({ tipo: "Empleado" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const personaEmpleados = await Personas.find({ usuario: { $in: ids } });

	const { btnradio, fecha, hora } = req.body;
	const servicio = JSON.parse(localStorage.getItem("selServicio"));
	const newCita = new Citas();
	newCita.fechaCita = fecha;
	newCita.horaCita = hora;
	newCita.estado = "Pendiente";
	const user = req.user._id;
	const cliente = await Personas.findOne({ usuario: user });
	newCita.cliente = cliente._id;
	newCita.servicio = servicio._id;
	newCita.empleado = personaEmpleados[parseInt(btnradio)]._id;
	await newCita.save();

	const acliente = await Personas.findOne({ usuario: req.user._id })
	const acitas = await Citas.find({ cliente: acliente._id, estado:"Pendiente"})
	const acita = acitas[acitas.length-1];
	const aservicio = await Servicios.findOne({ _id: acita.servicio });
	const aempleado = await Personas.findOne({ _id: acita.empleado });
	res.render('exito',{
		getCliente: acliente,
		getServicio: aservicio,
		getEmpleado: aempleado,
		getCita: acita
	});
});


router.get('/personalizar', isAuthenticated, (req, res, next) => {
	res.render('personalizar');
});

router.post('/personalizar', isAuthenticated, async (req, res, next) => {
	const servicios = new Servicios();
	const { nombre, descripcion } = req.body;
	servicios.nombre = nombre;
	servicios.descripcion = descripcion;
	servicios.tipo = "Personalizado";
	servicios.precio = 0.00;
	const result = await Cloudinary.v2.uploader.upload(req.file.path);
	servicios.urlimage = result.url;
	servicios.public_id = result.public_id;
	await servicios.save();

	const userEmpleados = await Usuarios.find({ tipo: "Empleado" });
	const aux = await Usuarios.find({ tipo: "Empleado" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});

	const citas = await Citas.find({});

	const personaEmpleados = await Personas.find({ usuario: { $in: ids } });
	localStorage.setItem("selServicio", JSON.stringify(servicios));
	//console.log(servicios)
	res.render('seleccionar-empleado', {
		userEmpleados: userEmpleados,
		personaEmpleados: personaEmpleados,
		selServicios: servicios,
		listaCitas: citas
	});
});


router.get('/historial', isAuthenticated, async (req, res, next) => {

	const cliente = await Personas.findOne({ usuario: req.user._id });
	const citas = await Citas.find({ cliente: cliente._id, estado: "Pendiente" });
	var listaEmpleados = [];
	var listaServicios = [];

	for (i = 0; i < citas.length; i++) {
		const empleado = await Personas.findOne({ _id: citas[i].empleado });
		listaEmpleados[i] = empleado;
		const servicio = await Servicios.findOne({ _id: citas[i].servicio });
		listaServicios[i] = servicio;

	}

	res.render('historial', {
		listaCitas: citas,
		empleados: listaEmpleados,
		servicios: listaServicios,
		cliente: cliente
	});
});

router.post('/historial/cancelar', isAuthenticated, async (req, res, next) => {
	const cliente = await Personas.findOne({ usuario: req.user._id });
	const citas = await Citas.find({ cliente: cliente._id, estado: "Pendiente" });

	const { posicion } = req.body;
	const servicio = await Servicios.findOne({ _id: citas[posicion].servicio });
	//console.log(posicion)

	//console.log("No se elimina")
	citas[posicion].estado = "Cancelada";
	await citas[posicion].save();


	newcitas = await Citas.find({ cliente: cliente._id, estado: "Pendiente" });
	var listaEmpleados = [];
	var listaServicios = [];

	for (i = 0; i < newcitas.length; i++) {
		const empleado = await Personas.findOne({ _id: newcitas[i].empleado });
		listaEmpleados[i] = empleado;
		const servicio = await Servicios.findOne({ _id: newcitas[i].servicio });
		listaServicios[i] = servicio;

	}

	res.render('historial', {
		listaCitas: newcitas,
		empleados: listaEmpleados,
		servicios: listaServicios,
		cliente: cliente
	});
});

router.get('/admin/cliente', isAuthenticated, async (req, res, next) => {
	const userCliente = await Usuarios.find({ tipo: "Cliente" });
	const aux = await Usuarios.find({ tipo: "Cliente" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const personaCliente = await Personas.find({ usuario: { $in: ids } });

	res.render('admin/cliente', {
		listaUsers: userCliente,
		listaPersonas: personaCliente
	});
});

router.post('/editar/cliente', isAuthenticated, async (req, res, next) => {
	const userEmpleados = await Usuarios.find({ tipo: "Cliente" });
	const aux = await Usuarios.find({ tipo: "Cliente" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const empleados = await Personas.find({ usuario: { $in: ids } });

	const { nombre, apellido, nacimiento, cedula, telefono, email, password, posicion } = req.body;
	const actEmpleado = empleados[parseInt(posicion)];
	const actUsuario = userEmpleados[parseInt(posicion)];
	actEmpleado.nombre = nombre;
	actEmpleado.apellido = apellido;
	actEmpleado.nacimiento = nacimiento;
	actEmpleado.cedula = cedula;
	actEmpleado.telefono = telefono;
	actUsuario.email = email;
	actUsuario.password = password;

	if (req.file) {
		const result = await Cloudinary.v2.uploader.upload(req.file.path);
		actEmpleado.urlimage = result.url;
		actEmpleado.public_id = result.public_id;
	}
	await actEmpleado.save();
	await actUsuario.save();

	const listaClientes = await Usuarios.find({ tipo: "Cliente" });
	const auxClientes = await Usuarios.find({ tipo: "Cliente" });
	const idsClientes = [];
	auxClientes.forEach(auxi => {
		idsClientes.push(auxi._id);
	});
	const personaClientes = await Personas.find({ usuario: { $in: ids } });

	res.render('admin/cliente', {
		listaUsers: listaClientes,
		listaPersonas: personaClientes
	});
});

router.post('/eliminar/cliente', isAuthenticated, async (req, res, next) => {
	const aux = await Usuarios.find({ tipo: "Cliente" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const empleados = await Personas.find({ usuario: { $in: ids } });
	const { posicion } = req.body;
	const empleado = empleados[parseInt(posicion)];
	await empleado.remove();
	//console.log(empleado);

	listaEmpleados = await Usuarios.find({ tipo: "Cliente" });
	const auxEmpleado = await Usuarios.find({ tipo: "Cliente" });
	const idsEmpleado = [];
	auxEmpleado.forEach(auxi => {
		idsEmpleado.push(auxi._id);
	});
	const personaEmpleados = await Personas.find({ usuario: { $in: idsEmpleado } });

	res.render('admin/cliente', {
		listaUsers: listaEmpleados,
		listaPersonas: personaEmpleados
	});
});

router.get('/admin/empleado', isAuthenticated, async (req, res, next) => {
	const userEmpleados = await Usuarios.find({ tipo: "Empleado" });
	const aux = await Usuarios.find({ tipo: "Empleado" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const personaEmpleados = await Personas.find({ usuario: { $in: ids } });

	res.render('admin/empleado', {
		listaUsers: userEmpleados,
		listaPersonas: personaEmpleados
	});
});


router.post('/agregar/empleado', isAuthenticated, async (req, res, next) => {
	const { nombre, apellido, nacimiento, cedula, telefono, email, password, image } = req.body;
	const user = await Usuarios.findOne({ email: email });
	const cliente = await Personas.findOne({ cedula: cedula });;
	var mensajeRegistrar = "";
	var mensajeCedula = "";
	if (user || cliente) {
		mensajeRegistrar = "El usuario ya existe"
	}else if(verificarCedula(cedula)){
		mensajeCedula = "Cédula no valida";
	} else {
		const result = await Cloudinary.v2.uploader.upload(req.file.path);
		const newPersona = new Personas();
		const newUser = new Usuarios();
		newPersona.nombre = nombre;
		newPersona.apellido = apellido;
		newPersona.nacimiento = nacimiento;
		newPersona.cedula = cedula;
		newPersona.telefono = telefono;
		newPersona.urlimage = result.url;
		newPersona.public_id = result.public_id;
		newUser.tipo = "Empleado";
		newUser.email = email;
		newUser.password = password;
		newPersona.usuario = newUser._id;
		//console.log('Nuevo usuario creado: ',newPersona)
		await newUser.save();
		await newPersona.save();
		await unlink(req.file.path);
	}

	const userEmpleados = await Usuarios.find({ tipo: "Empleado" });
	const aux = await Usuarios.find({ tipo: "Empleado" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const personaEmpleados = await Personas.find({ usuario: { $in: ids } });

	res.render('admin/empleado', {
		listaUsers: userEmpleados,
		mensajeRegistrar: mensajeRegistrar,
		mensajeCedula: mensajeCedula,
		listaPersonas: personaEmpleados
	});
});

router.post('/editar/empleado', isAuthenticated, async (req, res, next) => {
	const userEmpleados = await Usuarios.find({ tipo: "Empleado" });
	const aux = await Usuarios.find({ tipo: "Empleado" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const empleados = await Personas.find({ usuario: { $in: ids } });

	const { nombre, apellido, nacimiento, cedula, telefono, email, password, posicion } = req.body;
	const actEmpleado = empleados[parseInt(posicion)];
	//console.log("Posicion:", posicion)
	const actUsuario = userEmpleados[parseInt(posicion)];
	actEmpleado.nombre = nombre;
	actEmpleado.apellido = apellido;
	actEmpleado.nacimiento = nacimiento;
	actEmpleado.cedula = cedula;
	actEmpleado.telefono = telefono;
	actUsuario.email = email;
	actUsuario.password = password;


	if (req.file) {
		const result = await Cloudinary.v2.uploader.upload(req.file.path);
		actEmpleado.urlimage = result.url;
		actEmpleado.public_id = result.public_id;
	}
	await actEmpleado.save();
	await actUsuario.save();

	listaEmpleados = await Usuarios.find({ tipo: "Empleado" });
	const auxEmpleado = await Usuarios.find({ tipo: "Empleado" });
	const idsEmpleado = [];
	auxEmpleado.forEach(auxi => {
		idsEmpleado.push(auxi._id);
	});
	const personaEmpleados = await Personas.find({ usuario: { $in: idsEmpleado } });

	res.render('admin/empleado', {
		listaUsers: listaEmpleados,
		listaPersonas: personaEmpleados
	});
});

router.post('/eliminar/empleado', isAuthenticated, async (req, res, next) => {
	const aux = await Usuarios.find({ tipo: "Empleado" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const empleados = await Personas.find({ usuario: { $in: ids } });
	const { posicion } = req.body;
	const empleado = empleados[parseInt(posicion)];
	await empleado.remove();
	//console.log(empleado);

	listaEmpleados = await Usuarios.find({ tipo: "Empleado" });
	const auxEmpleado = await Usuarios.find({ tipo: "Empleado" });
	const idsEmpleado = [];
	auxEmpleado.forEach(auxi => {
		idsEmpleado.push(auxi._id);
	});
	const personaEmpleados = await Personas.find({ usuario: { $in: idsEmpleado } });

	res.render('admin/empleado', {
		listaUsers: listaEmpleados,
		listaPersonas: personaEmpleados
	});
});



router.get('/admin/servicio', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({});
	res.render('admin/servicio', {
		listaServicios: servicios
	});
});

router.post('/agregar/servicio', isAuthenticated, async (req, res, next) => {
	const { nombre, descripcion, tipo, precio, image } = req.body;
	//console.log(req.file);
	//console.log(req.body);
	const newServicio = new Servicios();
	newServicio.nombre = nombre;
	newServicio.descripcion = descripcion;
	newServicio.tipo = "Fijo";
	newServicio.precio = precio;
	const result = await Cloudinary.v2.uploader.upload(req.file.path);
	newServicio.urlimage = result.url;
	newServicio.public_id = result.public_id;
	await newServicio.save();
	await unlink(req.file.path);
	const servicios = await Servicios.find({});

	res.render('admin/servicio', {
		listaServicios: servicios
	});
});

router.post('/editar/servicio', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({});
	const { nombre, descripcion, tipo, precio, image, posicion } = req.body;
	const actServicio = servicios[parseInt(posicion)];
	actServicio.nombre = nombre;
	actServicio.descripcion = descripcion;
	actServicio.precio = precio;
	if (req.file) {
		const result = await Cloudinary.v2.uploader.upload(req.file.path);
		actServicio.urlimage = result.url;
		actServicio.public_id = result.public_id;
	}
	await actServicio.save();
	const listaservicios = await Servicios.find({});
	res.render('admin/servicio', {
		listaServicios: listaservicios
	});
});

router.post('/eliminar/servicio', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({});
	const { posicion } = req.body;
	const servicio = servicios[parseInt(posicion)];
	await servicio.remove();
	//console.log(servicio);
	const listaservicios = await Servicios.find({});
	res.render('admin/servicio', {
		listaServicios: listaservicios
	});
});

router.get('/admin/cita', isAuthenticated, async (req, res, next) => {
	const citas = await Citas.find({});

	var listaEmpleados = [];
	var listaServicios = [];
	var listaClientes = [];

	for (i = 0; i < citas.length; i++) {
		const empleado = await Personas.findOne({ _id: citas[i].empleado });
		listaEmpleados[i] = empleado;
		const servicio = await Servicios.findOne({ _id: citas[i].servicio });
		listaServicios[i] = servicio;
		const cliente = await Personas.findOne({ _id: citas[i].cliente });
		listaClientes[i] = cliente;
	}

	res.render('admin/cita', {
		listaCitas: citas,
		empleados: listaEmpleados,
		servicios: listaServicios,
		clientes: listaClientes
	});
});

router.post('/editar/citas', isAuthenticated, async (req, res, next) => {

	const auxCitas = await Citas.find({});
	const { estado, posicion } = req.body;
	auxCitas[parseInt(posicion)].estado = estado;
	await auxCitas[parseInt(posicion)].save()

	const citas = await Citas.find({});

	var listaEmpleados = [];
	var listaServicios = [];
	var listaClientes = [];

	for (i = 0; i < citas.length; i++) {
		const empleado = await Personas.findOne({ _id: citas[i].empleado });
		listaEmpleados[i] = empleado;
		const servicio = await Servicios.findOne({ _id: citas[i].servicio });
		listaServicios[i] = servicio;
		const cliente = await Personas.findOne({ _id: citas[i].cliente });
		listaClientes[i] = cliente;
	}

	res.render('admin/cita', {
		listaCitas: citas,
		empleados: listaEmpleados,
		servicios: listaServicios,
		clientes: listaClientes
	});
});

router.get('/admin/trabajo', isAuthenticated, async (req, res, next) => {
	const listaTrabajos = await Trabajos.find({});
	res.render('admin/trabajo', {
		listaTrabajos: listaTrabajos
	});
});

router.post('/admin/trabajo', isAuthenticated, async (req, res, next) => {
	const { descripcion } = req.body;
	const result = await Cloudinary.v2.uploader.upload(req.file.path);

	const newTrabajo = new Trabajos();
	
	newTrabajo.descripcion = descripcion;
	newTrabajo.urlimage = result.url;
	newTrabajo.public_id = result.public_id;

	await newTrabajo.save();

	const listaTrabajos = await Trabajos.find({});

	res.render('admin/trabajo', {
		listaTrabajos: listaTrabajos
	});
});

router.post('/eliminar/trabajo', isAuthenticated, async (req, res, next) => {
	const trabajos = await Trabajos.find({});
	const { posicion } = req.body;
	await trabajos[posicion].remove();

	const listaTrabajos = await Trabajos.find({});

	res.render('admin/trabajo', {
		listaTrabajos: listaTrabajos
	});
});

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

function verificarCedula(cedula) {

	var cad = cedula;
	var total = 0;
	var longitud = cad.length;
	var longcheck = longitud - 1;

	if (cad !== "" && longitud === 10) {
		for (i = 0; i < longcheck; i++) {
			if (i % 2 === 0) {
				var aux = cad.charAt(i) * 2;
				if (aux > 9) aux -= 9;
				total += aux;
			} else {
				total += parseInt(cad.charAt(i)); // parseInt o concatenará en lugar de sumar
			}
		}

		total = total % 10 ? 10 - total % 10 : 0;

		if (cad.charAt(longitud - 1) == total) {
			console.log("Cedula Válida");
			return false;
		} else {
			console.log("Cedula Inválida");
			return true;
		}
	}

}

module.exports = router;