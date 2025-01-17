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
      r = (r * b) % m;
    }

    b = (b * b) % m;
    e = e >> 1;
  }
  return r;
}

function LCG_at_N(n: number, a: number, b: number, m: number, seed: number) {
  const multi = (seed * powerMod(a, n, m)) % m;

  const p = (a - 1) * m;
  const incre = (b * ((powerMod(a, n, p) - 1) % p)) / (a - 1);

  return Math.floor(multi + incre) % m;
}

/**
 * Hull Dobell theorem
 * LCG would generate number covering the range of [0-m] iff
 * 1. m and b are coprime
 * 2. a - 1 is divisible by all prime factors of m
 * 3. a - 1 is divisible by 4 if m is divisible by 4.
 */
const d6Params = Object.freeze({
  a: 29, // (4 * 7 + 1) -> a - 1 is disible by 2 and 7
  b: 97, // co prime with m since 97 is prime
  m: 917504, // 2**17 * 7, a large 6 digit number that has lots of repeated factors
  seed: 173429, // any starting seed works
});

/**
 * return the nth term the LCG sequence with the above configuration.
 * For example n could be the sequential id of a user, and result would be their display id.
 */
export function getSixDigitId(n: number) {
  return `${LCG_at_N(n, d6Params.a, d6Params.b, d6Params.m, d6Params.seed)}`.padStart(
    6,
    '0'
  );
}
