const generic = new Set(['', 'text', 'plaintext', 'plain', 'none']);
const aliases = {
  javascript: 'typescript',
  js: 'typescript',
  'c#': 'csharp',
  cs: 'csharp',
  'c++': 'cpp',
  shellscript: 'bash',
  shell: 'bash',
  yml: 'yaml',
};
export function codeLanguage(code, supplied = '', fallback = '') {
  const language = supplied
    .trim()
    .toLowerCase()
    .replace(/^language-/, '');
  const typed =
    /\b(?:export\s+type|(?:export\s+)?interface|type\s+\w+(?:\s*<[^>]+>)?\s*(?:=|\{)|Readonly<|Promise<|import\s*\{[^}]*\btype\b)/m.test(
      code,
    ) ||
    /\b(?:const|let|private|public|readonly)\s+\w+\s*[?!]?\s*:\s*[A-Za-z]/.test(code) ||
    /function\s+\w+\s*\([^)]*\b\w+\s*:\s*[A-Za-z]/.test(code);
  if ((language === 'javascript' || language === 'js') && typed) return 'typescript';
  if (!generic.has(language)) return aliases[language] || language;
  if (fallback) return fallback;
  const text = code.trim();
  try {
    if (/^[[{]/.test(text)) {
      JSON.parse(text);
      return 'json';
    }
  } catch {
    // A JSON-shaped example may be another language; continue inference.
  }
  if (/^\s*public\s+(?:static |async )?(?:void|Task(?:<[^>]*>)?)\s+[A-Z]\w+\(/m.test(text))
    return 'csharp';
  if (
    /^(?:using [\w.]+;|namespace \w|public (?:sealed |abstract |static )?(?:class|record|interface|enum)\b)/m.test(
      text,
    )
  )
    return 'csharp';
  if (
    /^\s*(?:SELECT\b|CREATE\s+(?:TABLE|INDEX|FUNCTION|TYPE|EXTENSION)|INSERT\s+INTO|ALTER\s+(?:TABLE|TYPE)|EXPLAIN\b|WITH\s+\w+\s+AS\s*\()/im.test(
      text,
    )
  )
    return 'sql';
  if (typed) return 'typescript';
  if (
    /^\s*(?:import\s+[\w{*]|export\s+(?:async\s+)?(?:function|const|class)|(?:async\s+)?function\s+\w+|(?:const|let)\s+\w+\s*=|await\s+\w+\.)/m.test(
      text,
    ) ||
    /\([^\n]*\)\s*=>/.test(text)
  )
    return 'typescript';
  if (/^\s*(?:\$\s+)?(?:sudo|npm|npx|yarn|docker|aws|curl|psql|git|dotnet|node)\s+/m.test(text))
    return 'bash';
  if (/^<\?xml\b|^<[a-z][\w:-]*(?:\s|>)/i.test(text)) return 'xml';
  if (/^\[[\w.-]+\]\s*$/m.test(text) && /^\w+\s*=/m.test(text)) return 'ini';
  return 'text';
}

export function labelCodeFences(markdown, fallback = '') {
  return markdown.replace(
    /^(`{3,})([^\n]*)\n([\s\S]*?)^\1[ \t]*$/gm,
    (_, fence, supplied, code) =>
      `${fence}${codeLanguage(code, supplied, fallback)}\n${code}${fence}`,
  );
}
