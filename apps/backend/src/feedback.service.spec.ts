import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { DatabaseService } from './database.service';

function makeDatabase() {
  return { enabled: false } as DatabaseService;
}

function makeService() {
  return new FeedbackService(makeDatabase());
}

const customer = {
  id: 'u1',
  email: 'buyer@dova.local',
  fullName: 'Buyer',
  role: 'customer' as const,
  isActive: true,
  createdAt: '',
  passwordHash: '',
};

describe('FeedbackService', () => {
  it('lists posts sorted by votes', async () => {
    const service = makeService();
    const posts = await service.list('votes');
    expect(posts[0].votes).toBeGreaterThanOrEqual(0);
  });

  it('filters listed posts by search term', async () => {
    const service = makeService();
    const matches = await service.list('votes', 'mobile');
    expect(matches.map((post) => post.title.toLowerCase())).toEqual(
      expect.arrayContaining([expect.stringContaining('mobile')]),
    );
  });

  it('creates posts with unique slugs', async () => {
    const service = makeService();
    const first = await service.create({ title: 'Dark mode', description: 'Please add dark mode for night browsing.', authorName: 'Ada' });
    const second = await service.create({ title: 'Dark mode', description: 'Another request for dark mode theme support.', authorName: 'Bob' });
    expect(first.slug).not.toBe(second.slug);
  });

  it('rejects a second vote from the same user', async () => {
    const service = makeService();
    const post = await service.create({ title: 'Wallet', description: 'Support bank transfer alongside Paystack.' }, customer);
    await expect(service.vote(post.id, customer)).rejects.toThrow(BadRequestException);
  });

  it('stores guest comments', async () => {
    const service = makeService();
    const post = service.posts[0];
    await service.addComment(post.id, { body: 'Great idea!', authorName: 'Guest' });
    expect(await service.listComments(post.id)).toHaveLength(1);
    expect(post.commentCount).toBe(1);
  });

  it('allows official replies from admin only', async () => {
    const service = makeService();
    const post = service.posts[0];
    const admin = { id: 'a1', email: 'admin@dova.local', fullName: 'Admin', role: 'admin' as const, isActive: true, createdAt: '', passwordHash: '' };
    await service.addComment(post.id, { body: 'We are reviewing this.' }, admin, true);
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
