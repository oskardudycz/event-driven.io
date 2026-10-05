// Group DOM writes and reads so overflow calculation needs one layout flush.
export function getOverflowedItems(container, items, reservedWidth) {
  items.forEach((item) => {
    item.classList.add('item');
    item.classList.remove('hideItem');
  });
  const maxWidth = container.offsetWidth - reservedWidth;
  const widths = items.map((item) => item.offsetWidth);
  const hiddenItems = [];
  let cumulativeWidth = 0;
  items.forEach((item, index) => {
    cumulativeWidth += widths[index];
    if (!item.classList.contains('more') && cumulativeWidth > maxWidth) {
      const link = item.querySelector('a');
      item.classList.add('hideItem');
      item.classList.remove('item');
      hiddenItems.push({ to: link.getAttribute('data-slug'), label: link.text });
    }
  });
  return hiddenItems;
}
