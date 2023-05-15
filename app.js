var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
const upd = require("./controller/updateController")

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'wyf',
    name: "name",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true
}))

app.use('/api', indexRouter);

upd.start()

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error');
    // res.json({
    //     code: err.status,
    //     message: res.locals.message,
    //     data: null
    // })
    res.send('error')
});

module.exports = app;