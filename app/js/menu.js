let typeWord = function($location, text, element, begEnd, interval, cursor) {
  if (element === undefined) {
    element = "p";
  }
  if (begEnd === undefined) {
    begEnd = "prepend";
  }
  if (interval === undefined) {
    interval = 40;
  }
  if (cursor === undefined) {
    cursor = "|";
  }
  let newText = document.createElement(element);
  if (begEnd === "prepend") {
    $location.prepend(newText);
  } else {
    $location.append(newText);
  }
  let i=0;
  let testInterval = setInterval(typeOut, interval);
  function typeOut() {
    if (i === text.length+1) {
      clearInterval(testInterval);
    } else {
      if (i === 0) {
        newText.textContent += text[i] + cursor;
        i++;
      } else if (i === text.length) {
        newText.textContent = newText.textContent.slice(0, -1);
        i++;
      } else {
        newText.textContent = newText.textContent.slice(0, -1);
        newText.textContent += text[i] + cursor;
        i++;
      }
    }
  }
}

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

function validateNormalCharacters(string) {
  let valid = true;
  for (let i=0; i < string.length; i++) {
    let character = string[i];
    if (!"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".includes(character)) {
      valid = false;
    }
  }
  return valid;
}

let validateCompletion = function() {
  $("input[type=text]").on("keyup change", function() {
    let $form = $("form").find("input");
    let $submit = $("form").find("button[type=submit]");
    let valid = true;
    $.each( $form, function(key, value) {
      if (!Array.from(value.classList).includes("valid")) {
        valid = false;
      }
    if (valid) {
      $submit.removeClass("disabled");
      $submit.addClass("enabled");
    } else {
      $submit.removeClass("enabled");
      $submit.addClass("disabled");
    }
    });
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

$("#userMail").on("keyup change", function() {
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
  // if new
    // valid if val > 0 && normal characters
  // if join
    // valid if session name exists
});

$('.session').click(function() {
   if($("#createSession").is(':checked') || $("#joinSession").is(':checked')) {
     $(this).addClass("valid");
   } else {
     $(this).removeClass("valid");
   }
});


/*****************************
Specific to waiting room view
*****************************/

let $setup = $("<div>", {id: "setup"});
let $server = $("<ul>", {id: "server"});

$("#playArea").hide();

//# sourceMappingURL=menu.js.map
