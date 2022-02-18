const mongoose = require('mongoose');
const { Schema } = mongoose;

const citaSchema = new Schema( {
    fechaCita: { type: String, required: true },
    horaCita: { type: String, required: true },
    estado: { type: String, required: true },
    cliente: { type: String, required: true},
    servicio: {type: String, required: true},
    empleado: { type: String, required: true}
})

module.exports = mongoose.model('cita', citaSchema);