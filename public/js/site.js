function Uncontext() {
  this.readyToLog_ = false;
  this.socket_ = null;
}

Uncontext.prototype.init = function() {
  var self = this;
  var max_rows = 6;
  if (document.documentElement.clientWidth > 500) {
    max_rows = 17;
  }

  try {
    self.socket_ = new WebSocket('ws://literature.uncontext.com:80');
  } catch (e) {
    // Sockets not initialized.
  }
}

var uncontext = new Uncontext();
uncontext.init();