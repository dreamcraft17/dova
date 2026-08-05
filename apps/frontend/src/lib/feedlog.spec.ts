/**
 * Native DOVA feedback board helpers.
 * @author Dozer (@dreamraft17) - Software Engineer
 */
import { FEEDBACK_PATH, getFeedlogFeedbackHref, getFeedlogUrl, isFeedlogEnabled, isFeedlogSameOrigin } from './feedlog';

describe('native feedback links', () => {
  it('enables feedback by default', () => {
    expect(isFeedlogEnabled()).toBe(true);
  });

  it('uses the /feedback path on the storefront', () => {
    expect(getFeedlogUrl()).toBe(FEEDBACK_PATH);
    expect(getFeedlogFeedbackHref()).toBe('/feedback');
    expect(getFeedlogFeedbackHref({ returnTo: '/roadmap' })).toBe('/feedback/roadmap');
  });

  it('is always same-origin', () => {
    expect(isFeedlogSameOrigin()).toBe(true);
  });
});
