/********************
Effects
********************/

let header = $(".formHeader").text();

$(".menu").hide();
$(".menu").slideDown(500);
$("form").hide();
$("form").fadeIn(800);
$(".formHeader").hide();

typeWord($('#login'), header, "h3");
typeWord($('#register'), header, "h3");
typeWord($('#gameMenu'), header, "h3");
typeWord($("#room"), header, "h3");
typeWord($("#error"), header, "h3");

/*************************************
FRONT END FORM VALIDATION
*************************************/

let validateForm = function() {
  let $form = $("form");
  let $inputs = $form.find("input").not("input[type=radio]");
  let $submit = $("button[type=submit]");
  let valid = true;
  $.each( $inputs, function(key, value) {
    if (!Array.from(value.classList).includes("valid")) {
      valid = false;
    }
  });
  if (valid) {
    return true;
  } else {
    return false;
  }
}

let validateNormalCharacters = function(string) {
  let valid = true;
  for (let i=0; i < string.length; i++) {
    let character = string[i];
    if (!"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".includes(character)) {
      valid = false;
    }
  }
  return valid;
}

let disableForm = function() {
  let $form = $("form");
  let $submit = $form.find("button[type=submit]");
  if ( $submit.hasClass("disabled") ) {
    $form.on("submit", function() {
      $submit.off("click");
      $(this).preventDefault();
    });
  }
}

let validateCompletion = function() {
  $("input").on("keyup change", function() {
    let $form = $("form");
    let $inputs = $form.find("input").not("input[type=radio]");
    let $submit = $("button[type=submit]");
    let valid = true;
    $.each( $inputs, function(key, value) {
      if (!Array.from(value.classList).includes("valid")) {
        valid = false;
      }
    });
    if (valid) {
      $submit.removeClass("disabled");
      $submit.addClass("enabled");
    } else {
      $submit.removeClass("enabled");
      $submit.addClass("disabled");
    }
  });
}

$(".enterCallsign").on("keyup change", function() {
  // min/max characters?
  if ( $(this).val().length === 0) {
    $(this).removeClass("invalidEntry");
    $(this).removeClass("valid");
  } else if ( validateNormalCharacters($(this).val()) ) {
    $(this).removeClass("invalidEntry");
    $(this).addClass("valid");
  } else {
    $(this).removeClass("valid");
    $(this).addClass("invalidEntry");
  }
  validateCompletion();
});

$("#email").on("keyup change", function() {
  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  let email = $(this).val();
  if ( $(this).val().length === 0 ){
    $(this).removeClass("invalidEntry");
    $(this).removeClass("valid");
  }
  else if (validateEmail(email) || email.length === 0) {
    $(this).removeClass("invalidEntry");
    $(this).addClass("valid");
  } else {
    $(this).removeClass("valid");
    $(this).addClass("invalidEntry");
  }
  validateCompletion();
});

$(".enterPassword").on("keyup change", function() {
  if ( $(this).val().length === 0 ) {
    $(this).removeClass("invalidEntry");
    $(this).removeClass("valid");
  } else if ( $(this).val().length > 0 && $(this).val().length < 8 ) {
    $(this).addClass("invalidEntry");
    $(this).removeClass("valid");
  } else {
    $(this).removeClass("invalidEntry");
    $(this).addClass("valid");
  }
  if ( $(this).val().length > 7 && $(this).val() === $("#passwordConfirm").val() ) {
    $("#passwordConfirm").removeClass("invalidEntry");
    $("#passwordConfirm").addClass("valid");
  }
  validateCompletion();
});

$("#passwordConfirm").on("keyup change", function() {
  if ( $(this).val().length === 0 ) {
    $(this).removeClass("valid");
    $(this).removeClass("invalidEntry");
  } else if ( ($(this).val().length > 0 && $(this).val().length < 8) || $(this).val() !== $("#passwordCreate").val()){
    $(this).removeClass("valid");
    $(this).addClass("invalidEntry");
  } else {
    $(this).removeClass("invalidEntry");
    $(this).addClass("valid");
  }
  validateCompletion();
});

$("#sessionName").on("keyup change", function() {
  if ( $(this).val().length === 0 ) {
    $(this).removeClass("valid");
    $(this).removeClass("invalidEntry");
  } else if ( validateNormalCharacters($(this).val()) ) {
    $(this).removeClass("invalidEntry");
    $(this).addClass("valid");
  } else {
    $(this).removeClass("valid");
    $(this).addClass("invalidEntry");
  }
  validateCompletion()
  // if new
    // valid if val > 0 && normal characters
  // if join
    // valid if session name exists
});


/*****************************
Specific to menu view
*****************************/
$(".difficulty").hide();
$("#createSession").on("click", function() {
  $(".difficulty").show();
});
$("#joinSession").on("click", function() {
  $(".difficulty").hide();
});

/*****************************
Specific to waiting room view
*****************************/

let $setup = $("<div>", {id: "setup"});
let $server = $("<ul>", {id: "server"});

$("#playArea").hide();
