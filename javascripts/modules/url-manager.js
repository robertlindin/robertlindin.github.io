/*
 * Title: Url manager
 * Description: Handle the loading and saving of urls
 *
 */


define('urlManager', ['jquery'], function ($) {
  'use strict';

  // singleton instance
  var instance;

  var UrlManager = function(options) {
    this.dontTriggerRestore = false;
  };

  UrlManager.prototype = {
    // can either set multiple params with object: set({param: value}),
    // or with set(param, value)
    set: function() {
      var params = this._getParams(),
          newParams = {};

      if (typeof arguments[0] === 'object') {
        newParams = arguments[0];
      } else {
        newParams[arguments[0]] = arguments[1];
      }

      $.each(newParams, function(k, v) {
        if (v) {
          params[k] = v;
        } else {
          delete params[k];
        }
      });

      this._setParams(params);
    },

    // get param value
    get: function(param) {
      var params = this._getParams();

      return params[param];
    },

    // check if value changed
    changed: function(param, oldUrl, newUrl) {
      return newUrl[param] != oldUrl[param];
    },

    bindChangeListener: function(obj, namespace) {
      var _this = this;
      namespace = namespace || 'none';

      $(window).on('hashchange.' + namespace, function(e) {
        _this._onHashChange(e, obj);
      });
    },

    unbindChangeListener: function(namespace) {
      namespace = namespace || 'none';

      $(window).off('hashchange.' + namespace);
    },

    _getParams: function(query) {
      query = (typeof query === 'undefined') ? window.location.hash : query;

      return $.unparam(query.replace('?', '').replace('#', ''));
    },

    _setParams: function(params) {
      var _this = this,
          query = $.param(params);

      this.dontTriggerRestore = true;

      if (query) {
        window.location.hash = query;
      } else if (window.location.hash) {
        console.log('set empty params');
        var obj = {
          title: document.title,
          url: window.location.pathname
        };
        history.replaceState(obj, obj.title, obj.url);
      }

      setTimeout(function() {
        _this.dontTriggerRestore = false;
      }, 0);
    },

    _onHashChange: function(e, obj) {
      var _this = this,
          oldUrl,
          newUrl;

      if (!this.dontTriggerRestore) {
        setTimeout(function() {
          // use oldURL/newURL for browsers supporting it
          if (e.originalEvent.oldURL && e.originalEvent.newURL) {
            oldUrl = $.unparam(e.originalEvent.oldURL.split('#')[1]);
            newUrl = $.unparam(e.originalEvent.newURL.split('#')[1]);
          } else {
            oldUrl = $.unparam(_this.lastUrl.replace('#', ''));
            newUrl = $.unparam(window.location.hash.replace('#', ''));
          }
          console.log('trigger restore state on ' + obj['restoreState']);
          // call the obj._restoreState() method if it exists
          if (typeof obj['restoreState'] === 'function') {
            obj['restoreState'].apply(obj, [true, oldUrl, newUrl]);
          }
        }, 0);
      }

      setTimeout(function() {
        _this.lastUrl = window.location.hash;
      }, 100);
    }
  };

  return {
    getInstance: function(options) {
      // singleton: return the same instance all the time
      return (instance = instance || new UrlManager(options));
    }
  };
});
