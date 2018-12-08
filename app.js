const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// ROUTES FOR OUR API
app.use('/', require('./routes'));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (process.env.NODE_ENV === "dev") {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            success: false,
            data: err.data,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        success: false,
        data: err.data,
        error: {}
    });
});


//Start server
app.listen(process.env.PORT,function () {
    console.log('Server is running at port:' + process.env.PORT);
});
