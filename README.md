# Backbone.Extension

## What it does

Some useful extensions to the Backbone.View class, including:

* named ui elements (borrowed from [BB.Marionette](https://github.com/marionettejs/backbone.marionette))
* bind events using named ui elements
* bind global events (eg. Backbone.trigger("some:global:event"))
* addInitializer method, to prevent overwriting
  initialize method in base class

## How to use it

This extension directly extends Backbone.View, and should be compatible with all of your existing views. 

### Named UI elements

Named UI elements are converted to $ objects before initialize. 

```html

<div id="someRegion">
	<form name="someForm">
		<input type="submit" />
	</form>
	<ul class="someList">
		<li>Item 1</li>
		<li>Item 2</li>
	</ul>
	<button class="addItem">Add an item</button>
</div>

```


```javascript
var MyView = Backbone.View.extend({
	// Value can be any valid $ selector. 
	// Will only look inside this.$el
	ui: {
		'uselessForm': 'form[name=someForm]',	
		'addItemBtn': 'button.addItem',
		'listItems': 'ul.someList li'
	},
	
	// Works just like usual, but you can reference the selectors in this.ui
	events: {
		'submit uselessForm': 'handleFormSubmit',
		'click addItemBtn': 'addListItem'
	},
	
	handleFormSubmit: function	(evt) {
		alert("Oh, I'm sorry… did you want to submit that form? My bad.");
		
		this.ui.uselessForm.addClass('totallyUselessClass');
	
		evt.preventDefault();
		return false;
	},
	
	addListItem: function() {
		// Let's add a list item
		var itemNumber = this.ui.listItems.length + 1;
		var $li = ('<li><li>').text("Item " + itemNumber);
		$('<li><li>').insertAfter(this.ui.listItems.last());
		
		// In order for `this.ui.listItems` to include this new element
		// we need to update this.ui
		this.bindUIElements();
	}
});

var view = new MyView({
	el: $('#someRegion');
});

```

### Global Events

For those of you who enjoy pub/sub patterns, you views can now bind to global events. Check it out:

```javascript
var MyView = Backbone.View.extend({
	globalEvents: {
		"butterflyFlapsWings": "causeDisasterFarAway"
	},
	
	causeDisasterFarAway: function(butterflyLocation) {
		switch(butterflyLocation) {
			case "china":
				alert("Earthquake in California!");
				break;
			case "brazil":
				alert("Hurricane in Florida!");
				break;
			default:
				alert("Wing flappings from " + butterflyLocation + "have no effect.");
		}
	}
});

var view = new MyView();

Backbone.trigger("butterflyFlapsWings", "china");

```


### addInitializer Method

The sole purpose of this method is to limit the number of times you have to write `Backbone.View.prototype.initialize.apply(this, arguments);`. My fingers get tired just writing it in this README…

Hopefully it also keeps you from accidentally overwriting important initialize methods.

And it goes something like this:

```javascript
var ParentView = Backbone.View.extend({
	// This gets called before initialize, so I'm using it
	// If you have a better idea, let me know
	_configure: function() {
		// Don't forget to do this!
		Backbone.View.prototype._configure.apply(this, arguments);
		
		this.addInitializer(function() {
			alert("We're just getting started!");
		});
	}
});

var ChildView = Backbone.View.extend({
	initialize: function() {
		alert("No one touches my initialize method");
	}
});

var childView = new ChildView(); 
// "We're just getting started"
// "No one touches my initialize method"
```

Note that unlike `_configure`, your initializer function has access to `this.options`, `this.ui` as $ objects, `this.$el`, etc.

# Want to contribute?

I'm trying to keep this extension fairly limited to the few utility functions that I seem to need on every project. There are plenty of other libraries/extensions for Backbone that offer much more robust functionality. 

If you see something that's sorely missing from this extension, open an issue, or go ahead an submit a pull request. 

## Guidelines for pull requests

Before submitting a pull request:

* Make sure your contribution is limited to scope of this extension (see above)
* Add unit tests for any new methods (see Tests/backboneExtensionTest.js), and make sure they pass (run /specRunner.html).
	* If you haven't used Jasmine before, this is a good time to learn. Just take a look at the existing tests -- it's not as intimidating to write a new test as it may seem.
* If you're fixing a bug, create a test that replicates the bug, then make sure your test passes before submitting.
* Update backbone.extension-min.js (I use [jscompress](jscompress.com))
* Include a nice lil' commit message.
	


## Todo list:

Here are some things you can help out with. See guidelines above for submiting pull requests

### Define global event delgator

Currently, all global events are bound to the Backbone object. Best practice, however, would be to create separate delegators for separate pieces of your application, to limit the global-ness of your scope.

Something like this would be nice:

```javascript
MyApp.dispatcher = _.clone(Backbone.Events);

var MyView = Backbone.View.extend({
	eventDispatcher: MyApp.dispatcher,
	// …
});

MyOtherApp.dispatcher = _.clone(Backbone.Events);

var MyOtherView = Backbone.View.extend({
	eventDispatcher: MyOtherApp.dispatcher,
	// ...
});
```

You can also mixin the eventDispatcher into the View, so calling `this.trigger` or `this.on` would be the same as calling `this.eventDispatcher.trigger/on`.

### A better inheritance pattern

To be honest, the `addInitializer` method is kind of a lazy hack on my part. I would much prefer to replace Backbone's `extend` method with another inheritance helper that allows you to call `this._super()`, or some such thing.

John Resig has a nice little ["simple inheritence library"](http://ejohn.org/blog/simple-javascript-inheritance/) that I've used in the past to do just that. Anyone want to take a crack at incorporating this?

### Bugs

Yes, even heroic characters like myself create buggy code. If you find something, open an issue, submit a pull request with a fix, submit a pull request with a test that dups the bug (even if the test fails), or just go ahead on berate me publicly on your blog.