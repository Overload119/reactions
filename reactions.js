(function(window) {
  var reactionFrameHtml;
  var gifProvider = new GifProvider(true);
  var $lastGifImg;

  $.get(chrome.extension.getURL('/reactions.html'), function(data) {
    reactionFrameHtml = data;
    console.debug('Retrieved reactions html');
  });

  // Start code for EVENTS
  var onClickPreviewGif = function(evt) {
    var gifId = $(this).data('id');
    var $gifContainer = $('#r-gif-container');
    $gifContainer.find('.gif-container-overlay').addClass('show');

    var gif = gifProvider.findById( gifId );
    $gifContainer.find('.gif-container-overlay img').attr('src', gifProvider.getImagePathFor(gif));
    $gifContainer.find('.gif-inner-container').hide();
    $gifContainer.find('#gif-overlay-use').data('id', gifId);

    $lastGifImg = $(this);

    console.debug('onClickPreviewGif()');
  }

  var onClickGifPreviewOverlay = function(evt) {
    // Fired when you exit the preview screen for a gif
    $('#r-gif-container .gif-inner-container').show();
    $('#r-gif-container .gif-container-overlay').removeClass('show');

    // Shows a bouncy animation to highlight the last GIF the user just viewed
    var lastGif = $lastGifImg;
    lastGif.addClass('bounce').one('webkitAnimationEnd', function() {
      lastGif.removeClass('bounce');
    });
  }

  var onClickGifPost = function(evt) {
    var gifId     = $(this).data('id');
    var gif       = gifProvider.findById(gifId);
    var imgurLink = gif.link;

    // TODO: Uncomment when ready
    // CommentInjector.addPost( imgurLink );
  }

  var onClickCreate = function(evt) {
    $('#video-container').show();
    Uploader.prepare();
    // Add a small delay for the webcam to get ready
    setTimeout(function() {
      Uploader.recordAndUpload(function(imgurLink, localLink) {
        console.debug('Gif uploaded to: ' + imgurLink);
        $('#video-source').hide();
        $('#video-preview').attr('src', localLink).show();
        $('.r-timer-bar-text').text('Done!');
      });
    }, 500);
    Uploader.cleanup();
  }

  var setupEvents = function() {
    $('body').on('click', '#r-gif-container .gif-inner-container .r-img', onClickPreviewGif);
    $('body').on('click', '#r-gif-container .gif-container-overlay', onClickGifPreviewOverlay);
    $('body').on('click', '#r-gif-container #gif-overlay-use', onClickGifPost);

    $('body').on('click', '#create-gif', onClickCreate);
  }

  // End code for EVENTS

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

  function showAllTags() {
    $('#r-tag-container').slideDown();

    $('#r-tag-disgust').click(function() {
      $('#r-tag-container').slideUp(400, function() {

        $('#r-gif-container').slideDown();

        var gifs = gifProvider.get('disgust');
        var imageHtml = '';
        gifs.forEach(function(gif) {
          var imgSrc = gifProvider.getPreviewImagePathFor( gif );
          imageHtml += '<img src="' + imgSrc + '" class="r-img" data-id="' + gif.id + '" />';
        });

        $('#r-gif-container .gif-inner-container').html(imageHtml);
      });
    });
  }

  function showReactionsPanel(data) {
    var input = data.input;
    var prepare = data.prepare;

    $('body').addClass('stop-scrolling').append(reactionFrameHtml);
    Uploader.prepare();
    console.log("Preparing");

    $('#create-gif').click(function() {
      Uploader.init(function(data) {
        if (data) {
          var url = 'https://imgur.com/gallery/' + data;
          prepare();
          input.text(url);
          hideReactionsPanel();
        }
      });
    });
    $('.r-background').fadeIn(250, function() {
      $('.r-panel').fadeIn(250, function() {

        $('#r-search').click(function() {
          $('#r-search').addClass('selected');
          showAllTags();
        });


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
    setupEvents();
    var pageListener = new FBPageListener();

    pageListener.init(function(event) {
      showReactionsPanel(event.data);   
    });
  });
})(this);
