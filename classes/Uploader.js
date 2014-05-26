var Uploader = (function() {
  // Video elements
  var video;
  var canvas = $('<canvas>')[0];
  var ctx = canvas.getContext('2d');

  // constants
  var DELAY = 70;
  var WIDTH = 320;
  var HEIGHT = 240;
  var NUM_FRAMES = 20;

  var displayBlob = function(base64) {
    var image = document.createElement('img');
    image.src = 'data:image/bmp;base64,'+ base64;
    document.querySelector(".r-panel").appendChild(image);
  }

  // Prepares the video camera, call when user clicks on react
  var prepare = function() {
    video = document.querySelector('#video-source');
    video.width = canvas.width = WIDTH;
    video.height = canvas.height = HEIGHT;

    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getUserMedia({
      video: true
    }, function(stream) {
      video.src = window.URL.createObjectURL(stream);
    }, function(err) {
    });
  }

  var init = function(callback) {
    var frames = NUM_FRAMES;

    var gif = new GIF({
      width: WIDTH,
      height: HEIGHT,
    });

    gif.on('finished', function(reaction) {
      blobToBase64(reaction, function(base64) {
        displayBlob(base64);
        uploadToImgur(base64, callback);
      });
    });
    var interval = setInterval(function() {
      ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);
      gif.addFrame(ctx.getImageData(0, 0, WIDTH, HEIGHT));
      frames--;

      if (frames > 0) {
        return;
      }

      // Finished getting all of the images
      clearInterval(interval);
      gif.render();
    }, DELAY);
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
        callback(result.data.id);
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

  return {
    init: init,
    prepare: prepare
  }
})();

window.Uploader = Uploader;
