describe("The backbone.extension.js extension library for Backbone", function() {

  var $container = $('<div class="container"></div>');
  var $childA = $('<div class="childA"></div>');
  var $childB = $('<div class="childB"></div>');
  var $button = $('<button class="btn"></button>');
  var $dom = $container.append($childA.clone(), $childA.clone(), $childA.clone(), $childB.clone(), $button.clone())
                      .after($childB.clone());

  var BaseViewClass;

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

    // Undelegate children events
    // Note that this doesn't go deep into dom
    $dom.children().each(function() {
      $(this).off();
    });
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

    new MyViewClass();
  });
});