describe("The backbone.extension.js extension library for Backbone", function() {

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

  /*it("should subscribe to global published events", function() {
    var MyViewClass = BaseViewClass.extend
  });*/

  describe("addInitializer method", function() {

    it("add multiple initializers", function() {
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

    it("should always have access to the context of this instance", function() {
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

    it("should pass proper arguments to all initializers", function() {
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
});