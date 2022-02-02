const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
	email: String,
	password: String,
	tipo: String,
});

userSchema.methods.comparePassword = function (password){
	return (password == this.password) ? true : false;
}

module.exports = mongoose.model('usuario', userSchema);