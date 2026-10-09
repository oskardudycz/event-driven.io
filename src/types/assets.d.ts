declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export = classes;
}
declare module '*.css';
declare module '*.yaml' {
  const theme: Record<string, unknown>;
  export default theme;
}
