/**
 * Resolves after provided amount of miliseconds.
 *
 * @example
 * await aTimeout(100);
 */
export function aTimeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
