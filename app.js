var createError = require('http-errors');
var express = require('express');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var allRouter = require('./routes/all');

var app = express();
var writer = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a+' });


app.title = "zigzag"
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Page Title' });
});

app.post('/en', function(req, res, next) {
	//writer.write( JSON.stringify(req.body))
	console.log( JSON.stringify(req.body) )
	res.set({
	  'application/json': 'text/json'
	})
	res.sendFile('en.js')
});

app.use('/pul', function(req, res, next) {
	var save_val = JSON.stringify([ req.query, req.body])
	writer.write( save_val +"\n")
	console.log( save_val )
	
	res.json(save_val)  
});
/*
app.use('/all', function(req, res, next) {
	
	const directoryPath = path.join(__dirname, 'public');
	var file_list = []
	fs.readdir(directoryPath, (err, files) => {
	  	  res.render('all', { title: 'Page Title' });
	});
 
	


});
*/
app.use('/all', allRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
