app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.get("/", function(req, res) {
  res.redirect("/login");
});

app.get("/register", function(req, res) {
  res.render('register');
});

app.post("/register", function(req, res) {
  let body;
  req.on("data", function(chunk) {
    body += chunk;
  });
  req.on("end", function() {
    console.log(body);
    res.render('registered');
  });
});

app.get("/login", function(req, res) {
  res.render('login');
});

app.post("/login", function(req, res) {
  res.redirect("/menu");
});

app.get("/menu", function(req, res) {
  res.render('menu');
});

app.post("/menu", function(req, res) {
  res.redirect("/game");
});

app.get("/game", function(req, res) {
  res.render('game');
});
