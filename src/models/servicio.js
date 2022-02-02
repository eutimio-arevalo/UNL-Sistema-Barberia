const { Schema, model } = require('mongoose')

const Servicio = model('Servicio', {
	nombre: {type: String, required: true},
	descripcion: {type: String, minlength:200 , maxlength:500, unique:true, required: true},
	tipo: {type: String, required: true},
    precio: {type: Number, min: 5, required: true}
	//departamento : { type: Schema.Types.ObjectId, ref: 'Departamento' , unique:true, required:true}
})


module.exports = Servicio