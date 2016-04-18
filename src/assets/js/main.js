(function ($, window, document, undefined) {
  'use strict';

  $(function () {

    /**
     * Get a random integer between `min` and `max`.
     *
     * @param {number} min - min number
     * @param {number} max - max number
     * @return {int} a random integer
     */
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Validate a URL input
     *
     * @param {string} text - the url to validate
     * @return {boolean} true or false
     */
    function validateURL(text) {
      var urlregex = new RegExp(
            "^(http:\/\/www.|https:\/\/www.|ftp:\/\/www.|www.){1}([0-9A-Za-z]+\.)");
      return urlregex.test(text);
    }

    $('a[data-breakpoint]').on('click', function(e) {
      e.preventDefault();

      var breakpoint = $(this).data('breakpoint');

      if(breakpoint === 'random') {
        // let's create a random number. the max is the width of the document.
        breakpoint = getRandomInt(320, $(document).width());
      }

      $('#screen-size').animate({
        width: breakpoint+'px'
      });
    });

    $('#site-input').on('submit', function(e) {
      e.preventDefault();

      var value = $('input[name=url]').val();

      // if input is a valid URL
      if(validateURL(value)) {

        // remove any errors
        $('.site-input__wrapper').removeClass('form-error');

        // let's update the iFrame with the new src. prepend http:// if missing.
        if (!/^http:\/\//.test(value)) {
          value = "http://" + value;
        }

        $('.iframe__wrapper iframe').attr('src', value);
      } else {
        $('.site-input__wrapper').addClass('form-error');
      }

    });

  });
})(jQuery, window, document);
