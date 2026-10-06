import { bcryptCost } from './bcrypt-cost';

describe('bcryptCost', () => {
  const previous = process.env.BCRYPT_ROUNDS;

  afterEach(() => {
    if (previous === undefined) delete process.env.BCRYPT_ROUNDS;
    else process.env.BCRYPT_ROUNDS = previous;
  });

  it('defaults to 12 when BCRYPT_ROUNDS is unset or invalid', () => {
    delete process.env.BCRYPT_ROUNDS;
    expect(bcryptCost()).toBe(12);
    process.env.BCRYPT_ROUNDS = '3';
    expect(bcryptCost()).toBe(12);
  });

  it('uses BCRYPT_ROUNDS when in 4–15', () => {
    process.env.BCRYPT_ROUNDS = '4';
    expect(bcryptCost()).toBe(4);
  });
});
