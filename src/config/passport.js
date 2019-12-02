const localStrategy = require('passport-local').Strategy;

const User = require('../app/models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    //signup
    passport.use('local-signup', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            User.findOne({ 'local.email': email }, function (err, user) {
                if (err) { return done(err); }
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'El correo ya existe'));
                } else {
                    var newUser = new User();
                    newUser.local.name = req.param('name');
                    newUser.local.lastname = req.param('lastname');
                    newUser.local.cellphone = req.param('cell');
                    newUser.local.rol = req.param('rol');
                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.save(function (err) {
                        if (err) { throw err; }
                        return done(null, newUser);
                    });
                }
            });
        }));

        passport.use('local-register', new localStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
            function (req, email, password, done) {
                User.findOne({ 'local.email': email }, function (err, user) {
                    if (err) { return done(err); }
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'El correo ya existe'));
                    } else {
                        var newUser = new User();
                        newUser.local.name = req.param('name');
                        newUser.local.lastname = req.param('lastname');
                        newUser.local.cellphone = req.param('cell');
                        newUser.local.rol = req.param('rol');
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.save(function (err) {
                            if (err) { throw err; }
                            return done(null, newUser, req.flash('registerMessage', 'Registro exitoso'));
                        });
                    }
                });
            }));
    //Login
    passport.use('local-login', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            User.findOne({ 'local.email': email }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'Usuario o contraseña incorrecta'));
                }
                if (!user.validatePassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Usuario o contraseña incorrecta'));
                }
                return done(null, user);
            });
        })
    );

    //forgot
    passport.use('local-forgot', new localStrategy({
        usernameField: 'email',
        passReqToCallback: true
    },function (req, email, password, done) {
        User.findOne({ 'local.email': email }, (err, user) => {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, req.flash('forgotMessage', 'El correo no esta registrado'));
            }
            crypto.randomBytes(20,(err, buf) => {
                if (err) {throw err}
                var Token = buf.toString('hex');
                User.findById(user._id,(err,userUpdate) => {
                    if (err){
                        return done(null, false, req.flash('forgotMessage', 'Ops ha ocurrido un error'));
                    }else if (!userUpdate) {
                        return done(null, false, req.flash('forgotMessage', 'No pude Encontrar el id'));
                    }else {
                        userUpdate.local.resetPasswordToken = Token;
                        userUpdate.local.resetPasswordExpires = Date.now() + 3600000;
                        userUpdate.save((err) => {
                            if (err) {throw err;}
                            console.log(userUpdate);
                            var stmpTransport = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'youremail@correo.com',
                                    password: 'Yourpassword'
                                }
                            });
                            var mailOptions = {
                                to: userUpdate.local.email,
                                from: 'loginOP@correo.com',
                                subject: 'Recuperar Clave del Login Op',
                                text: 'Esta recibiendo este correo porque se hizo una solicitud de restablecer la contraseña de su cuenta en Login Op \n\n'+
                                'Por Favor clikee en el siguiente link o copie la url en su navegador para completar el porceso '+
                                'http://' + req.headers.host + '/reset/' + Token + '\n\n'+
                                'Si usted no solicito el cambio de contraseña haga caso omiso a este mensaje. Este link solo tendra vigencia durate una hora.'
                            };
                            stmpTransport.sendMail(mailOptions, (err,info) => {
                                if (err){throw err}
                                return done(null, userUpdate, req.flash('forgotMessage', 'Un email fue enviado a ' + userUpdate.local.email + ' con futuras instrucciones'));
                            });
                        })
                    }
                });
            });
        });
    }));

    // reset
    passport.use('local-reset', new localStrategy({
        usernameField: 'email',
        passwordField: 'newPassword',
        passReqToCallback: true
    },(req, email, password, done) => {
        User.findOne({'local.resetPasswordToken': req.params.token},(err,userUpdate) => {
            if (err) {return done(err);}
            if (!userUpdate) {
                return done(null,false, req.flash('resetMessage', 'Hubo un error en el servidor'));
            }else {
                userUpdate.local.password =  userUpdate.generateHash(password);
                userUpdate.local.resetPasswordToken = undefined;
                userUpdate.local.resetPasswordExpires = undefined;
                userUpdate.save((err) => {
                    if (err) {throw err;}
                    return done(null, userUpdate, req.flash('loginMessage', 'El cambio de contraseña fue exitoso'));
                });
            }
        });
    }
    ));    
}
