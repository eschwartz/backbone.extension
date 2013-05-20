describe("The backbone.extension.js extension library for Backbone...", function() {

  var $container = $('<div class="container"></div>');
  var $childA = $('<div class="childA"></div>');
  var $childB = $('<div class="childB"></div>');
  var $button = $('<button class="btn"></button>');
  var $dom = $container.append($childA.clone(), $childA.clone(), $childA.clone(), $childB.clone(), $button.clone())
                      .after($childB.clone());

  var BaseViewClass;
  var view;

  beforeEach(function() {
    // Create test DOM
    $('body').append($dom);

    BaseViewClass = Backbone.View.extend({
      el: $dom,

      ui: {
        childA: '.childA',
        childB: '.childB',
        btn: '.btn'
      }
    });
  });

  afterEach(function() {
    $dom.remove();

    // If there's a view, close
    if(view instanceof Backbone.View) {
      view.undelegateEvents()
      if(view.close) { view.close() }
    }

    view = null;

    // Manually undelegate children events
    // In case there are any stragglers
    // Note that this doesn't go deep into dom
    $dom.children().each(function() {
      $(this).off();
    });

    // Unsubscribe all global events
    $.unsubscribe();
  });

  it("should not overwrite initialize method", function() {
    var initFlag = false;

    var MyViewClass = BaseViewClass.extend({
      initialize: function() {
        initFlag = true;
      }
    });

    view = new MyViewClass();
    expect(initFlag).toBe(true);
  });

  it("should convert named ui elements to jQuery objects before initialize", function() {
    var MyViewClass = BaseViewClass.extend({
      initialize: function() {
        // Are jQuery objects
        expect(this.ui.childA instanceof $).toBe(true);
        expect(this.ui.childB instanceof $).toBe(true);
        expect(this.ui.btn instanceof $).toBe(true);

        // Found the corrent number
        expect(this.ui.childA.length).toBe(3);
        expect(this.ui.childB.length).toBe(1);
        expect(this.ui.btn.length).toBe(1);
      }
    });

    view = new MyViewClass();
  });

  it("should bind events to named ui elements", function() {
    var MyViewClass = BaseViewClass.extend({
      $clickedObject: null,

      events: {
        'click btn': 'handleEvent'
      },

      handleEvent: function(evt) {
        this.$clickedObject = $(evt.currentTarget);
      }
    });

    var view = new MyViewClass();

    view.ui.btn.trigger('click');
    expect(view.$clickedObject[0]).toBe(view.ui.btn[0]);
  });

  it("should subscribe to global published events", function() {
    var earthQuakeLocation;
    var MyViewClass = BaseViewClass.extend({
      globalEvents: {
        'butterflyFlapsWingsInShanghai': 'createEarthquake'
      },

      createEarthquake: function(evt, location) {
        earthQuakeLocation = location;
      }
    });

    view = new MyViewClass();
    $.publish('butterflyFlapsWingsInShanghai', "Los Angeles");

    expect(earthQuakeLocation).toBe("Los Angeles");
  });

  it("should unbind named-ui events", function() {
    var clickCount = 0;

    var MyViewClass = BaseViewClass.extend({
      events: {
        'click btn': 'handleBtnClick'
      },

      handleBtnClick: function() {
        clickCount++;
      }
    });

    view = new MyViewClass();

    view.ui.btn.trigger('click');
    expect(clickCount).toBe(1);

    view.undelegateEvents();
    view.ui.btn.trigger('click');
    expect(clickCount).toBe(1);
  });

  it("should unbind global events", function() {
    var earthquakeCount = 0;

    var MyViewClass = BaseViewClass.extend({
      globalEvents: {
        'butterflyFlapsWingsInShanghai': 'createEarthquake'
      },

      createEarthquake: function() {
        earthquakeCount++;
      }
    });

    view = new MyViewClass();

    $.publish("butterflyFlapsWingsInShanghai");
    expect(earthquakeCount).toBe(1);

    view.undelegateEvents();
    $.publish("butterflyFlapsWingsInShanghai");
    expect(earthquakeCount).toBe(1);
  });

  describe("addInitializer method", function() {

    it("should trigger multiple initializers", function() {
      var initAddedFlag = false, initOrigFlag = false;

      var MyViewClass = BaseViewClass.extend({
        _configure: function() {
          this.addInitializer(function() {
            initAddedFlag = true;
          });
          BaseViewClass.prototype._configure.apply(this, arguments);
        },

        initialize: function() {
          initOrigFlag = true;
        }
      });

      expect(initAddedFlag).toBe(false);
      expect(initOrigFlag).toBe(false);

      view = new MyViewClass;
      expect(initAddedFlag).toBe(true);
      expect(initOrigFlag).toBe(true);
    });

    it("should always provide access to the correct object context", function() {
      var MyViewClass = BaseViewClass.extend({
        foo: 'bar',

        _configure: function() {
          this.addInitializer(function(options) {
            expect(this.foo).toBe('bar');
          });

          BaseViewClass.prototype._configure.apply(this, arguments);
        },

        initialize: function(options) {
          expect(this.foo).toBe('bar');
        }
      });

      view = new MyViewClass();
    });

    it("should pass constructor options as arguments to all initializers", function() {
      var MyViewClass = BaseViewClass.extend({
        _configure: function() {
          BaseViewClass.prototype._configure.apply(this, arguments);

          this.addInitializer(function(options) {
            expect(options.foo).toBe('bar');
          });

        },

        initialize: function(options) {
          expect(options.foo).toBe('bar');
        }
      });

      var view = new MyViewClass({ foo: 'bar' })
    });

    it("should handle initializers in multiple level of inheritence", function() {
      var baseInitFlag = false, initFlag = false;

      var MyParentViewClass = BaseViewClass.extend({
        _configure: function() {
          BaseViewClass.prototype._configure.apply(this, arguments);

          this.addInitializer(function() {
            baseInitFlag = true;
          });
        }
      });

      var MyChildViewClass = MyParentViewClass.extend({
        initialize: function() {
          initFlag = true;
        }
      });

      view = new MyChildViewClass();
      expect(baseInitFlag).toBe(true);
      expect(initFlag).toBe(true);
    });

  });


  it("should not be bothered by multiple levels of inheritence", function() {
    var btnClickCount = 0;
    var childAClickCount = 0;
    var quakeCount = 0;
    var someEventCount = 0;

    var MyParentViewClass = Backbone.View.extend({
      baseUI: {
        'btn': '.btn'
      },

      baseEvents: {
        'click btn': 'handleButtonClick'
      },
      /*
      baseGlobalEvents: {
        'butterflyFlapsWings': 'createEarthquake'
      },*/

      _configure: function() {
        Backbone.View.prototype._configure.apply(this, arguments);

        this.ui || (this.ui = {});
        this.ui = _.extend({}, this.baseUI, this.ui)

        this.events || (this.events = {});
        this.events = _.extend({}, this.baseEvents, this.events);

        /*this.globalEvents || (this.globalEvents = {});
        this.globalEvents = _.extend({}, this.baseGlobalEvents, this.globalEvents);*/
      },

      handleButtonClick: function() {
        clickCount++;
      },

      createEarthquake: function() {
        quakeCount++;
      }
    });

    var MyChildViewClass = Backbone.View.extend({
      events: {
        'click childA': 'handleClickChildA'
      },

      globalEvents: {
        'some:event': 'someHandler'
      },

      initialize: function() {
        a = 1;
      },

      handleClickChildA: function() {
        childAClickCount++;
      },

      someHandler: function() {
        someEventCount++;
      }
    });

    view = new MyChildViewClass();

    $.publish("some:event");
    expect(someEventCount).toBe(1);
  });
});