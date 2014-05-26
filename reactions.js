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

  function showReactionsPanel(event) {
    console.log(event.data.value);
    $('body').addClass('stop-scrolling').append(reactionFrameHtml);
    Uploader.prepare();
    console.log("Preparing");

    $('#create-gif').click(function() {
      Uploader.init(function(data) {
        if (data) {
          console.log('https://imgur.com/gallery/' + data); 
          $(event.data.value).parent().parent().next().find('textarea').text('https://imgur.com/gallery/' + data);
          hideReactionsPanel();
        }
      }); 
    });
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
        $react.on("click", {value: value}, showReactionsPanel);
        reactButtonCount++;
      });
      console.debug('Injected ' + reactButtonCount + ' reaction tags');
    });
    pageListener.init();

  });
})(this);
