import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ChangelogEntry, FeedbackComment, FeedbackPost, FeedbackStatus } from 'dova-shared';
import { StoredUser } from './database.service';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'idea';
}

@Injectable()
export class FeedbackService {
  posts: FeedbackPost[] = [];
  comments: FeedbackComment[] = [];
  changelogs: ChangelogEntry[] = [];

  constructor() {
    const seed: Array<[string, string, FeedbackStatus, number]> = [
      ['Mobile app for suppliers', 'Native mobile dashboard for stock updates on the go.', 'planned', 12],
      ['Bulk order discounts', 'Tiered pricing when ordering large quantities weekly.', 'open', 8],
      ['Delivery slot reminders', 'SMS reminder before morning/evening delivery window.', 'in_progress', 15],
    ];
    seed.forEach(([title, description, status, votes]) => {
      this.posts.push(this.makePost({ title, description, status, authorName: 'DOVA Community', votes }));
    });

    this.changelogs.push({
      id: randomUUID(),
      slug: 'feedback-board-launch',
      title: 'Native feedback board is live',
      summary: 'Submit ideas, vote, and follow the public roadmap inside DOVA.',
      body: 'The DOVA feedback board replaces the external FeedLog app. Customers and suppliers can share ideas, vote when logged in, and track delivery on the roadmap and changelog.',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  private uniqueSlug(base: string) {
    let slug = slugify(base);
    let i = 1;
    while (this.posts.some((post) => post.slug === slug)) {
      slug = `${slugify(base)}-${i++}`;
    }
    return slug;
  }

  private syncCommentCount(postId: string) {
    const post = this.posts.find((item) => item.id === postId);
    if (post) post.commentCount = this.comments.filter((c) => c.postId === postId).length;
  }

  private makePost(input: {
    title: string;
    description: string;
    status?: FeedbackStatus;
    authorName: string;
    authorEmail?: string;
    userId?: string;
    votes?: number;
    voterIds?: string[];
  }): FeedbackPost {
    const post: FeedbackPost = {
      id: randomUUID(),
      slug: this.uniqueSlug(input.title),
      title: input.title.trim(),
      description: input.description.trim(),
      status: input.status ?? 'open',
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      userId: input.userId,
      votes: input.votes ?? 0,
      voterIds: input.voterIds ?? [],
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };
    return post;
  }

  list(sort: 'votes' | 'new' = 'votes', search = '') {
    const q = search.trim().toLowerCase();
    let items = [...this.posts];
    if (q) {
      items = items.filter(
        (post) => post.title.toLowerCase().includes(q) || post.description.toLowerCase().includes(q),
      );
    }
    items.sort((a, b) =>
      sort === 'new'
        ? b.createdAt.localeCompare(a.createdAt)
        : b.votes - a.votes || b.createdAt.localeCompare(a.createdAt),
    );
    return items;
  }

  find(id: string) {
    const post = this.posts.find((item) => item.id === id);
    if (!post) throw new NotFoundException('Feedback post not found');
    return post;
  }

  roadmap() {
    const columns: Record<FeedbackStatus, FeedbackPost[]> = {
      open: [],
      planned: [],
      in_progress: [],
      done: [],
    };
    for (const post of this.posts) columns[post.status].push(post);
    for (const key of Object.keys(columns) as FeedbackStatus[]) {
      columns[key].sort((a, b) => b.votes - a.votes);
    }
    return columns;
  }

  create(body: { title: string; description: string; authorName?: string; authorEmail?: string }, user?: StoredUser | null) {
    const authorName = user?.fullName || body.authorName?.trim();
    if (!authorName) throw new BadRequestException('Author name is required');
    const post = this.makePost({
      title: body.title,
      description: body.description,
      authorName,
      authorEmail: user?.email || body.authorEmail?.trim(),
      userId: user?.id,
      votes: user ? 1 : 0,
      voterIds: user ? [user.id] : [],
    });
    this.posts.unshift(post);
    return post;
  }

  vote(postId: string, user: StoredUser) {
    const post = this.find(postId);
    if (post.voterIds.includes(user.id)) throw new BadRequestException('You already voted for this idea');
    post.voterIds.push(user.id);
    post.votes += 1;
    return post;
  }

  setStatus(postId: string, status: FeedbackStatus) {
    const post = this.find(postId);
    post.status = status;
    return post;
  }

  listComments(postId: string) {
    this.find(postId);
    return this.comments
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  addComment(
    postId: string,
    body: { body: string; authorName?: string },
    user?: StoredUser | null,
    isOfficial = false,
  ) {
    this.find(postId);
    const authorName = user?.fullName || body.authorName?.trim();
    if (!authorName) throw new BadRequestException('Author name is required');
    if (isOfficial && user?.role !== 'admin') throw new ForbiddenException();
    const comment: FeedbackComment = {
      id: randomUUID(),
      postId,
      body: body.body.trim(),
      authorName,
      userId: user?.id,
      isOfficial,
      createdAt: new Date().toISOString(),
    };
    this.comments.push(comment);
    this.syncCommentCount(postId);
    return comment;
  }

  listChangelogs() {
    return [...this.changelogs].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  getChangelog(slug: string) {
    const entry = this.changelogs.find((item) => item.slug === slug);
    if (!entry) throw new NotFoundException('Changelog entry not found');
    return entry;
  }

  createChangelog(body: { title: string; summary: string; body: string }) {
    const base = slugify(body.title);
    let slug = base;
    let i = 1;
    while (this.changelogs.some((entry) => entry.slug === slug)) slug = `${base}-${i++}`;
    const entry: ChangelogEntry = {
      id: randomUUID(),
      slug,
      title: body.title.trim(),
      summary: body.summary.trim(),
      body: body.body.trim(),
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.changelogs.unshift(entry);
    return entry;
  }

  assertAdmin(user: StoredUser) {
    if (user.role !== 'admin') throw new ForbiddenException();
  }
}
