"use strict";

jQuery(function ($) {
  $('#btn-menu-mobile').click(function () {
    $('.menu-mobile-widget').addClass('show-menu-mobile');
    $('.bg-wrapper').addClass('show-bg-wrapper');
  });
  $('#btn-close-menu-mobile').click(function () {
    $('.menu-mobile-widget').removeClass('show-menu-mobile');
    $('.bg-wrapper').removeClass('show-bg-wrapper');
  });
  $(".nav-box").click(function (e) {
    e.stopPropagation();
    var navsub = $(this).find(".sibar-menu-sub-1");

    if ($(this).hasClass('selected') == false) {
      $(".nav-box.selected").removeClass('selected').find('.sibar-menu-sub-1').slideUp('fast');
      $(this).addClass('selected');
      navsub.fadeIn('swing');
    } else {
      $(".nav-box.selected").removeClass('selected').find('.sibar-menu-sub-1').slideUp('fast');
    }
  });
  $(window).click(function (e) {
    if (event.target.className == "bg-wrapper show-bg-wrapper") {
      $(".bg-wrapper").removeClass("show-bg-wrapper");
      $(".menu-mobile-widget").removeClass('show-menu-mobile');
    }
  });
});