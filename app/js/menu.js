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

function validateCompletion($input, validity) {
  if ($input.val().length > 0 && valid) {
    $(".submit").addClass("enabled");
    $(".submit").removeClass("disabled");
  } else {
    $(".submit").addClass("disabled");
    $(".submit").removeClass("enabled");
  }
}

$("#createCallsign").on("keyup change", function() {
  if ( validateNormalCharacters($(this).val()) ) {
    $(this).removeClass("invalidEntry");
  } else {
    $(this).addClass("invalidEntry");
  }
});

$("#userMail").on("keyup change", function() {
  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  let email = $(this).val();
  if(validateEmail(email) || email.length === 0) {
    $(this).removeClass("invalidEntry");
  } else {
    $(this).addClass("invalidEntry");
  }
});

$("#passwordCreate").on("keyup change", function() {
  if ( $(this).val().length > 0 && $(this).val().length < 8 ) {
    $(this).addClass("invalidEntry");
  } else {
    $(this).removeClass("invalidEntry");
  }
  if ( $(this).val().length > 7 && $(this).val() === $("#passwordConfirm").val() ) {
    $("#passwordConfirm").removeClass("invalidEntry");
  }
});

$("#passwordConfirm").on("keyup change", function() {
  if ( ($(this).val().length > 0 && $(this).val().length < 8) || $(this).val() !== $("#passwordCreate").val()){
    $(this).addClass("invalidEntry");
  } else {
    $(this).removeClass("invalidEntry");
  }
});

$("#sessionName").on("keyup change", function() {
  if ( validateNormalCharacters($(this).val()) ) {
    $(this).removeClass("invalidEntry");
  } else {
    $(this).addClass("invalidEntry");
  }
});


/*****************************
Specific to waiting room view
*****************************/

let $setup = $("<div>", {id: "setup"});
let $server = $("<ul>", {id: "server"});

$("#playArea").hide();

//# sourceMappingURL=menu.js.map
