// This class identifies which element on the page is the feed that
// we should react to. It monitors the number of elements and
// fires an event when that number changes.

var FBPageListener = function() {
  this.postCount    = -1;
  this.element      = null;
  this.$element     = null;
  this.callbacks    = [];
  this.pageLoaded   = false;
  this.callback = null;
  
  this.commentElements = [];
  this.commentList = {};
  this.commentLinks = {};
  this.commentInputs = {};
};

FBPageListener.prototype._listen = function () {
  var self = this;
  var interval = setInterval(function() {
    var lastPostCount = self.postCount;
    self.postCount = self.commentElements.length;

    if (self.postCount !== lastPostCount) {
      console.log(self.postCount);
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
  // A commentable item is a form containing like, share and comments
  $('.commentable_item').each(function(index, value) {
    // Fetch the ID of the post
    var inputs = $(value).find("input");
    var newsFeedItem = null;

    // Find the hidden input that contains a JSON with post ID 
    $(inputs).each(function() {
      if ($(this).attr("name") === "feedback_params") {
        newsFeedItem = this; 
      } 
    });

    // If not found, don't do anything with this form
    if (!newsFeedItem) {
      return;
    }

    // The key is the post ID. It is unique for every post
    var key = jQuery.parseJSON($(newsFeedItem).attr("value")).target_fbid;
    // Make sure not to repeat anything
    if (!(key in self.commentInputs) && $(value).find('textarea').length !== 0) {
      // Fetch the comment link and the comment input 
      console.log("Injected react");

      // This is the container for the comment list
      self.commentList[key] = $(value).find('div.UFIContainer ul.UFIList');

      // This is the comment box where user puts there input
      self.commentInputs[key] = $(value).find('textarea');

      // This is the comment button. Click this to display comment list if not displayed already
      self.commentLinks[key] = $(value).find('input.uiLinkButtonInput');

      // Append the React link
      var $react = $('<span><a class="UFILikeLink">React</span>')
      var dotPrefix = document.createTextNode(' · ');
      var actions = $(value).find('.clearfix').find("label").parent();
      $(actions).append(dotPrefix).append($react);

      // Attach a callback on clicking the react link
      $react.on("click", {
        input: self.commentInputs[key],
        prepare: function() {
          if (self.commentList[key].css('display') == 'none') {
            $(value).removeClass("collapsed_comments");
          }
        }
      }, self.callback);
    }
  });
}

window.FBPageListener = FBPageListener;
