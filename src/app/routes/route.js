var forgotController = require('../controllers/forgot');

module.exports = (app, passport, recaptcha) => {

    //get routings
    app.get('/',(req,res) => {
        res.render('index');
    });
    app.get('/login', recaptcha.middleware.render ,(req,res) => {
        res.render('login',{
            message: req.flash('loginMessage'),
            captcha: req.captcha,
            userName: req.cookies.userName
        });
        console.log('Cookies: ', req.cookies.userName);
    });
    app.get('/signup', recaptcha.middleware.render, (req,res) => {
        res.render('signup',{
            message: req.flash('signupMessage'),
            captcha: req.captcha
        });
    });

    app.get('/profile', isLoggedIn, (req,res) => {
        if (req.user.local.rol === "cliente") {
            res.render('profile', {
                user: req.user
            });
        }else if (req.user.local.rol === "administrador"){
            res.render('admin/profile-admin', {
                user: req.user
            });
        }
    });
    app.get('/profile/register',isLoggedIn, (req, res) => {
        res.render('admin/register',{
            message: req.flash('registerMessage'),
            user: req.user
        });
    });

    app.get('/logout', (req,res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/forgot', (req, res) => {
        res.render('forgot',{
            message: req.flash('forgotMessage')
        });
    });
    app.get('/reset/:token', forgotController.TokenExpire);
    app.get('/profile/client',isLoggedIn,forgotController.getUsers);
    app.get('/client/:id', (req, res) => {
        res.render('admin/update', {
            user: req.user
        });
    })
    

    //post routings
    app.post('/login', recaptcha.middleware.verify, captchaVerificationlogin, passport.authenticate('local-login',{
        failureRedirect: '/login',
        failureFlash: true
    }), remember);
    app.post('/signup',  recaptcha.middleware.verify, captchaVerificationsignup, passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));
    app.post('/forgot',  passport.authenticate('local-forgot',{
        successRedirect: '/forgot',
        failureRedirect: '/forgot',
        failureFlash: true
    }));

    app.post('/register',  passport.authenticate('local-register',{
        successRedirect: '/register',
        failureRedirect: '/register',
        failureFlash: true
    }));

    app.post('/reset/:token', forgotController.equalsPassword, forgotController.TokenExpires,passport.authenticate('local-reset', {
        successRedirect: '/login',
        failureRedirect: 'back',
        failureFlash: true
    }));
};

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    return res.redirect('/');
}

function captchaVerificationlogin(req, res, next) {
    if (req.recaptcha.error) {
        req.flash('loginMessage','reCAPTCHA incorrecta');
        res.redirect('/login');
    } else {
            return next();
    }
}
function captchaVerificationsignup(req, res, next) {
    if (req.recaptcha.error) {
        req.flash('signupMessage','reCAPTCHA incorrecta');
        res.redirect('/signup');
    } else {
        return next();
    }
}

function remember( req, res ){
    if (req.body.remember){
        res.cookie('userName', req.body.email, {expires: new Date(Date.now()+900000), httpOnly: true})
    }else{
        res.clearCookie('userName');
    }
    res.redirect('/profile');
}