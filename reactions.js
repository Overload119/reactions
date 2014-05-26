(function(window) {
  var reactionFrameHtml;

  $.get(chrome.extension.getURL('/reactions.html'), function(data) {
    reactionFrameHtml = data;
    console.debug('Retrieved reactions html');
  });

  function hideReactionsPanel() {
    $('.r-panel').stop(0, 0).fadeOut(250, function() {
      $('.r-background').fadeOut(250, function() {
        $('.r-background').remove();
        $('#r-panel').remove();
        $(window).off('keyup').off('mousedown');
        $('body').removeClass('stop-scrolling');
      });
    });

    console.debug('hideReactionsPanel()');
  }

  function showReactionsPanel() {
    $('body').addClass('stop-scrolling').append(reactionFrameHtml);

    $('.r-background').fadeIn(250, function() {
      $('.r-panel').fadeIn(250, function() {
        $(window).on('keyup', function(evt) {
          if (evt.keyCode === 27) {
            hideReactionsPanel();
          }
        });

        $(window).on('mousedown', function(evt) {
          // Hide panel if they click anywhere outside the panel
          if ($(evt.target).closest('.r-panel').length === 0) {
            hideReactionsPanel();
          }
        });

        console.debug('showReactionsPanel()');
      });
    });
  }

  $(document).ready(function() {
    var pageListener = new FBPageListener();
    pageListener.addCallback(function() {
      var reactButtonCount = 0;
      $('.comment_link').each(function(index, value) {
        var $react = $('<span><a class="UFILikeLink">React</span>')
        var dotPrefix = document.createTextNode(' · ');
        $(value).parent().append(dotPrefix).append($react);
        $react.click(showReactionsPanel);
        reactButtonCount++;
      });
      console.debug('Injected ' + reactButtonCount + ' reaction tags');
    });
    pageListener.init();

  });
})(this);
