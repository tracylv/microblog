
/**
 * Module dependencies.
 */

var express = require('express');
var partials = require('express-partials');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var MongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');
var settings = require('./settings');

var app = express();

// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(partials());
	app.use(express.bodyParser());
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(flash());
	app.use(express.session({
	    secret: settings.cookieSecret,
		store: new MongoStore({ db: settings.db})
	}));
	
	app.use(function(req, res, next){
	    var error = req.flash('error');
        var success = req.flash('success');
        res.locals.error = error.length ? error : null;
        res.locals.success = success.length ? success : null;
	    res.locals.user = req.session.user? req.session.user: null;
		next();
	});
	
	
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/u/:user', routes.checkLogin);
app.get('/u/:user', routes.user);

app.post('/post', routes.checkLogin);
app.post('/post', routes.post);

app.get('/reg', routes.checkNotLogin);
app.get('/reg', routes.reg);

app.post('/reg', routes.checkNotLogin);
app.post('/reg', routes.doReg);

app.get('/login', routes.checkNotLogin);
app.get('/login', routes.login);

app.post('/login', routes.checkNotLogin);
app.post('/login', routes.doLogin);

app.get('/logout', routes.checkLogin);
app.get('/logout', routes.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
