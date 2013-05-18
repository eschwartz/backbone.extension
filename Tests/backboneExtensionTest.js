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

  /*afterEach(function() {
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
  });*/

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
});