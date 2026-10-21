// Fonts belong to the document. Starting in the head avoids shifting navigation
// beneath a pointer while the React island is downloading or hydrating.
export const fontInitialization = `
(() => {
  for (const weight of [400, 600]) {
    document.fonts.load(weight + ' 1em "Open Sans"', 'BESbswy').then(faces => {
      if (!faces.length) return;
      document.documentElement.dataset['font' + weight] = 'loaded';
      document.dispatchEvent(new Event('site:fonts-loaded'));
    }, () => {});
  }
  document.addEventListener('astro:before-swap', event => {
    for (const weight of [400, 600]) {
      const key = 'font' + weight;
      if (document.documentElement.dataset[key] === 'loaded') {
        event.newDocument.documentElement.dataset[key] = 'loaded';
      }
    }
  });
})();
`;
