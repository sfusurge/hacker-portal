import argon2 from 'argon2';

export const hashPassword = async (password: string) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 32,
    });
    return hash;
  } catch (err) {
    throw new Error(`Hashing internal failure: ${(err as Error).message}`);
  }
};
