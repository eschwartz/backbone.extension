/**
 * Extensions for Backbone
 */


/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */

(function($) {

  var o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

}(jQuery));


/**
 * Helper functions
 */
var getValue = function(object, prop) {
  if (!(object && object[prop])) {
    return null;
  }
  return _.isFunction(object[prop]) ? object[prop]() : object[prop];
};

var delegateEventSplitter = /^(\S+)\s*(.*)$/;


var View_orig = _.extend({}, Backbone.View.prototype);
_.extend(Backbone.View.prototype, {
  ui: {},

  // Subscribe to global events
  // using $.Event bindings
  // eg:
  //  { 'topic': listener }
  //  $.on('topic', listener);
  //  $.trigger('topic', params);
  globalEvents : {},

  _configure: function() {
    var self = this;
    
    _.bindAll(this);

    this.uuid =_.uniqueId('class_');

    this.init_orig = this.initialize || function() {};
    this.initialize = function() {
      self.bindUIElements();
      self.delegateGlobalEvents();
      self.init_orig.apply(self, arguments);      
    }

    View_orig._configure.apply(this, arguments);
  },

  getUuid : function() {
    return this.uuid;
  },

  delegateGlobalEvents : function() {
    var topic;
    for (topic in this.globalEvents) {
      if (this.globalEvents.hasOwnProperty(topic)) {
        $.subscribe(topic + "." + this.getUuid(), this[this.globalEvents[topic]]);
      }
    }
  },

  // This method binds the elements specified in the "ui" hash inside the view's code with
  // the associated jQuery selectors.
  bindUIElements : function() {
    if (!this.ui) {
      return;
    }

    var that = this;

    if (!this.uiBindings) {
      // We want to store the ui hash in uiBindings, since afterwards the values in the ui hash
      // will be overridden with jQuery selectors.
      this.uiBindings = this.ui;
    }

    // refreshing the associated selectors since they should point to the newly rendered elements.
    this.ui = {};
    _.each(_.keys(this.uiBindings), function(key) {
      var selector = that.uiBindings[key];
      that.ui[key] = that.$el.find(selector);
    });
  },

  // Delegate events with named ui
  delegateEvents: function(events) {

    events || ( events = this.events);
    if (!(events)) {
      return;
    }

    this.undelegateEvents();
    var key;
    for (key in events) {
      if (events.hasOwnProperty(key)) {
        // Determine callback method
        var method = events[key];
        if (!_.isFunction(method)) {
          method = this[events[key]];
        }
        if (!method) {
          throw new Error('Method "' + events[key] + '" does not exist');
        }

        // Split up selector and event binding
        var match = key.match(delegateEventSplitter);
        var eventName = match[1];

        // Check for named selector
        if (!this.uiBindings) {
          this.uiBindings = this.ui;
        }
        var selector = (this.uiBindings && _.has(this.uiBindings, match[2])) ? this.uiBindings[match[2]] : match[2];

        // Bind the event to the DOM object
        method = _.bind(method, this);
        eventName += '.delegateEvents';

        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
    }
  }
});