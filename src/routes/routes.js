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

router.get('/', async(req, res, next) => {
	const usuarios = await Usuarios.findOne({ tipo: "Admin" });
	if(!usuarios){
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
	res.render('home');
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
	console.log(req.body);
	console.log(req.file);
	persona.nombre = nombre;
	persona.apellido = apellido;
	persona.nacimiento = nacimiento;
	persona.telefono = telefono;
	if(usuario.tipo == "Admin"){
		persona.cedula = req.body.cedula;
	}
	usuario.email = email;
	usuario.password = password;
	if (req.file) {
		console.log("Hay imagen");
		const result = await Cloudinary.v2.uploader.upload(req.file.path);
		console.log(result);
		persona.urlimage = result.url;
		persona.public_id = result.public_id;
	}
	await persona.save();
	await usuario.save();
	if(req.file){
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
	res.render('seleccionar-empleado', {
		userEmpleados: userEmpleados,
		personaEmpleados: personaEmpleados,
		selServicios: servicios[parseInt(btnRadio)]
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
	const cliente = await Personas.findOne({ usuario: req.user._id });
	console.log(cliente);
	newCita.cliente = cliente._id;
	newCita.servicio = servicio._id;
	newCita.empleado = personaEmpleados[parseInt(btnradio)]._id;
	newCita.save();
	res.render('home');
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

	const personaEmpleados = await Personas.find({ usuario: { $in: ids } });
	localStorage.setItem("selServicio", JSON.stringify(servicios));
	console.log(servicios)
	res.render('seleccionar-empleado', {
		userEmpleados: userEmpleados,
		personaEmpleados: personaEmpleados,
		selServicios: servicios
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

router.post('/admin/empleado', isAuthenticated, async (req, res, next) => {
	const { nombre, apellido, nacimiento, cedula, telefono, email, password, image } = req.body;
	const user = await Usuarios.findOne({ email: email });
	const cliente = await Personas.findOne({ cedula: cedula });;
	if (user || cliente) {

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
	actEmpleado.save();
	actUsuario.save();

	userEmpleados = await Usuarios.find({ tipo: "Empleado" });
	aux = await Usuarios.find({ tipo: "Empleado" });
	ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	const personaEmpleados = await Personas.find({ usuario: { $in: ids } });

	res.render('admin/empleado', {
		listaUsers: userEmpleados,
		listaPersonas: personaEmpleados
	});
});

router.post('/eliminar/empleado', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({});
	const { posicion } = req.body;
	const servicio = servicios[parseInt(posicion)];
	await servicio.remove();
	console.log(servicio);
	const listaservicios = await Servicios.find({});
	res.render('admin/empleado', {
		listaServicios: listaservicios
	});
});



router.get('/admin/servicio', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({});
	res.render('admin/servicio', {
		listaServicios: servicios
	});
});

router.post('/admin/servicio', isAuthenticated, async (req, res, next) => {
	const { nombre, descripcion, tipo, precio, image } = req.body;
	console.log(req.file);
	console.log(req.body);
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
	console.log(servicio);
	const listaservicios = await Servicios.find({});
	res.render('admin/servicio', {
		listaServicios: listaservicios
	});
});


function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

module.exports = router;