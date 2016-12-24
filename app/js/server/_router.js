app.set("view engine", "pug");
app.set("views", __dirname + "/../views");

app.get("/", function(req, res) {
  res.redirect("/login");
});

app.get("/register", function(req, res) {
  res.render('register');
});

app.get("/login", function(req, res) {
  res.render('login');
});

app.get("/menu", function(req, res) {
  res.render('menu');
});

app.get("/game", function(req, res) {
  res.render('game');
});
