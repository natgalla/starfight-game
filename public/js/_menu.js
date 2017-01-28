/********************
Effects
********************/

var carouselCarousel = {

  arrowButtons: true, // set to false if no arrows on your carousel
  carouselID: '',

  init: function (id) {
    carouselCarousel.carouselID = id;
    carouselCarousel.activateCarousels();
  },

  activateCarousels : function () {
    var radios = document.querySelectorAll('#' + carouselCarousel.carouselID +' input[type="radio"]'),
        i = 0,
        l = radios.length;
    if(l && carouselCarousel.arrowButtons) {
      if(l > 1) { // if you have more than one card, add back and forward buttons for sited users
        carouselCarousel.activateForwardAndBack();
      }
      for(i = 0; i < l; i++) {
        radios[i].addEventListener('change', function (e) {
          carouselCarousel.carouselChange(e.target.dataset.value);
        })
      }
    }
  },

  // Activate arrows if there is more than one item and arrows are included
  activateForwardAndBack: function () {
    console.log(arguments.length);
    var arrowButtons = document.querySelectorAll('#' + carouselCarousel.carouselID +' [data-move]'),
        l = arrowButtons.length;
    for (var i = 0; i < l; i++) {
      arrowButtons[i].removeAttribute('hidden');
      arrowButtons[i].addEventListener('click', function(e) {
        carouselCarousel.moveForwardOrBack(e);
      });
      arrowButtons[i].addEventListener('keyup', function(e) {
        if(e.keyCode == 13) {
          carouselCarousel.moveForwardOrBack(e);
        }
      });
    }
  },

  moveForwardOrBack: function (e) {
        var name = e.target.dataset.carousel,
            buttons = document.querySelectorAll('input[name=' + name + ']'),
            move = (e.target.dataset.move == 'forward') ? 1 : -1,
            selectedButton = +document.querySelector('input[name=' + name + ']:checked').dataset.value,
            newValue = (buttons.length + selectedButton + move) % buttons.length;
        buttons[newValue].checked = true;
        carouselCarousel.carouselChange(newValue);
  },

  carouselChange: function (value) {
    document.querySelector('.carousel-labels').setAttribute('class', 'carousel-labels left' + value);
  }
}

$(".title").hide();
$("#subtitle").hide();
$(".title").fadeIn(1200, function() {
  $("#subtitle").slideDown(1000);
});

let header = $('.formHeader').text();
let error = $('.error').text();

$('.menu').hide();
$('.menu').slideDown(500);
$('form').hide();
$('form').fadeIn(800);
$('.formHeader').hide();
$('.error').hide();
$('.tip').hide();

typeWord($('#error'), error, 'p');
typeWord($('#login'), header, 'h3');
typeWord($('#register'), header, 'h3');
typeWord($('#gameMenu'), header, 'h3');
typeWord($('#room'), header, 'h3');
typeWord($('#profile'), header, 'h3');
typeWord($('#error'), header, 'h3');
typeWord($('#logout'), header, 'h3');


/*************************************
FRONT END FORM VALIDATION
*************************************/

$('input').focus(function() {
  let $tip = $(this).closest('div').next('.tip');
  $tip.slideDown();
  $(this).focusout(function() {
    $tip.fadeOut();
  })
});

