// This class identifies which element on the page is the feed that
// we should react to. It monitors the number of elements and
// fires an event when that number changes.

var FBPageListener = function() {
  this.postCount    = -1;
  this.element      = null;
  this.$element     = null;
  this.callbacks    = [];
  this.pageLoaded   = false;
  
  this.commentElements = [];
  this.callback = null;
  this.commentIds = {};
};

FBPageListener.prototype._listen = function () {
  var self = this;
  var interval = setInterval(function() {
    var lastPostCount = self.postCount;
    self.postCount = self.commentElements.length;

    if (self.postCount != lastPostCount) {
      self.reactInjector();
    }
  }, 1000);
}

FBPageListener.prototype.init = function(callback) {
  var self = this;
  self.callback = callback;
  var initScopeFn = function() {
    // TODO make this better and support more pages
    self.commentElements = $('.commentable_item');

    if (self.commentElements) {
      self.pageLoaded = true;
      self._listen();
    } else if (!self.pageLoaded) {
    // If the page hasn't been loaded yet, we try again
      setTimeout(initScopeFn, 250);
      console.debug('FBPageListener: Could not init(), retrying...');
    }
    setTimeout(initScopeFn, 2500);
  };
  initScopeFn();
}

FBPageListener.prototype.runCallbacks = function() {
  for (var i = 0; i < this.callbacks.length; i++) {
    this.callbacks[i]();
  }
  console.debug('FBPageListener: callbacks fired');
}

FBPageListener.prototype.reactInjector = function() {
  var self = this;
  $('.commentable_item').each(function(index, value) {
    var key = jQuery.parseJSON($(value).find("> input:nth-child(3)").attr("value")).target_fbid;
    if (!(key in self.commentIds)) {
      self.commentIds[key] = $(value).find('textarea');
      var $react = $('<span><a class="UFILikeLink">React</span>')
      var dotPrefix = document.createTextNode(' · ');
      $(value).find('.clearfix:first > div').append(dotPrefix).append($react);
      $react.on("click", {input: self.commentIds[key]}, self.callback);
    }
  });
}

window.FBPageListener = FBPageListener;
