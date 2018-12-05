const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');


mongoose.Promise = global.Promise;
const options = { server: {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000
    }
}

require('dotenv').config({ path: 'variables.env' });

//mongoose.connect(process.env.DEV_DB,options);
mongoose.connect(process.env.DATABASE, options);
mongoose.connection.on('error', (err) => {
  console.log('ERROR:',err.message);
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
//app.use(fbLogin);
app.set('layout', 'layouts/default');
app.set('layout extractScripts', true);

//Production
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  store: new RedisStore
}));

app.use(flash());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// ROUTES FOR OUR API
app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  if(process.env.NODE_ENV === 'dev'){
    next(err);
  } else {
    res.render('errors/404');
  }
});

// error handler
app.use(function(err, req, res, next) {
  if(process.env.NODE_ENV === 'dev'){
    res.locals.error = err;
    res.status(err.status || 500);
    res.render('errors/error');
  } else {
    res.render('errors/5xx');
  }
});


//Start server
app.listen(process.env.PORT,function () {
    console.log('Server is running at port:' + process.env.PORT);
});
