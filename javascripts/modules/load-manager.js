/*
 * Title: Load manager
 * Description: Manage loading images
 *
 */


define('loadManager', ['jquery'], function ($) {
  'use strict';

  var LoadManager = function($el, options) {
    this.$el = $el;

    this.options = $.extend({
      'loadedClass': 'loaded',
      'parentLoadedClass': 'loaded'
    }, options);

    this.numberOfEl = this.$el.length;
    this.numberOfLoaded = 0;

    this._bindEvents();
  };

  LoadManager.prototype = {

    _bindEvents: function() {
      var that = this;
      this.$el.each(function() {
        if (this.complete) {
          that._onLoad(null, this);
        } else {
          $(this).on('load', function(e) {
            that._onLoad(e, this);
          });
        }
      });

    },

    _onLoad: function(e, el) {
      this.numberOfLoaded++;

      $(el).addClass(this.options.loadedClass);
      $(el).parent().addClass(this.options.parentLoadedClass);

      if (this.numberOfLoaded === this.numberOfEl) {
        this._onAllLoaded();
      }
    },

    _onAllLoaded: function() {
      $(this).trigger('all-loaded');
    }
  };

  return {
    init: function($el, options) {
      return new LoadManager($el, options);
    }
  };
});
