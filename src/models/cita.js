const { Schema, model } = require('mongoose')

const Cita = model('Cita', {
    fechaCita: {type: String,required: true},
    estado: {type: String, required: true},
	cliente : { type: Schema.Types.ObjectId, ref: 'persona' , unique:true, required:true},
    servicio : { type: Schema.Types.ObjectId, ref: 'servicio' , unique:true, required:true},
    empleado : { type: Schema.Types.ObjectId, ref: 'persona' , unique:true, required:true}
})

module.exports = Cita