const router = require('express').Router();
const Usuarios = require('../models/user');
const Personas = require('../models/persona');
const Servicios = require('../models/servicio');
const Citas = require('../models/cita');


//Obtener todos
router.get('/rest-api/usuarios/', async (req, res) => {
	try {
		const usuarios = await Usuarios.find();
		res.json(usuarios);
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.get('/rest-api/personas/', async (req, res) => {
	try {
		const usuarios = await Personas.find();
		res.json(usuarios);
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.get('/rest-api/personas/clientes/', async (req, res) => {
	try {
		const usuarios = await Usuarios.find({ tipo: "Cliente" });
		const ids = [];
		usuarios.forEach(auxi => {
			ids.push(auxi._id);
		});
		const personas = await Personas.find({ usuario: { $in: ids } });
		res.json(personas)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.get('/rest-api/personas/empleados/', async (req, res) => {
	try {
		const usuarios = await Usuarios.find({ tipo: "Empleado" });
		const ids = [];
		usuarios.forEach(auxi => {
			ids.push(auxi._id);
		});
		const personas = await Personas.find({ usuario: { $in: ids } });
		res.json(personas)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});


router.get('/rest-api/servicios/', async (req, res) => {
	try {
		const servicio = await Servicios.find();
		res.json(servicio);
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});

router.get('/rest-api/citas/', async (req, res) => {
	try {
		const citas = await Citas.find();
		res.json(citas);
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
});


//Obtener uno
router.get('/rest-api/usuarios/:id', getUsuario, (req, res) => {
	res.send(res.usuario)
});

router.get('/rest-api/personas/:id', getPersona, (req, res) => {
	res.send(res.usuario)
});

router.get('/rest-api/servicios/:id', getServicio, (req, res) => {
	res.send(res.usuario)
});

router.get('/rest-api/citas/:id', getCita, (req, res) => {
	res.send(res.usuario)
});


//Crear uno
router.post('/rest-api/personas', async (req, res) => {
	const user = await Usuarios.findOne({ email: req.body.email });
	const persona = await Personas.findOne({ cedula: req.body.cedula });
	try {
		if (user) {
			res.status(404).json({ message: "El usuario ya existe" })
		} else if (persona) {
			res.status(404).json({ message: "La persona ya existe" })
		} else {
			const newUser = new Usuarios();
			const newPersona = new Personas();
			newUser.tipo = "Cliente";
			newUser.email = req.body.email;
			newUser.password = req.body.password;
			newPersona.nombre = req.body.nombre;
			newPersona.apellido = req.body.apellido;
			newPersona.nacimiento = req.body.nacimiento;
			newPersona.cedula = req.body.cedula;
			newPersona.telefono = req.body.telefono;
			newPersona.usuario = newUser._id;
			newPersona.urlimage = "https://res.cloudinary.com/djsa7v6bs/image/upload/v1643855173/perfil_pzarxl.jpg";
			newPersona.public_id = "perfil_pzarxl";
			await newUser.save();
			await newPersona.save();
			res.status(200).send(newPersona);
		}
	} catch (error) {
		res.status(400).json({ message: error.message });
	}

});

router.post('/rest-api/citas', async (req, res) => {
	try {

		const newCita = new Citas();
		newCita.fechaCita = req.body.fechaCita;
		newCita.estado = req.body.estado;
		newCita.cliente = req.body.cliente;
		newCita.servicio = req.body.servicio;
		newCita.empleado = req.body.empleado;
		await newCita.save();
		res.status(200).send(newCita);

	} catch (error) {
		res.status(400).json({ message: error.message });
	}

});


//Actualizar uno
router.patch('/rest-api/usuarios/:id', getUsuario, async (req, res) => {
	console.log(res.usuario)
	if (req.body.email != null) {
		res.usuario.email = req.body.email;
	}
	if (req.body.password != null) {
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
router.delete('/rest-api/usuarios/:id', getUsuario, async (req, res) => {
	try {
		await res.usuario.remove()
		res.json({ message: "Usuario Eliminado" })
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.delete('/rest-api/servicios/:id', getServicio, async (req, res) => {
	try {
		await res.usuario.remove()
		res.json({ message: "Servicio Eliminado" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});


//Función Obtener Usuario
async function getUsuario(req, res, next) {
	let usuario;
	try {
		usuario = await Usuarios.findById(req.params.id);
		if (usuario == null) {
			return res.status(404).json({ message: "El usuario no existe" })
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
	console.log(usuario.password);
	res.usuario = usuario;
	next();
}

async function getPersona(req, res, next) {
	let usuario;
	try {
		usuario = await Personas.findById(req.params.id);
		if (usuario == null) {
			return res.status(404).json({ message: "La Persona no existe" })
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
	console.log(usuario.password);
	res.usuario = usuario;
	next();
}

async function getServicio(req, res, next) {
	let usuario;
	try {
		usuario = await Servicios.findById(req.params.id);
		if (usuario == null) {
			return res.status(404).json({ message: "El servicio no existe" })
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
	console.log(usuario.password);
	res.usuario = usuario;
	next();
}

async function getCita(req, res, next) {
	let usuario;
	try {
		usuario = await Citas.findById(req.params.id);
		if (usuario == null) {
			return res.status(404).json({ message: "La cita no existe" })
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
	console.log(usuario.password);
	res.usuario = usuario;
	next();
}


module.exports = router;