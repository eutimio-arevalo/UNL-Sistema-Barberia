const mongoose = require('mongoose');
const { Schema } = mongoose;

const personaSchema = new Schema({
	nombre: {type: String, required: true},
    apellido: {type: String, required: true},
	nacimiento: {type: String, required: true},
	cedula: {type: String, unique:true},
	telefono: {type: String, unique:true},
	urlimage: {type: String, required:false},
	public_id: {type: String, required:false},
	usuario : { type: Schema.Types.ObjectId, ref: 'usuario' , required:true}
});


module.exports = mongoose.model('persona', personaSchema);