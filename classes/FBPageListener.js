// This class identifies which element on the page is the feed that
// we should react to. It monitors the number of elements and
// fires an event when that number changes.

var FBPageListener = function() {
  this.postCount  = -1;
  this.element    = null;
  this.$element   = null;
  this.callbacks  = [];
  this.pageLoaded = false;
};

FBPageListener.prototype.init = function() {
  var self = this;
  var initScopeFn = function() {
    // TODO make this better and support more pages
    self.$element = $('#substream_0 div').first();
    self.element = self.$element.get(0);

    if (self.element) {
      self.pageLoaded = true;
      self._listen();
    }

    // If the page hasn't been loaded yet, we try again
    if (!self.pageLoaded) {
      setTimeout(self.init, 250);
      console.debug('FBPageListener: Could not init(), retrying...');
    }
    setTimeout(initScopeFn, 250);
  };
  initScopeFn();
}

FBPageListener.prototype.addCallback = function(callback) {
  this.callbacks.push( callback );
}

FBPageListener.prototype.runCallbacks = function() {
  for (var i = 0; i < this.callbacks.length; i++) {
    this.callbacks[i]();
  }
  console.debug('FBPageListener: callbacks fired');
}

FBPageListener.prototype._listen = function () {
  var self = this;
  setInterval(function() {
    var lastPostCount = self.postCount;
    self.postCount = self.element.childNodes.length;

    if (self.postCount != lastPostCount) {
      self.runCallbacks();
    }
  }, 1000);
}

window.FBPageListener = FBPageListener;