let validateForm = function() {
  let $form = $('form');
  let $inputs = $form.find('input');
  let $submit = $('button[type=submit]');
  let valid = true;
  $.each( $inputs, function(key, value) {
    if (!Array.from(value.classList).includes('valid')) {
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
    if (!'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.includes(character)) {
      valid = false;
    }
  }
  return valid;
}

let disableForm = function() {
  let $form = $('form');
  let $submit = $form.find('button[type=submit]');
  if ( $submit.hasClass('disabled') ) {
    $form.on('submit', function() {
      $submit.off('click');
      $(this).preventDefault();
    });
  }
}

let validateCompletion = function() {
  $('input').on('keyup change', function() {
    let $form = $('form');
    let $inputs = $form.find('input');
    let $submit = $('button[type=submit]');
    let valid = true;
    $.each( $inputs, function(key, value) {
      if (!Array.from(value.classList).includes('valid')) {
        valid = false;
      }
    });
    if (valid) {
      $submit.removeClass('disabled');
      $submit.addClass('enabled');
    } else {
      $submit.removeClass('enabled');
      $submit.addClass('disabled');
    }
  });
}

$('.enterCallsign').on('keyup change', function() {
  // min/max characters?
  if ( $(this).val().length === 0) {
    $(this).removeClass('invalidEntry');
    $(this).removeClass('valid');
  } else if ( validateNormalCharacters($(this).val()) && $(this).val().length < 9 ) {
    $(this).removeClass('invalidEntry');
    $(this).addClass('valid');
  } else {
    $(this).removeClass('valid');
    $(this).addClass('invalidEntry');
  }
  validateCompletion();
});

$('#email').on('keyup change', function() {
  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  let email = $(this).val();
  if ( $(this).val().length === 0 ){
    $(this).removeClass('invalidEntry');
    $(this).removeClass('valid');
  } else if (validateEmail(email) || email.length === 0) {
    $(this).removeClass('invalidEntry');
    $(this).addClass('valid');
  } else {
    $(this).removeClass('valid');
    $(this).addClass('invalidEntry');
  }
  validateCompletion();
});

let validatePassword = function( $object ) {
  if ( $object.val().length === 0 ) {
    $object.removeClass('invalidEntry');
    $object.removeClass('valid');
  } else if ( $object.val().length > 0 && $object.val().length < 8 ) {
    $object.addClass('invalidEntry');
    $object.removeClass('valid');
  } else {
    $object.removeClass('invalidEntry');
    $object.addClass('valid');
  }
}

$('#password').on('keyup change', function() {
  validatePassword( $(this) );
  if ( $('#passwordConfirm') !== undefined ) {
    if ( $(this).val().length > 7 && $(this).val() === $('#passwordConfirm').val() ) {
      $('#passwordConfirm').removeClass('invalidEntry');
      $('#passwordConfirm').addClass('valid');
    } else if ( $('#passwordConfirm').val().length === 0 ) {
      $('#passwordConfirm').removeClass('invalidEntry');
      $('#passwordConfirm').removeClass('valid');
    } else {
      $('#passwordConfirm').addClass('invalidEntry');
      $('#passwordConfirm').removeClass('valid');
    }
  }
  validateCompletion();
});

$('#passwordConfirm').on('keyup change', function() {
  if ( $(this).val().length === 0 ) {
    $(this).removeClass('valid');
    $(this).removeClass('invalidEntry');
  } else if ( ($(this).val().length > 0 && $(this).val().length < 8) || $(this).val() !== $('#password').val()){
    $(this).removeClass('valid');
    $(this).addClass('invalidEntry');
  } else {
    $(this).removeClass('invalidEntry');
    $(this).addClass('valid');
  }
  validateCompletion();
});

$('#enterPassword').on('keyup change', function() {
  validatePassword( $(this) );
});

$('#sessionName').on('keyup change', function() {
  if ( $(this).val().length === 0 ) {
    $(this).removeClass('valid');
    $(this).removeClass('invalidEntry');
  } else if ( validateNormalCharacters($(this).val()) ) {
    $(this).removeClass('invalidEntry');
    $(this).addClass('valid');
  } else {
    $(this).removeClass('valid');
    $(this).addClass('invalidEntry');
  }
  validateCompletion()
});


/*****************************
Specific to menu view
*****************************/

carouselCarousel.init('pilots');

$('.difficulty').hide();
$('#createSession').on('click', function() {
  $('.difficulty').show();
  $(this).addClass('valid');
  $('#joinSession').addClass('valid');
});
$('#joinSession').on('click', function() {
  $('.difficulty').hide();
  $(this).addClass('valid');
  $('#createSession').addClass('valid');
});

$('#gameInfo').on('submit', function() {
  if (validateNormalCharacters($('#sessionName').val())) {
    console.log($('#sessionName').val());
    window.gameName = $('#sessionName').val();
  }
});


/*****************************
Specific to waiting room view
*****************************/

let $setup = $('<div>', {id: 'setup'});
let $server = $('<ul>', {id: 'server'});

$('#playArea').hide();
