var uploader = (function() {
  // Video elements
  var video = document.querySelector('video');
  var canvas = $('<canvas>')[0];
  var ctx = canvas.getContext('2d'); 

  // constants
  var DELAY = 50;
  var WIDTH = 320;
  var HEIGHT = 240;
  var NUM_FRAMES = 3;

  // Video properties
  var frames;
  video.width = canvas.width = WIDTH;
  video.height = canvas.height = HEIGHT;

  var displayBlob = function(base64) {
    var image = document.createElement('img');
    image.src = 'data:image/bmp;base64,'+ base64;
    document.body.appendChild(image);    
  }  

  // Prepares the video camera, call when user clicks on react
  var prepare = function() {
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getUserMedia({
      video: true
    }, function(stream) {
      video.src = window.URL.createObjectURL(stream);
    }, function(err) {
    });  
  }

  var init = function(callback) {
    frames = NUM_FRAMES;

    var gif = new GIF({
      width: WIDTH,
      height: HEIGHT,
    });

    gif.on('finished', function(reaction) {
      blobToBase64(reaction, function(base64) {
        displayBlob(base64);
        // uploadToImgur(base64, callback);
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
    var auth = "Client-ID " + key.CLIENT_ID;       
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
