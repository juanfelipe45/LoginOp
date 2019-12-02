const express = require('express');
const app = express();

const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyparser = require('body-parser');
const session = require('express-session');
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const MongoStore = require('connect-mongo')(session);
const fs = require('fs');

const { url } = require('./config/database');
var recaptcha = new Recaptcha('6LdlkLgUAAAAAAsYfdjwkj_dr_Kkwt_j-kp439Mr','6LdlkLgUAAAAADa_r3Azq7dM-kIAWmD4d4cvfbi5');

mongoose.connect(url ,  {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

require('./config/passport')(passport);


// settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middelwares
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(session({
    secret: 'Juan Felipe',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes
require('./app/routes/route')(app, passport, recaptcha)

// static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), (err) =>{
    if(!err){
        console.log("Server on port: "+ app.get('port'));
    }else{
        console.log("I can't hear the port");
    }
});

app.get('**', (req,res) =>{
    res.send("Error 404: Page Not Found");
});