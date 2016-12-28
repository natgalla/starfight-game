let parser = require("body-parser");

app.set("view engine", "pug");
app.set("views", __dirname + "/views");


// Login view
app.get("/", function(req, res) {
  res.redirect("/login");
});

app.get("/login", function(req, res) {
  res.render('login');
});

app.post("/login", function(req, res) {
  res.redirect("/menu");
});


// Register view
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


// Menu view
app.get("/menu", function(req, res) {
  res.render('menu');
});

app.post("/menu", function(req, res) {
  let body;
  req.on("data", function(chunk) {
    body += chunk;
  });
  req.on("end", function() {
    console.log(body);
    res.redirect('game');
  });
});


// Game view
app.get("/game", function(req, res) {
  res.render("game");
});


// error
app.get("/error", function(req, res) {
  res.render("error", {
    statusCode: "Status code",
    statusMessage: "Status message"
  });
})
