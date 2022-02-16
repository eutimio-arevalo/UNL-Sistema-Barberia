const { Schema, model } = require('mongoose')

const Trabajo = model('Trabajo', {
	descripcion: {type: String, maxlength:500, unique:true, required: true},
	urlimage: {type: String, required:false},
	public_id: {type: String, required:false}
	//departamento : { type: Schema.Types.ObjectId, ref: 'Departamento' , unique:true, required:true}
})


module.exports = Trabajo