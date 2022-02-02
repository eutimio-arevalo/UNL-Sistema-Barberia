const router = require('express').Router();
const passport = require('passport');

const Persona = require('../models/persona');
const user = require('../models/user');

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
	const persona = await Persona.findOne({usuario: usuario._id});
	res.render('perfil', {
		persona: persona,
		edad: getEdad(persona.nacimiento)
	});
});

router.post('/perfil', isAuthenticated, async (req, res, next) =>{
	const usuario = req.user;
	const persona = await Persona.findOne({usuario: usuario._id});
	var nombre = req.body.nombre;
	var apellido = req.body.apellido;
	var nacimiento = req.body.nacimiento;
	var telefono = req.body.telefono;
	var email = req.body.email;
	var password = req.body.password;
	var file = req.body.file;
	console.log("File: ",file);
	if(file){
		console.log("Hay");
	}else{
		console.log("No Hay");
	}
	persona.nombre = nombre;
	persona.apellido = apellido;
	persona.nacimiento = nacimiento;
	persona.telefono = telefono;
	usuario.email = email;
	usuario.password = password;
	// await persona.save();
	// await usuario.save();
	// res.render('perfil', {
	// 	persona: persona,
	// 	edad: getEdad(persona.nacimiento)
	// });
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