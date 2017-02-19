/*
 * Title: Off Canvas
 * Description: Handles the push / pop of the off-canvas
 *
 */


define('offCanvas', ['jquery', 'urlManager'], function ($, urlManager) {
  'use strict';

  var instances = [];

  var OffCanvas = function($el, options) {
    var that = this;

    this.options = options;
    this.type = options.type || 'top';
    this.instances = options.instances || [];

    this.$el = $el;
    this.$top = $('.js-OffCanvas');
    this.$bottom = $('.js-OffCanvas--bottom');
    this.$current = this._getCurrentEl(options.type);
    this.$content = $('.js-content');
    this.$navigation = $('.js-StickyNavigation');
    this.$bar = this.type == 'top' ? $('.js-Bar--top') : $('.js-Bar--bottom');

    this.topPushedClass = 'OffCanvas--is-pushed';
    this.bottomPushedClass = 'OffCanvas--bottom--is-pushed';
    this.currentPushedClass = this._getCurrentPushedClass(options.type);
    this.barLinkActiveClass = 'Bar-link--is-active';
    this.barPushedClass = 'Bar--is-pushed';
    this.animationClass = 'u-off-canvas-transition';
    this.navigationPushedClass = this.type == 'top' ? 'StickyNavigation--is-pushed' : 'StickyNavigation--is-pushedFromBottom';

    // need to check if it's already opened
    this.open = this.$el.hasClass(this.barLinkActiveClass);
    this.scrollHickup = undefined;
    this.scrollHickupInterval = 10;
    // TODO: get this value from css transition
    this.animationDelay = 250;

    this.urlManager = urlManager.getInstance();
    this.restoreState();

    this._bindEvents();
    this._onResize();
  };

  OffCanvas.prototype = {
    // show the current off-canvas!
    show: function() {
      console.log('show');
      var that = this,
          intervalMs = 10,
          steps = (this.animationDelay / intervalMs),
          i = 0;

      // set the open sizes
      this._setOpenSizes();

      this.open = true;

      if (this.type === 'bottom') {
        // TODO: move this outta here!
        // This will scroll down page as we open up bottom bar content
        (function scrollLoop() {
          that.scrollLoop = true;
          window.scrollTo(0, document.body.scrollHeight);

          if (i < steps) {
            setTimeout(function() {
              scrollLoop();
            }, intervalMs);
            i++;
          } else {
            that.scrollLoop = false;
          }
        }());
      }

      setTimeout(function() {
        that._updateElementHeightValues();
      }, this.animationDelay);

      if (this.options.deeplink) {
        var obj = {
          'slide': false,
          'contact': false,
          'about': false
        };
        obj[this.options.deeplink] = true;
        this.urlManager.set(obj);
      }
    },

    // hide the current off-canvas!
    hide: function() {
      var that = this;
      console.log('hide');

      this.$current.removeClass(this.currentPushedClass);
      this.$el.removeClass(this.barLinkActiveClass);
      this.$bar.removeClass(this.barPushedClass);

      console.log('bar has class: ');
      console.log(this.$bar.hasClass(this.barPushedClass));

      if (this.type === 'top') {
        this.$content.css('margin-top', 0);
        this.$bar.css('top', 0);
      } else {
        this.$content.css({'top': 0, 'padding-top': 0});
        this.$bar.css('bottom', 0);
      }

      setTimeout(function() {
        that.$navigation.removeClass(that.navigationPushedClass).css('margin-top', 0);
        that._updateElementHeightValues();
      }, this.animationDelay);

      this.open = false;
    },

    // remove this object of use
    kill: function() {
      this._unBindEvents();
    },

    restoreState: function(hashchange, oldUrl, newUrl) {
      console.log('off-canvas restore state');

      if (this.options.deeplink) {
        var deeplink = this.urlManager.get(this.options.deeplink);

        // if a hash change event
        if (hashchange) {
          console.log('off-canvas hash change');
          // did our value change?
          if (this.urlManager.changed(this.options.deeplink, oldUrl, newUrl)) {
            if (deeplink) {
              this.show();
            } else {
              console.log('hide off-canvas');
              this.hide();
            }
          }
        } else {
          console.log('off-canvas load');
          // otherwise its a ordinary load
          console.log(deeplink);
          console.log(this.options.deeplink);
          if (deeplink) {
            this.show();
          } else if (this.open) {
            this.hide();
          }
        }
      }
    },

    _setOpenSizes: function() {
      console.log('set open sizes');
      this.$current.addClass(this.currentPushedClass);
      this.$el.addClass(this.barLinkActiveClass);
      this.$bar.addClass(this.barPushedClass);
      this.$navigation.addClass(this.navigationPushedClass);

      // For the top type
      if (this.type == 'top') {
        this.$content.css('margin-top', this.pushValue);
        this.$bar.css('top', this.pushValue);

        // if the bottom is open at the same time we need to add that push value
        if (this._isOpen('bottom')) {
          this.$navigation.css('margin-top', ($(window).height() / 2) + this._getOpenInstanceByType('bottom').pushValue);
        } else {
          this.$navigation.css('margin-top', $(window).height() / 2);
        }
      } else {
        // and the bottom type
        this.$content.css({'top': -this.pushValue, 'padding-top': this.pushValue});
        this.$bar.css('bottom', this.pushValue);
        this.$navigation.css('margin-bottom', $(window).height() / 2);
      }
    },

    _unBindEvents: function() {
      this.$el.off('click.' + this.type);
      $(window).off('resize.' + this.type);
      $(window).off('scroll.' + this.type);
      this.urlManager.unbindChangeListener();
    },

    _bindEvents: function() {
      var _this = this;

      this.$el.on('click.' + this.type, function(e) {
        _this._onTogglerClick(e);
      });

      $(window).on('resize.' + this.type, function() {
        _this._onResize();
      });

      $(window).on('scroll.' + this.type, function(e) {
        _this._onScroll(e);
      });

      this.urlManager.bindChangeListener(this);
    },

    // check if either top or bottom is open
    _isOpen: function(type) {
      var isOpen = false,
          instances = this._getInstances();

      for (var i = 0; i < instances.length; i++) {
        if (instances[i].type === type && instances[i].open === true) {
          isOpen = true;
        }
      }

      return isOpen;
    },


    _getOpenInstanceByType: function(type) {
      var instance = null,
          instances = this._getInstances();

      for (var i = 0; i < instances.length; i++) {
        if (instances[i].type === type && instances[i].open === true) {
          instance = instances[i];
        }
      }

      return instance;
    },

    _getCurrentPushedClass: function(type) {
      if (type == 'top') {
        return this.topPushedClass;
      } else {
        return this.bottomPushedClass;
      }
    },

    // return current off canvas (top, bottom)
    _getCurrentEl: function(type) {
      if (type == 'top') {
        return this.$top;
      } else {
        return this.$bottom;
      }
    },

    // get other off-canvas instances (not including the current) in callback
    // and in return value
    _getInstances: function(callback) {
      var that = this,
          // filter out the current object from instances
          filteredInstances = $.grep(this.instances, function(element) {
            return element !== that;
          });

      $.each(filteredInstances, function() {
        if (typeof callback === 'function') {
          callback.call(this);
        }
      });

      // return the filtered instances
      return filteredInstances;
    },

    // hide all the other instances
    _hideOtherInstances: function() {
      var hidden = false;

      this._getInstances(function() {
        if (this.open) {
          this.hide();
          hidden = true;
        }
      });

      // were there any hidden?
      return hidden;
    },

    _updateElementHeightValues: function() {
      this.pushValue = this.$current.height();
      this.viewPortHeight = $(window).height();
      this.documentHeight = $(document).height();
    },

    _scrollHickup: function(e) {
      console.log('scroll hickup');
      this._updateElementHeightValues();

      var that = this,
          bottomBreakPoint = this.documentHeight - this.pushValue,
          scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
          scrollBottom = this.viewPortHeight + scrollTop;

      this.$bar.removeClass(this.animationClass);

      if (this.type === 'top') {
        if (scrollTop > this.pushValue) {
          this.$bar.removeClass(this.barPushedClass).css('top', 0);
          this.$navigation.removeClass(this.navigationPushedClass).css('margin-top', 0);

          console.log('i am below!');
          // remove url
          if (this.urlManager.get(this.options.deeplink)) {
            this.urlManager.set(this.options.deeplink, false);
          }
        } else {
          this.$bar.addClass(this.barPushedClass).css('top', this.pushValue);
          this.$navigation.addClass(this.navigationPushedClass).css('margin-top', $(window).height() / 2);

          if (this._isOpen('bottom')) {
            this.$navigation.css('margin-top', ($(window).height() / 2) + this._getOpenInstanceByType('bottom').pushValue);
          }

          // add url
          if (!this.urlManager.get(this.options.deeplink)) {
            this.urlManager.set(this.options.deeplink, true);
          }
        }
      } else {
        // console.log('document height: ' +  this.documentHeight);
        // console.log('bottom breakpoint: ' + bottomBreakPoint);
        // console.log('scroll top: ' + scrollTop);
        // console.log('scroll bottom: ' + (this.viewPortHeight + scrollTop));
        if (scrollBottom < bottomBreakPoint) {
          this.$bar.removeClass(this.barPushedClass);
          this.$bar.css('bottom', 0);
          this.$navigation.removeClass(this.navigationPushedClass).css('margin-bottom', 0);
          console.log('i am over');
          // remove url
          if (this.urlManager.get(this.options.deeplink)) {
            this.urlManager.set(this.options.deeplink, false);
          }
        } else {
          this.$bar.addClass(this.barPushedClass);
          this.$bar.css('bottom', this.pushValue);
          this.$navigation.addClass(this.navigationPushedClass).css('margin-bottom', $(window).height() / 2);
          // add url
          if (!this.urlManager.get(this.options.deeplink)) {
            this.urlManager.set(this.options.deeplink, true);
          }
        }
      }


      setTimeout(function() {
        that.$bar.addClass(that.animationClass);
      }, 25);
    },

    _onTogglerClick: function(e) {
      var that = this,
          scrollSpeed = 100;

      e.preventDefault();

      if (this.type == 'top') {
        // window.scrollTo(0, 0);
        $('html, body').animate({scrollTop: 0}, scrollSpeed);
      } else {
        // window.scrollTo(0, document.body.scrollHeight);
        $('html, body').animate({scrollTop: document.body.scrollHeight}, scrollSpeed);
      }

      // open canvas if it's closed
      if (!this.open) {
        // wait for scroll before showing
        setTimeout(function() {
          that.show();
        }, scrollSpeed * 2);
      }
    },

    _onResize: function() {
      this._updateElementHeightValues();

      if (this.open) {
        this._setOpenSizes();
      }
    },

    _onScroll: function(e) {
      var that = this;

      if (this.open && !this.scrollLoop) {
        if (this.scrollHickup) {
          clearTimeout(this.scrollHickup);
        }

        this.scrollHickup = setTimeout(function() {
          that._scrollHickup(e);
        }, this.scrollHickupInterval);
      }
    }
  };

  return {
    init: function ($el, options) {
      var indexesToRemove = [];
      options.instances = instances;

      // run kill on all instances with the same type
      $.each(instances, function(k, v) {
        if (this.type === options.type) {
          this.kill();
          indexesToRemove.push(k);
        }
      });

      // and then remove them from the instances var
      $.each(indexesToRemove, function() {
        instances.splice(this, 1);
      });

      // and push the new one
      instances.push(new OffCanvas($el, options));
    }
  };
});
