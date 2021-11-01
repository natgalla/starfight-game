// requirements
let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let socketio = require('socket.io');
let User = require('./js/models/user');
let GameSession = require('./js/models/game');
let MongoStore = require('connect-mongo')(session);
// build app
let app = express();
let server = http.createServer(app);
let io = socketio(server);
// globals
let gameTitle = "Starfight";
let root = __dirname;
let port = process.env.PORT || 8080;


// mongodb connection
let localUri = 'mongodb://localhost:27017/starfire';
mongoose.connect(localUri);
let db = mongoose.connection;

// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

// use sessions for tracking logins
app.use(session({
  secret: 'Do a barrel roll!',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// make user ID available in app and templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  res.locals.currentGame = req.session.gameId;
  next();
})

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from root
app.use(express.static(root));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
let routes = require('./js/routes/index');
app.use('/', routes);

// 404 handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  let backUrl;
  let backPrompt;
  if (req.session.userId) {
    backUrl = req.header('Referer') || '/login';
    backPrompt = 'Go back';
  } else {
    backUrl = '/login';
    backPrompt = 'Go to login'
  }
  res.status(err.status || 500);
  res.render('error', {
    gameTitle: gameTitle,
    statusMessage: err.message || 'There was en error processing your request',
    error: {},
    backPrompt: backPrompt,
    backUrl: backUrl
  });
});

server.listen(port, () => console.log('Ready. Listening at http://localhost:' + port));

io.on('connect', onConnection);
