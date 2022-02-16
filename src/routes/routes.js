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

router.get('/', (req, res, next) => {
	
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
	await unlink(req.file.path);
	res.render('perfil', {
		persona: persona,
		edad: getEdad(persona.nacimiento)
	});
});

router.get('/reservar', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({});
	res.render('reservar', {
		ServiciosLista: servicios
	});
});

router.post('/reservar', isAuthenticated, async (req, res, next) => {

	// const servicios = await Servicios.find({});
	// res.render('reservar', {
	// 	ServiciosLista: servicios
	// });
});



router.get('/seleccionar-empleado', isAuthenticated, (req, res, next) => {
	res.render('seleccionar-empleado');
});

router.get('/personalizar', isAuthenticated, (req, res, next) => {
	res.render('personalizar');
});

router.get('/admin/cliente', isAuthenticated, (req, res, next) => {
	res.render('admin/cliente');
});

router.get('/admin/empleado', isAuthenticated, async (req, res, next) => {
	const userEmpleados = await Usuarios.find({ tipo: "Empleado" });
	const aux = await Usuarios.find({ tipo: "Empleado" });
	const ids = [];
	aux.forEach(auxi => {
		ids.push(auxi._id);
	});
	//console.log(ids);
	const personaEmpleados = await Personas.find({ usuario: { $in: ids } });
	//console.log(personaEmpleados);

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

	res.render('admin/empleado');
});

router.get('/admin/servicio', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({});
	res.render('admin/servicio', {
		listaServicios: servicios
	});
});

router.post('/admin/servicio/eliminar', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.findOne({ nombre:req.body.id });
	console.log(servicios);
	res.render('admin/servicio', {
		listaServicios: servicios
	});
});

router.post('/editar/servicio', isAuthenticated, async (req, res, next) => {
	const servicios = await Servicios.find({});
	const { nombre, descripcion, tipo, precio, image, posicion} = req.body;
	const actServicio = servicios[parseInt(posicion)];
	actServicio.nombre = nombre;
	actServicio.descripcion = descripcion;
	actServicio.tipo = tipo;
	actServicio.precio = precio;
	if(req.file){
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

router.post('/admin/servicio', isAuthenticated, async (req, res, next) => {
	const { nombre, descripcion, tipo, precio, image } = req.body;
	console.log(req.file);
	console.log(req.body);
	const newServicio = new Servicios();
	newServicio.nombre = nombre;
	newServicio.descripcion = descripcion;
	newServicio.tipo = tipo;
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


function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

module.exports = router;