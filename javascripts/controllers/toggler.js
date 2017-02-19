/*
 * Title: Toggler
 * Description: Toggle a class of an element
 *
 */


define('toggler', ['jquery', 'urlManager'], function ($, urlManager) {
  'use strict';

  var instances = [];

  var Toggler = function($el, options) {
    this.$el = $el;
    this.$targetEl = $(options.selector);
    this.options = options;

    this.toggleClass = options.className;
    this.toggleText = options.toggleText;
    this.clickElActiveClass = options.clickElActiveClass || 'active';
    this.group = options.group;

    this.urlManager = urlManager.getInstance();

    this.restoreState();

    this.eventListeners();
  };

  Toggler.prototype = {
    eventListeners: function() {
      var _this = this;

      this.$el.click(function(e) {
        e.preventDefault();

        if (_this.isOn()) {
          _this.toggleOff(e);
        } else {
          _this.toggleOn(e);
        }

        _this.$el.trigger('onToggleTrigger', [_this.isOn(), e]);
        _this.$targetEl.trigger('onToggleTarget', [_this.isOn()]);
      });

      this.urlManager.bindChangeListener(this);
    },

    isOn: function() {
      return this.$targetEl.hasClass(this.toggleClass);
    },

    toggleOn: function(e) {
      var that = this;

      if (this.group) {
        $(instances).each(function() {
          if (this.group === that.group) {
            this.$targetEl.removeClass(this.toggleClass);
            this.$el.removeClass(this.clickElActiveClass);
          }
        });
      }

      if (!this.$el.hasClass(this.clickElActiveClass)) {
        this.switchToggleText();
      }

      this.$targetEl.addClass(this.toggleClass);
      this.$el.addClass(this.clickElActiveClass);

      if (this.options.deeplink) {
        this.urlManager.set(this.options.deeplink, true);
      }
    },

    toggleOff: function() {
      if (this.$el.hasClass(this.clickElActiveClass)) {
        this.switchToggleText();
      }

      if (this.group && !this.$el.hasClass(this.clickElActiveClass)) {
        this.$targetEl.removeClass(this.toggleClass);
        this.$el.removeClass(this.clickElActiveClass);
      } else if (!this.group) {
        this.$targetEl.removeClass(this.toggleClass);
        this.$el.removeClass(this.clickElActiveClass);
      }

      if (this.options.deeplink) {
        this.urlManager.set(this.options.deeplink, false);
      }
    },

    switchToggleText: function() {
      if (this.toggleText) {
        var currentText = this.$el.html();
        this.$el.html(this.toggleText);
        this.toggleText = currentText;
      }
    },

    restoreState: function(hashchange, oldUrl, newUrl) {
      if (this.options.deeplink) {
        var deeplink = this.urlManager.get(this.options.deeplink);

        // if a hash change event
        if (hashchange) {
          // did our value change?
          if (this.urlManager.changed(this.options.deeplink, oldUrl, newUrl)) {
            if (deeplink) {
              this.toggleOn();
            } else {
              this.toggleOff();
            }
          }
        } else {
          // otherwise its a ordinary load
          if (deeplink) {
            this.toggleOn();
          } else {
            this.toggleOff();
          }
        }
      }
    }
  };

  return {
    init: function ($el, options) {
      instances.push(new Toggler($el, options));
    }
  };
});
