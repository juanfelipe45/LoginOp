const moongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new moongoose.Schema({
    local:  {
        name: String,
        lastname: String,
        cellphone: String,
        rol: String,
        email: String,
        password: String,
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    facebook: {
        email: String,
        password: String,
        id: String,
        token: String
    } 
});

userSchema.methods.generateHash = function (password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

userSchema.methods.validatePassword = function(password){
    return bcrypt.compareSync(password, this.local.password);
}

module.exports = moongoose.model('User', userSchema);