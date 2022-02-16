const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const { format } = require('timeago.js');

//Inicializar
const app = express();

app.use('/public', express.static(__dirname+'/public'));

require('./database');
require('./passport/local-auth');

//Configuración
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);


//Middlewares

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
const storage = multer.diskStorage({
	destination: path.join(__dirname, 'public/uploads'),
	filename: (req, file, cb, filename) => {
		console.log(file);
		cb(null, uuid() + path.extname(file.originalname));
	}
});
app.use(multer({storage}).single('image'));

app.use(session({
	secret: 'mysecretsession',
	resave: false,
	saveUninitialized: false
})); 
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	app.locals.mensajeRegistrar = req.flash('mensajeRegistrar');
	app.locals.mensajeLogear = req.flash('mensajeLogear');
	app.locals.user = req.user;
	next();
});

//
app.use((req, res, next) =>{
	app.locals.format = format;
	next();
});


//Routes
app.use('/', require('./routes/routes'));
app.use('/', require('./routes/rest-api'));
//Inicializar el server
app.listen(app.get('port'), () =>{
	console.log('Servidor encendido');
});