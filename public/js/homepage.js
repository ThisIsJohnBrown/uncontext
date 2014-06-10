var speed = .3;
var maxRows = 5;

var dividers = [];
$trs = null;
$(function() {
  init();

  uncontext.socket_.onmessage = function (event) {
    data = JSON.parse(event.data);
    if ($('#demo-table').length && uncontext.socketData_.a) {
      // console.log($(this).find('tr').length);
      $trs = $('#demo-table tbody tr');
      $($trs[0]).find('td:eq(1)').append('<span>' + uncontext.socketData_.a + '</span>');
      $($trs[1]).find('td:eq(1)').append('<span>' + uncontext.socketData_.b + '</span>');
      $($trs[2]).find('td:eq(1)').append('<span>' + uncontext.socketData_.c + '</span>');
      $($trs[3]).find('td:eq(1)').append('<span>' + uncontext.socketData_.d + '</span>');
      $($trs[4]).find('td:eq(1)').append('<span>' + uncontext.socketData_.e.f + '</span>');
      $($trs[5]).find('td:eq(1)').append('<span>' + uncontext.socketData_.e.g + '</span>');
      $trs.each(function() {
        // console.log($(this));
        $(this).find('td:eq(1) span:eq(5)').remove();
      })
    }

    uncontext.socketData_ = data;
  };
})

function addItem(i, iTotal, size, direction, yOffset, now) {
  var item = {};
  item.position = [direction ? i/iTotal : 1 - i/iTotal, yOffset];
  item.finalSize = size;
  item.currSize = 0;
  item.start = now;
  item.delay = i * 100;
  return item;
}

function init() {
  window.onresize();
}

window.onresize = function(event) {
  // canvas.width = canvas.offsetWidth;
  // canvas.height = canvas.offsetHeight;
};
