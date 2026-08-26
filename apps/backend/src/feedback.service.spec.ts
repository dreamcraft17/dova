import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { DatabaseService } from './database.service';

function makeDatabase() {
  return { enabled: false } as DatabaseService;
}

function makeService() {
  return new FeedbackService(makeDatabase());
}

describe('FeedbackService', () => {
  it('lists posts sorted by votes and supports search', async () => {
    const service = makeService();
    const posts = await service.list('votes');
    expect(posts[0].votes).toBeGreaterThanOrEqual(0);
    expect((await service.list('votes', 'mobile')).some((post) => post.title.toLowerCase().includes('mobile'))).toBe(true);
  });

  it('creates posts with unique slugs', async () => {
    const service = makeService();
    const first = await service.create({ title: 'Dark mode', description: 'Please add dark mode for night browsing.', authorName: 'Ada' });
    const second = await service.create({ title: 'Dark mode', description: 'Another request for dark mode theme support.', authorName: 'Bob' });
    expect(first.slug).not.toBe(second.slug);
  });

  it('supports voting and duplicate vote guard', async () => {
    const service = makeService();
    const user = { id: 'u1', email: 'user@test.com', fullName: 'User', role: 'customer' as const, isActive: true, createdAt: '', passwordHash: '' };
    const post = await service.create({ title: 'Wallet', description: 'Support bank transfer alongside Paystack.' }, user);
    await expect(service.vote(post.id, user)).rejects.toThrow(BadRequestException);
  });

  it('stores comments and official admin replies', async () => {
    const service = makeService();
    const post = service.posts[0];
    await service.addComment(post.id, { body: 'Great idea!', authorName: 'Guest' });
    const admin = { id: 'a1', email: 'admin@dova.local', fullName: 'Admin', role: 'admin' as const, isActive: true, createdAt: '', passwordHash: '' };
    const customer = { id: 'u2', email: 'user@test.com', fullName: 'User', role: 'customer' as const, isActive: true, createdAt: '', passwordHash: '' };
    await service.addComment(post.id, { body: 'We are reviewing this.' }, admin, true);
    expect(await service.listComments(post.id)).toHaveLength(2);
    expect(post.commentCount).toBe(2);
    await expect(service.addComment(post.id, { body: 'Nope' }, customer, true)).rejects.toThrow(ForbiddenException);
  });

  it('manages changelog entries', async () => {
    const service = makeService();
    expect((await service.listChangelogs()).length).toBeGreaterThan(0);
    const created = await service.createChangelog({
      title: 'Supplier analytics',
      summary: 'New supplier dashboard widgets.',
      body: 'Suppliers can now see weekly order trends on their dashboard.',
    });
    expect((await service.getChangelog(created.slug)).title).toBe('Supplier analytics');
  });

  it('groups roadmap columns and restricts admin actions', async () => {
    const service = makeService();
    expect((await service.roadmap()).planned.length).toBeGreaterThan(0);
    expect(() => service.assertAdmin({ id: 'u2', role: 'customer' } as never)).toThrow(ForbiddenException);
  });
});
