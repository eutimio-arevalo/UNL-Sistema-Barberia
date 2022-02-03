const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const User = require('../models/user');
const Persona = require('../models/persona');

passport.serializeUser((user, done) =>{
	done(null, user.id);
});

passport.deserializeUser(async(id, done) =>{
	const user =  await User.findById(id);
	done(null,user);
});

passport.use('local-signup', new localStrategy ({
	usernameField: 'email',
	passportField: 'password',
	passReqToCallback: true
}, async (req, email, password, done) => {

	var nombre = req.body.nombre;
	var apellido = req.body.apellido;
	var nacimiento = req.body.nacimiento;
	var cedula = req.body.cedula;
	var telefono = req.body.telefono;

	const user = await User.findOne({email: email});
	const cliente = await Persona.findOne({ cedula: cedula });
	//console.log('Usuario encontrado: ',user)

	if(user || cliente){
		return done(null, false, req.flash('mensajeRegistrar', 'El usuario ya existe'));
	}else{
		const newPersona = new Persona();
		const newUser = new User();
		newPersona.nombre = nombre;
		newPersona.apellido = apellido;
		newPersona.nacimiento = nacimiento;
		newPersona.cedula = cedula;
		newPersona.telefono = telefono;
		newPersona.urlimage = "https://res.cloudinary.com/djsa7v6bs/image/upload/v1643855173/perfil_pzarxl.jpg";
		newPersona.public_id = "perfil_pzarxl";
		newUser.tipo = "Cliente";
		newUser.email = email;
		newUser.password = password;
		newPersona.usuario = newUser._id;
		console.log('Nuevo usuario creado: ',newPersona)
		await newUser.save();
		await newPersona.save();
		done(null, newUser);
	}
}));

passport.use('local-signin', new localStrategy ({
	usernameField: 'email',
	passportField: 'password',
	passReqToCallback: true
}, async (req, email, password, done) => {
	const user = await User.findOne({email: email});
	if(!user){
		return done(null, false, req.flash('mensajeLogear', 'Usario no encontrado'));
	}
	if(!user.comparePassword(password)){
		return done(null, false, req.flash('mensajeLogear', 'Clave incorrecta'));
	}
	return done(null, user);
}));