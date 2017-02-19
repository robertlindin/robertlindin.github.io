/*
 * Title: Async page load
 * Description: Load part of page async
 *
 */


define('asyncPageLoad', ['jquery', 'controllerInitializer', 'utilities'], function ($, controllerInitializer, utilities) {
  'use strict';

  var instance,
      instanceCount = 0;

  var AsyncPageLoad = function($el, options) {
    this.$el = $el;
    this.options = options;
    this.$content = $('.js-content');

    instanceCount++;

    // push first page load to be able to go back there
    if (instanceCount === 1) {
      this.pushState();
    }

    console.log('async page load constructor');
    console.log(this.$el);

    this._bindEvents();
  };

  AsyncPageLoad.prototype = {
    loadPage: function(href, updateUrl) {
      var that = this;

      this.$content.css('min-height', $(window).height() + 1);

      $.get(href, function(response) {
        var $oldEls = $(that.options.selector),
            $newEls = $(response).find(that.options.selector),
            state = {
              title: $(response).filter('title').text(),
              url: href,
              async: true
            };

        $oldEls.each(function() {
          var $newEl = $newEls.filter('.'+this.className.replace(/ /g, '.'));

          $(this).html($newEl.html());
        });

        controllerInitializer.init();
        utilities.initSVGInjector();

        document.title = state.title;

        $('body').data('url', state.url);

        if (updateUrl) {
          that.pushState(state);
        }
      });
    },

    pushState: function(state) {
      state = $.extend({
        title: document.title,
        url: window.location.href,
        pathname: window.location.pathname,
        async: true
      }, state);

      window.history.pushState(state, state.title, state.url);
    },

    unbindEvents: function() {
      console.log('unbind events');
      console.log(this.$el);
      this.$el.off('click');
      $(window).off('popstate');
    },

    _bindEvents: function() {
      var that = this;

      console.log('bind events');
      console.log(this.$el);

      this.$el.on('click', function(e) {
        that._onClick(e);
      });

      $(window).on('popstate', function(e) {
        console.log('on jquery pop state');
        var state = e.originalEvent.state;
        console.log(state);
        if (state && state.async) {
          that.loadPage(state.url, false);
        } else {
          var url = $('body').data('url').replace('/', '');
          console.log('here we should check if page url have changed and if so load new page');
          console.log('current: ' + window.location.pathname.replace('/', ''));

          if (url) {
            console.log('data url: ' + url);
            if (window.location.pathname.replace('/', '') !== url) {
              console.log('we should load ' + window.location.pathname);
              that.loadPage(window.location.pathname, false);
            }
          }
        }
      });
    },

    _onClick: function(e) {
      e.preventDefault();

      console.log('on click');

      this.loadPage(this.$el.attr('href'), true);
    }
  };

  return {
    init: function($el, options) {
      if (instance && instance.$el.parents('html').length === 0) {
        instance.unbindEvents();
      }
      return (instance = new AsyncPageLoad($el, options));
    }
  };
});
