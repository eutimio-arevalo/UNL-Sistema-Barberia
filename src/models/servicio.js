const mongoose = require('mongoose');
const { Schema } = mongoose;

const servicioSchema = new Schema({
	nombre: {type: String, required: true},
	descripcion: {type: String, maxlength:500, unique:true, required: true},
	tipo: {type: String, required: true},
    precio: {type: Number, max: 100},
	urlimage: {type: String, required:false},
	public_id: {type: String, required:false},
	//departamento : { type: Schema.Types.ObjectId, ref: 'Departamento' , unique:true, required:true}
})


module.exports = mongoose.model('servicio', servicioSchema);