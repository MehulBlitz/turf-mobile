const isTouchDevice =
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  navigator.maxTouchPoints > 1;
const isDesktopViewport = !isTouchDevice && window.matchMedia('(min-width: 760px)').matches;

if (isDesktopViewport) {
  import('./src-desktop/main.jsx');
} else {
  import('./src/main.jsx');
}
