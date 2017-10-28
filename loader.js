class loader {
  constructor(paths) {
    this.paths = paths;
  }

  loadImage(url, callback) {
    let image = new Image();
    image.src = url;
    image.onload = callback.bind(this);
    return image;
  }

  load(callback) {
    let images = [];
    let imagesToLoad = this.paths.length;
    let onImageLoad = function() {
      imagesToLoad--;
      if (imagesToLoad == 0) {
        callback(images);
      }
    }.bind(this);
    for (let i = 0; i < imagesToLoad; i++) {
      let image = this.loadImage(this.paths[i], onImageLoad.bind(this));
      images.push(image);
    }
  }
}
