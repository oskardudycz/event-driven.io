// Escape backslashes and Markdown/HTML punctuation together, in one pass.
export const markdownLabel = (value) => String(value).replace(/[\\`*_[\]<>]/g, '\\$&');
