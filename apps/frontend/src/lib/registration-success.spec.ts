import { isRegistrationSuccessBackdropClick, isRegistrationSuccessContinueKey } from './registration-success';

describe('registration success modal helpers', () => {
  it.each(['Escape', 'Enter'])('continues on %s', (key) => {
    expect(isRegistrationSuccessContinueKey(key)).toBe(true);
  });

  it.each(['Tab', 'a', ' '])('does not continue on %s', (key) => {
    expect(isRegistrationSuccessContinueKey(key)).toBe(false);
  });

  it('continues only when the click is on the backdrop, not the card', () => {
    const backdrop = {};
    const card = {};
    expect(isRegistrationSuccessBackdropClick(backdrop, backdrop)).toBe(true);
    expect(isRegistrationSuccessBackdropClick(card, backdrop)).toBe(false);
  });
});
