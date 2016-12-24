/********************
Effects
********************/

$(".menu").hide();
$(".menu").slideDown(500);
$("form").hide();
$("form").fadeIn(800);
$(".formHeader").hide();
typeWord($('#login'), "Pilot log in", "h3");
typeWord($('#register'), "New Pilot Registry", "h3");
typeWord($('#gameMenu'), "Enter or join session", "h3");

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
