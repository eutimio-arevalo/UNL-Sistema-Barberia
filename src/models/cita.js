const mongoose = require('mongoose');
const { Schema } = mongoose;

const citaSchema = new Schema( {
    fechaCita: { type: String, required: true },
    horaCita: { type: String, required: true },
    estado: { type: String, required: true },
    cliente: { type: Schema.Types.ObjectId, ref: 'persona', required: true },
    servicio: { type: Schema.Types.ObjectId, ref: 'servicio', required: true },
    empleado: { type: Schema.Types.ObjectId, ref: 'persona', required: true }
})

module.exports = mongoose.model('cita', citaSchema);