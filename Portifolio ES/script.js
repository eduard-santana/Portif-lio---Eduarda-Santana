(function () {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  let isDown = false;
  let startX, scrollLeft;

  timeline.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - timeline.offsetLeft;
    scrollLeft = timeline.scrollLeft;
  });
  ['mouseleave', 'mouseup'].forEach((evt) => timeline.addEventListener(evt, () => (isDown = false)));
  timeline.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - timeline.offsetLeft;
    timeline.scrollLeft = scrollLeft - (x - startX) * 1.2;
  });
})();