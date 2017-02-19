/*
 * Title: Utilities
 * Description: Utilities
 *
 */


define('utilities', ['jquery', 'SVGInjector'], function ($, SVGInjector) {
  'use strict';

  return {
    initSVGInjector: function() {
      // svg-inject options
      var options = {
        each: function (svg) {
          if (!$(svg).parent().hasClass('Icon--full')) {
            svg.setAttribute('viewBox', '13 13 24 24'); // 13 instead of 12 to vertical-align icons: middle in relation to the text.
          }
        }
      };

      new SVGInjector(document.querySelectorAll('img.Icon-img'), options);
    }
  };
});
