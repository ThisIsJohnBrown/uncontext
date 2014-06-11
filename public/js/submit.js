$(function() {
  $('.submission-success').hide();
  $('#submit-button').click(function(e) {
    $.get('/submit-project/', $('#submit-project').serialize());
    $('#submit-project').hide();
    $('.submission-success').show();
    e.preventDefault();
  });
});