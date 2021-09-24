"use strict";

$("#btn-backtotop").click(function () {
  $('body,html').animate({
    scrollTop: 0
  }, 700);
});