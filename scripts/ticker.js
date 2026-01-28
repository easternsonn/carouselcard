function initNewsTicker(selector = '#newsTickerTrack') {
  const track = document.querySelector(selector);
  if (!track) return;

  // If user prefers reduced motion, stop animation
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.documentElement.setAttribute('data-reduce-motion', 'true');
    return;
  }

  // Duplicate items so the loop is seamless
  const items = Array.from(track.children);
  if (items.length === 0) return;

  // Ensure the content is at least 2x wide for a smooth loop
  const originalWidth = track.scrollWidth;
  let i = 0;
  while (track.scrollWidth < originalWidth * 2 && i < 500) {
    track.appendChild(items[i % items.length].cloneNode(true));
    i++;
  }

  // Set speed based on total width (approx 80px/s)
  const pxPerSecond = 80;
  const durationSeconds = track.scrollWidth / pxPerSecond;
  track.style.setProperty('--ticker-duration', `${durationSeconds}s`);

}

document.addEventListener('DOMContentLoaded', () => {
  initNewsTicker('#newsTickerHeaderTrack');
  initNewsTicker('#newsTickerCardsTrack');
});