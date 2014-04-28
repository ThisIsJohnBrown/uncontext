function Uncontext() {
  this.readyToLog_ = false;
  this.socket_ = null;
}

Uncontext.prototype.init = function() {
  var self = this;

  try {
    self.socket_ = io.connect('literature.uncontext.com:80');

    self.socket_.on('0', function (data) {
      if ($('.data:visible').length) {
        $('.data ul').prepend('<li>' + JSON.stringify(data) + '</li>');
      }
      $('.data ul li:eq(5)').remove();
    });
  } catch (e) {
    // Sockets not initialized.
  }
}

var uncontext = new Uncontext();
uncontext.init();

$(function() {
  $('.toggle').click(function() {
    $('header').toggle();
    $('.data ul li').remove();
  })
});