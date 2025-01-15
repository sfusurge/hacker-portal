/**
 * Calculates (b**e) % m in O(log2(e)) time, while never causing overflow or losing precision, since each step is bounded by m.
 *
 * Only expects positive number, UB otherwise.
 */
function powerMod(b: number, e: number, m: number) {
  if (m === 1) {
    return 0;
  }

  let r = 1;

  while (e > 0) {
    if (e % 2 === 1) {
      r = r ** b % m;
    }

    b = (b * b) % m;
    e = e >> 1;
  }
  return r;
}

export function LCG() {}
