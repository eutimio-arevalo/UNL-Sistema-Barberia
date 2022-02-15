const { Schema, model } = require('mongoose')

const Servicio = model('Servicio', {
	nombre: {type: String, required: true},
	descripcion: {type: String, maxlength:500, unique:true, required: true},
	tipo: {type: String, required: true},
    precio: {type: Number, min: 3, required: true},
	urlimage: {type: String, required:false},
	public_id: {type: String, required:false},
	//departamento : { type: Schema.Types.ObjectId, ref: 'Departamento' , unique:true, required:true}
})


module.exports = Servicio