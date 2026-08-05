import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

function makeService() {
  return new FeedbackService();
}

describe('FeedbackService', () => {
  it('lists posts sorted by votes and supports search', () => {
    const service = makeService();
    expect(service.list('votes')[0].votes).toBeGreaterThanOrEqual(0);
    expect(service.list('votes', 'mobile').some((post) => post.title.toLowerCase().includes('mobile'))).toBe(true);
  });

  it('creates posts with unique slugs', () => {
    const service = makeService();
    const first = service.create({ title: 'Dark mode', description: 'Please add dark mode for night browsing.', authorName: 'Ada' });
    const second = service.create({ title: 'Dark mode', description: 'Another request for dark mode theme support.' , authorName: 'Bob' });
    expect(first.slug).not.toBe(second.slug);
  });

  it('supports voting and duplicate vote guard', () => {
    const service = makeService();
    const user = { id: 'u1', email: 'user@test.com', fullName: 'User', role: 'customer' as const, isActive: true, createdAt: '', passwordHash: '' };
    const post = service.create({ title: 'Wallet', description: 'Support bank transfer alongside Paystack.' }, user);
    expect(() => service.vote(post.id, user)).toThrow(BadRequestException);
  });

  it('stores comments and official admin replies', () => {
    const service = makeService();
    const post = service.posts[0];
    service.addComment(post.id, { body: 'Great idea!', authorName: 'Guest' });
    const admin = { id: 'a1', email: 'admin@dova.local', fullName: 'Admin', role: 'admin' as const, isActive: true, createdAt: '', passwordHash: '' };
    const customer = { id: 'u2', email: 'user@test.com', fullName: 'User', role: 'customer' as const, isActive: true, createdAt: '', passwordHash: '' };
    service.addComment(post.id, { body: 'We are reviewing this.' }, admin, true);
    expect(service.listComments(post.id)).toHaveLength(2);
    expect(post.commentCount).toBe(2);
    expect(() => service.addComment(post.id, { body: 'Nope' }, customer, true)).toThrow(ForbiddenException);
  });

  it('manages changelog entries', () => {
    const service = makeService();
    expect(service.listChangelogs().length).toBeGreaterThan(0);
    const created = service.createChangelog({
      title: 'Supplier analytics',
      summary: 'New supplier dashboard widgets.',
      body: 'Suppliers can now see weekly order trends on their dashboard.',
    });
    expect(service.getChangelog(created.slug).title).toBe('Supplier analytics');
  });

  it('groups roadmap columns and restricts admin actions', () => {
    const service = makeService();
    expect(service.roadmap().planned.length).toBeGreaterThan(0);
    expect(() => service.assertAdmin({ id: 'u2', role: 'customer' } as never)).toThrow(ForbiddenException);
  });
});
