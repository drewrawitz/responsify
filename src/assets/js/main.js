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

    $('a[data-breakpoint]').on('click', function(e) {
      e.preventDefault();

      var breakpoint = $(this).data('breakpoint');

      if(breakpoint === 'random') {
        // let's create a random number. the max is the width of the document.
        breakpoint = getRandomInt(320, $(document).width());
        console.log(breakpoint);
      }

      $('#screen-size').animate({
        width: breakpoint+'px'
      });
    });

  });
})(jQuery, window, document);
