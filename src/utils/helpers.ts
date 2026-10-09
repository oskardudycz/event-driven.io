export function getScreenWidth() {
  if (typeof window !== `undefined`) {
    return window.innerWidth;
  }
  return undefined;
}

export function isWideScreen() {
  if (typeof window !== `undefined`) {
    const windowWidth = window.innerWidth;
    const mediaQueryL = 1024;

    return windowWidth >= mediaQueryL;
  }
  return undefined;
}

export function timeoutThrottlerHandler(
  timeouts: Record<string, ReturnType<typeof setTimeout> | null>,
  name: string,
  delay: number,
  handler: () => void,
) {
  if (!timeouts[name]) {
    timeouts[name] = setTimeout(() => {
      timeouts[name] = null;
      handler();
    }, delay);
  }
}
