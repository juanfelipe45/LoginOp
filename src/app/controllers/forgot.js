'use strict'

const User = require('../models/user');


function TokenExpire(req, res){
    User.findOne({'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': {$gt: Date.now()}}, (err, user) => {
        if (!user) {
            req.flash('forgotMessage', 'El token para cambio de contraseña expiro o es invalido');
            return res.redirect('/forgot');
          }
          res.render('reset', {
            user: req.user,
            message: req.flash('resetMessage'),
          });
    })
}

function TokenExpires(req, res, next){
  User.findOne({'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': {$gt: Date.now()}}, (err, user) => {
      if (!user) {
          req.flash('forgotMessage', 'El token para cambio de contraseña expiro o es invalido');
          return res.redirect('/forgot');
        }else{
          next();
        }
  })
}

function equalsPassword(req, res, next){
  if (req.param('newPassword') === req.param('confirmPassword')){
    return next();
  }else{
    req.flash('resetMessage', 'Las contraseñas no son iguales');
    return res.redirect('back');
  }
}

function getUsers(req,res, ){

  User.find({},(err, users) => {
      if(err){
        throw err;
      }else{
          if(!users){
            req.flash('usersMessage', 'No existen usuarios');
            return res.redirect('back');
          }else{
            res.render('admin/clients', {
              users,
              user : req.user,
              message: req.flash('userMessage'),
            });
          }
      }
  });
}

function updateUser(req,res){

  var userId = req.params.id;
  var update = req.body;

  Album.findByIdAndUpdate(userId,update,(err, userUpdate) => {
      if(err){
          throw err;
      }else{
          if(!userUpdate){
            req.flash('updateMessage', 'No existen usuarios');
          }else{
            req.flash('usersMessage', 'El usuario fue actualizado');
          }
      }

  });
}

module.exports = {
    TokenExpire,
    TokenExpires,
    equalsPassword,
    getUsers,
    updateUser
}