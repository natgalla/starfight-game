const Tactical = function(name, cssClass, description) {
  this.name = name;
  this.cssClass = cssClass;
  this.description = description;
  this.type = "basic";
  this.card = "<li class='tactical " + this.cssClass + "'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>" + this.description + "</p>"
            + "</li>";
}

const AdvTactical = function(name, cssClass, description, cost) {
  Tactical.call(this, name, cssClass, description);
  this.cost = cost;
  this.type = "advanced";
  this.card = "<li class='advTactical " + this.cssClass + "'>"
              + "<h3>" + this.name + "</h3>"
              + "<p>" + this.description + "</p>"
              + "<p class='cost'>Merit cost: " + this.cost + "</p>"
              + "</li>"
}
AdvTactical.prototype = Object.create(Tactical.prototype);

AdvTactical.prototype.generateCard = function(player) {
  if (player.merit >= this.cost) {
    return "<li class='advTactical " + this.cssClass + " purchasable'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>" + this.description + "</p>"
            + "<p class='cost'> Merit cost: " + this.cost + "</p>"
            + "</li>";
  } else {
    return "<li class='advTactical " + this.cssClass + " unavailable'>"
            + "<h3>" + this.name + "</h3>"
            + "<p>" + this.description + "</p>"
            + "<p class='cost'> Merit cost: " + this.cost + "</p>"
            + "</li>";
  }
}
