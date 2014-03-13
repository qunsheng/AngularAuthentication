/************************************************************** 
 * 
 * An Express server using passport to provide server side authentication
 * 
 **************************************************************/ 
var express = require('express')
  , http = require('http')
  , path = require('path');

//==================================================================
//Follow the instruction of http://passportjs.org/guide/configure/
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//==================================================================
//Define the strategy to be used by PassportJS
passport.use(new LocalStrategy(
	function(username, password, done) 
	{
	  console.log("Local strategy check username and password: "+username +"/"+password);
	  if (username === "admin" && password === "admin") // stupid example
	  {
		  console.log("authenticated, call function done...");
		  return done(null, {name: "admin"});
	  }
	    
	  console.log("authentication failed, call function done...");
	  return done(null, false, { message: 'Incorrect username.' });
	}
));

//Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
  console.log("serialize user: ",user);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log("deserialize user: ",user);
  done(null, user);
});

//Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
	console.log("check req.isAuthenticated(): "+  req.isAuthenticated());
	if (!req.isAuthenticated()) {
		console.log("Not authenticated, send 401...");
		res.send(401);
	}		
	else{
		console.log("authenticated, call next()...");
		next();
	}		
};
//==================================================================

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
// cookie parser
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
// session
app.use(express.session({ secret: 'securedsession' }));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//==================================================================
//routes
app.get('/', function(req, res){
	res.render('index', { title: 'Express' });
});

app.get('/users', auth, function(req, res){
	res.send([{name: "user1"}, {name: "user2"}]);
});
//==================================================================


//==================================================================
//route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
	console.log("process GET /loggedin...");
	res.send(req.isAuthenticated() ? req.user : '0');
});

//route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
	console.log("process POST /login...");
	res.send(req.user);
});

//route to log out
app.post('/logout', function(req, res){
	console.log("process POST /logout, call req.logOut()...");
	req.logOut();
	res.send(200);
});
//==================================================================

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
