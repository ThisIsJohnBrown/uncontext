$(function() {
  console.log(uncontext);
  if (uncontext.isMobile_) {
    $('.submission-video').each(function() {
      $(this).replaceWith('<img src=' + $(this).attr('data-mobile') + ' />');
    })
  } else if (!document.createElement('video').canPlayType) {
    $('.submission-video').each(function() {
      $(this).replaceWith('<img src=' + $(this).attr('data-fallback') + ' />');
    })
  }
});