(function(window) {
  var reactionFrameHtml;
  var gifProvider = new GifProvider(true);

  $.get(chrome.extension.getURL('/reactions.html'), function(data) {
    reactionFrameHtml = data;
    console.debug('Retrieved reactions html');
  });

  var onClickPreviewGif = function(evt) {
    var gifId = $(this).data('id');
    var $gifContainer = $('#r-gif-container');
    $gifContainer.find('.gif-container-overlay').show();

    var gif = gifProvider.findById( gifId );
    $gifContainer.find('.gif-container-overlay img').attr('src', gifProvider.getImagePathFor(gif));
    $gifContainer.find('.gif-inner-container').hide();

    console.debug('onClickPreviewGif()');
  }

  var onClickGifPreviewOverlay = function(evt) {
    $('#r-gif-container .gif-inner-container').show();
    $('#r-gif-container .gif-container-overlay').hide();
  }

  var setupEvents = function() {
    $('body').on('click', '#r-gif-container .gif-inner-container .r-img', onClickPreviewGif);
    $('body').on('click', '#r-gif-container .gif-container-overlay', onClickGifPreviewOverlay);
  }

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

<<<<<<< HEAD
  function showReactionsPanel(event) {
    console.log(event.data.value);
=======
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

  function showReactionsPanel() {
>>>>>>> Add code for gif provider
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
