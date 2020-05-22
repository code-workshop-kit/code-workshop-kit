/**
 * Resolves after provided amount of miliseconds.
 *
 * @example
 * await aTimeout(100);
 *
 * @param {number} ms Miliseconds.
 * @returns {Promise<void>} Promise to await until time is up
 */
export function aTimeout(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
