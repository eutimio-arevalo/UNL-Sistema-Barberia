const router = require('express').Router();
const passport = require('passport');
const path = require('path');
const { unlink } = require('fs-extra');
const { cloudinary_keys } = require('../keys');
const Cloudinary = require('cloudinary');

Cloudinary.config({
	cloud_name: cloudinary_keys.cloud_name,
	api_key: cloudinary_keys.api_key,
	api_secret: cloudinary_keys.api_secret
});

const Usuarios = require('../models/user');
const Personas =require('../models/persona');
const Servicio = require('../models/servicio');
const Cita = require('../models/cita');


//Obtener todos
router.get('/users/', async (req, res) => {
	try {
		const usuarios = await Usuarios.find();
		res.json(usuarios);
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.get('/personas/', async (req, res) => {
	try {
		const usuarios = await Personas.find();
		res.json(usuarios);
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.get('/servicio/', async (req, res) => {
	try {
		const servicio = await Servicio.find();
		res.json(servicio);
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.get('/citas/', async (req, res) => {
	try {
		const citas = await Citas.find();
		res.json(citas);
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});


//Obtener uno
router.get('/users/:id', getUsuario,(req, res) => {
	res.send(res.usuario)
});

router.get('/users/:id', getUsuario,(req, res) => {
	res.send(res.usuario)
});

router.get('/users/:id', getUsuario,(req, res) => {
	res.send(res.usuario)
});


//Crear uno
router.post('/users', async (req, res) => {
	const aux = await Usuarios.findOne({ email: req.body.email });
	try {
		if (aux) {
			res.status(404).json({ message: "El usuario ya existe" })
		} else {
			const newUser = new Usuarios();
			newUser.email = req.body.email;
			newUser.password = req.body.password;
			await newUser.save();
			res.status(200).send(newUser);
		}
	} catch (error) {
		res.status(400).json({ message: error.message });
	}

});

//Actualizar uno
router.patch('/users/:id', getUsuario, async (req, res) => {
	console.log(res.usuario)
	if(req.body.email != null){
		res.usuario.email = req.body.email;
	}
	if(req.body.password != null){
		res.usuario.password = req.body.password;
	}
	try {
		const updateUsuario = await res.usuario.save();
		res.json(updateUsuario)
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

//Eliminar uno
router.delete('/users/:id', getUsuario, async (req, res) => {
	try {
		await res.usuario.remove()
		res.json({ message: "Usuario Eliminado"})
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});


//Función Obtener Usuario
async function getUsuario(req, res, next){
	let usuario;
	try {
		usuario = await Usuarios.findById(req.params.id);
		if(usuario == null){
			return res.status(404).json({ message: "El usuario no existe" })
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
	console.log(usuario.password);
	res.usuario = usuario;
	next();
}

//------------------------------------------------------------------------------------------------

router.get('/', (req, res, next) =>{
	res.render('home');
});

router.get('/register', (req, res, next) =>{
	res.render('register');
});

router.post('/register', passport.authenticate('local-signup' , {
	successRedirect: '/',
	failureRedirect: '/register',
	failureFlash: true
}));

router.get('/login', (req, res, next) =>{
	res.render('login');
});

router.post('/login', passport.authenticate('local-signin' , {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

router.get('/logout', (req, res, next) =>{
	req.logout();
	res.redirect('/');
});

function getEdad(dateString){
	let fechaAct = new Date();
	let fechaNac = new Date(dateString);
	let edad = fechaAct.getFullYear() - fechaNac.getFullYear();
	let diferenciaMes = fechaAct.getMonth() - fechaNac.getMonth();
	if(diferenciaMes < 0 || diferenciaMes === 0 && fechaAct.getDate() < fechaNac.getDate()){
		edad = edad - 1;
	}
	return edad;
}

router.get('/perfil', isAuthenticated, async (req, res, next) =>{
	const usuario = req.user;
	const persona = await Personas.findOne({usuario: usuario._id});
	res.render('perfil', {
		persona: persona,
		edad: getEdad(persona.nacimiento)
	});
});

router.post('/perfil', isAuthenticated, async (req, res, next) =>{
	const usuario = req.user;
	const persona = await Personas.findOne({usuario: usuario._id});
	const {nombre, apellido, nacimiento, telefono, email, password, image} = req.body;
	console.log(req.body);
	console.log(req.file);
	persona.nombre = nombre;
	persona.apellido = apellido;
	persona.nacimiento = nacimiento;
	persona.telefono = telefono;
	usuario.email = email;
	usuario.password = password;
	if(req.file){
		console.log("Hay imagen");
		const result = await Cloudinary.v2.uploader.upload(req.file.path);
		console.log(result);
		persona.urlimage = result.url;
		persona.public_id = result.public_id;
	}
	await persona.save();
	await usuario.save();
	res.render('perfil', {
		persona: persona,
		edad: getEdad(persona.nacimiento)
	});
});

router.get('/admin/cliente', isAuthenticated, (req, res, next) =>{
	res.render('admin/cliente');
});

router.get('/admin/empleado', isAuthenticated,(req, res, next) =>{
	res.render('admin/empleado');
});

router.get('/admin/servicio', isAuthenticated,(req, res, next) =>{
	res.render('admin/servicio');
});

function isAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
} 

module.exports = router;