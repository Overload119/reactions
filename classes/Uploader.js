var Uploader = (function() {
  // Video elements
  var video;
  var canvas = $('<canvas>')[0];
  var ctx = canvas.getContext('2d');

  // Extra
  var localStream;

  // constants
  var DELAY = 200;
  var WIDTH = 320;
  var HEIGHT = 240;
  var NUM_FRAMES = 30;

  // Prepares the video camera, call when user clicks on react
  var prepare = function() {
    video = document.querySelector('#video-source');
    video.width = canvas.width = WIDTH;
    video.height = canvas.height = HEIGHT;

    var onSuccess = function(stream) {
      localStream = stream;
      video.src = window.URL.createObjectURL(localStream);
    }

    var onError = function(error) {
    }

    navigator.webkitGetUserMedia({ 'video': true }, onSuccess, onError);
  }

  var init = function(callback) {
    var frames = NUM_FRAMES;

    var gif = new GIF({
      width: WIDTH,
      height: HEIGHT,
    });

    $('.r-timer-bar-text').text('Recording...');
    var interval = setInterval(function() {
      ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);
      gif.addFrame(ctx.getImageData(0, 0, WIDTH, HEIGHT));
      frames--;

      $('#video-timer .progress-bar').css('width', (((NUM_FRAMES - frames) / NUM_FRAMES) * 100) + '%');

      if (frames > 0) {
        return;
      }

      // Finished getting all of the images
      clearInterval(interval);
      gif.render();
      $('.r-timer-bar-text').text('Uploading...');
    }, DELAY);

    // Fired once the gif has been composed
    gif.on('finished', function(reaction) {
      blobToBase64(reaction, function(base64) {
        uploadToImgur(base64, callback);
      });
    });
  }

  // Uploads a base64 gif to imgur
  var uploadToImgur = function(base64, callback) {
    var auth = "Client-ID " + Constants.CLIENT_ID;
    $.ajax({
      url: 'https://api.imgur.com/3/image',
      method: 'POST',
      headers: {
        Authorization: auth,
        Accept: 'application/json'
      },
      data: {
        image: base64,
        type: 'base64'
      },
      success: function(result) {
        var imgurLink = 'https://imgur.com/gallery/' + result.data.id;
        var localLink = 'data:image/bmp;base64,'+ base64;
        callback.call(this, imgurLink, localLink);
      }
    });
  }

  // Converts a blob to a base64 object
  var blobToBase64 = function(blob, callback) {
    var reader = new FileReader();
    reader.onload = function() {
      var dataUrl = reader.result;
      var base64 = dataUrl.split(',')[1];
      callback(base64);
    };
    reader.readAsDataURL(blob);
  };

  var cleanup = function() {
    localStream.stop();
    localStream = null;
    console.debug('Uploader: cleanup()');
  }

  return {
    recordAndUpload: init,
    prepare: prepare,
    cleanup: cleanup
  }
})();

window.Uploader = Uploader;
