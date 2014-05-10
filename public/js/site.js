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
    self.socket_ = io.connect('literature.uncontext.com:80');

    self.socket_.on('0', function (data) {
      if ($('.data').length) {
        $('.data table tbody').prepend('<tr>\
          <td>' + JSON.stringify(data.a) + '</td>\
          <td>' + JSON.stringify(data.b) + '</td>\
          <td>' + JSON.stringify(data.c) + '</td>\
          <td>' + JSON.stringify(data.d) + '</td>\
          <td><span>f: ' + JSON.stringify(data.e.f) + '</span><span>g: ' + JSON.stringify(data.e.g) + '</span></td>\
        </tr>');
      }
      $('.data table tr:eq(' + max_rows + ')').remove();
    });
  } catch (e) {
    // Sockets not initialized.
  }
}

var uncontext = new Uncontext();
uncontext.init();