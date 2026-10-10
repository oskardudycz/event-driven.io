declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export = classes;
}
declare module '*.css';
