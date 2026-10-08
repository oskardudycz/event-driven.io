// Width measurement stays with the component; this calculation retains model
// indexes rather than copying translated text or losing icon/link properties.
export function getOverflowedIndexes(widths, availableWidth) {
  const hidden = [];
  let cumulativeWidth = 0;
  widths.forEach((width, index) => {
    cumulativeWidth += width;
    if (cumulativeWidth > availableWidth) hidden.push(index);
  });
  return hidden;
}
