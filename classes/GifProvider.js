function GifProvider(forceCache) {
  this.gifsByTag = {};
  this.gifsById = {};
  if (forceCache) {
    var self = this;
    $.get(chrome.extension.getURL('/metagif.json'), function(gifMetaInfo) {
      var gifs = JSON.parse( gifMetaInfo );

      gifs.forEach(function( gif ) {
        var tag = gif['tag'];
        if (self.gifsByTag[tag]) {
          self.gifsByTag[tag].push( gif );
        } else {
          self.gifsByTag[tag] = [ gif ];
        }
        self.gifsById[gif.id] = gif;
      });

      console.debug('Loaded ' + gifs.length + ' gifs.');
    });
  }
}

GifProvider.prototype.findById = function(gifId) {
  if (this.gifsById[gifId]) {
    return this.gifsById[gifId];
  } else {
    console.warn('GifProvider: No gif found with id %s', gifId);
    return null;
  }
}

GifProvider.prototype.getPreviewImagePathFor = function(gif) {
  if (gif.id) {
    return chrome.extension.getURL( './gifs/' + gif.id + 's.jpg');
  }
}

GifProvider.prototype.getImagePathFor = function(gif) {
  if (gif.id) {
    return chrome.extension.getURL( './gifs/' + gif.id + '.gif');
  }
}

GifProvider.prototype.get = function(tag) {
  return this.gifsByTag[ tag ];
}

window.GifProvider = GifProvider;
