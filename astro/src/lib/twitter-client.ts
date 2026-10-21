type TwitterWindow = Window & { twttr?: { widgets?: { load: () => void } } };
export function loadTwitterWidgets() {
  if (!document.querySelector('.twitter-tweet')) return;
  const current = window as TwitterWindow;
  if (current.twttr?.widgets) {
    current.twttr.widgets.load();
    return;
  }
  if (document.getElementById('twitter-wjs')) return;
  const script = document.createElement('script');
  script.id = 'twitter-wjs';
  script.src = 'https://platform.twitter.com/widgets.js';
  script.async = true;
  script.addEventListener('load', () => current.twttr?.widgets?.load(), {
    once: true,
  });
  document.head.append(script);
}
