export function integerOption(
  value: string,
  name: string,
  minimum: number,
  maximum: number,
): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error(`${name} must be between ${minimum} and ${maximum}`);
  }
  return number;
}
