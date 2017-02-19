/*
 * Title: Slider
 * Description: Slider
 *
 */


define('slider', ['jquery', 'loadManager'], function ($, loadManager) {
  'use strict';

  var instance,
      instanceCount = 0;

  var Slider = function($el, options) {
    var that = this;
    this.$el = $el;
    this.$slides = this.$el.find('.Slider-item');
    this.$sliderImages = this.$slides.find('.Slider-image');
    this.$dotNavigation = $('.DotNavigation');
    this.$dotNavigationItems = this.$dotNavigation.find('li');
    this.$gotoSlideNavigation = $('.js-GotoSlideNavigation');
    this.$gotoSlideNavigationItems = this.$gotoSlideNavigation.find('> a');
    this.$gotoSlideNavigationPrev = $('.js-GotoSlideNavigation-previous');
    this.$gotoSlideNavigationNext = $('.js-GotoSlideNavigation-next');

    this.dotNavigationSelectedClass = 'DotNavigation-item--is-selected';
    this.StickyNavigationHiddenClass = 'StickyNavigation-item--is-hidden';
    this.sliderItemActiveClass = 'Slider-item--is-active';
    this.sliderImageActiveClass = 'Slider-image--is-active';

    this.index = 0;
    this.$slideInViewport = this._getSlideInViewport();
    this.slideCount = this.$slides.length;
    this.scrollToSlideSpeed = 250;

    this._bindEvents();
    this._updateHeight();
    this._showHideGotoNavigation();
    this._setActiveSlide();

    // add load manager to the images
    this.loadManager = loadManager.init(this.$sliderImages, {
      'loadedClass': 'Slider-image--is-loaded',
      'parentLoadedClass': 'Slider-item--is-loaded'
    });
  };

  Slider.prototype = {
    gotoPrev: function(animate) {
      this.gotoIndex(this.index - 1, animate);
    },

    gotoNext: function(animate) {
      this.gotoIndex(this.index + 1, animate);
    },

    gotoIndex: function(index, animate) {
      var that = this;

      this.animating = true;

      if (animate) {
        $('body').animate({
          scrollTop: $(this.$slides[index]).offset().top
        }, this.scrollToSlideSpeed, function() {
          that._updateSlideSettings();

          setTimeout(function() {
            that.animating = false;
          }, 25);
        });
      } else {
        window.scroll(0, $(this.$slides[index]).offset().top);
        that._updateSlideSettings();
      }


    },

    unbindEvents: function() {
      $(window).off('resize.slider');
      $(window).off('scroll.slider');
    },

    _updateSlideSettings: function() {
      this.$slideInViewport = this._getSlideInViewport();

      this._setActiveSlide();

      // update index var
      this.index = this.$slideInViewport.index();

      // set the current navigation
      this._setCurrentNavigation(this.index);

      this._showHideGotoNavigation();
    },

    _setActiveSlide: function() {
      this.$slides.removeClass(this.sliderItemActiveClass);
      this.$slideInViewport.addClass(this.sliderItemActiveClass);

      this.$sliderImages.removeClass(this.sliderImageActiveClass);
      this.$slideInViewport.find('.Slider-image').addClass(this.sliderImageActiveClass);
    },

    _setCurrentNavigation: function(index) {
      this.$dotNavigationItems.removeClass(this.dotNavigationSelectedClass);

      $(this.$dotNavigationItems[index]).addClass(this.dotNavigationSelectedClass);
    },

    _getSlideInViewport: function() {
      var that = this,
          scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
          $slideInViewport = $(this.$slides[0]);

      this.$slides.each(function() {
        if (scrollTop > ($(this).offset().top - ($(this).height() / 2) + 1)) { // +1 px as safety margin to make sure to load the image in all positions
          $slideInViewport = $(this);
        }
      });

      return $slideInViewport;
    },

    _updateHeight: function() {
      this.$slides.css('height', $(window).height());
    },

    _showHideGotoNavigation: function() {
      // remove classes from both first
      this.$gotoSlideNavigationItems.removeClass(this.StickyNavigationHiddenClass);

      // then hide prev/next buttons if on the first or last slide
      if (this.index === 0) {
        $(this.$gotoSlideNavigationItems[0]).addClass(this.StickyNavigationHiddenClass);
      } else if (this.index === this.slideCount - 1) {
        $(this.$gotoSlideNavigationItems[1]).addClass(this.StickyNavigationHiddenClass);
      }
    },

    _bindEvents: function() {
      var that = this;

      $(window).on('resize.slider', function() {
        that._onResize();
      });

      $(window).on('scroll.slider', function() {
        that._onScroll();
      });

      this.$gotoSlideNavigationPrev.on('click', function(e) {
        e.preventDefault();
        that.gotoPrev(true);
      });

      this.$gotoSlideNavigationNext.on('click', function(e) {
        e.preventDefault();
        that.gotoNext(true);
      });
    },

    _onResize: function() {
      this._updateHeight();
    },

    _onScroll: function() {
      var that = this;
      if (!this.animating) {
        if (this.scrollHickup) {
          clearTimeout(this.scrollHickup);
        }

        // TODO: make work better
        this.scrollHickup = setTimeout(function() {
          that._onScrollHickup();
        }, 125);
      }
    },

    _onScrollHickup: function() {
      this._updateSlideSettings();
    }
  };

  return {
    init: function ($el, options) {
      if (instance) {
        instance.unbindEvents();
      }

      instanceCount++;

      instance = new Slider($el, options);

      return instance;
    }
  };
});
