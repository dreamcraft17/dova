import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminFeedback } from '../../hooks/admin/useAdminFeedback';
import { FEEDBACK_STATUSES, feedbackStatusLabel, type FeedbackStatus } from 'dova-shared';

const STATUS_TONE: Record<FeedbackStatus, 'yellow' | 'blue' | 'green' | 'gray'> = {
  open: 'yellow',
  planned: 'blue',
  in_progress: 'blue',
  done: 'green',
};

function FeedbackContent() {
  const { posts, loading, error, actionBusy, reload, setStatus, sendOfficialReply, publishChangelog } = useAdminFeedback();
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [replyMessage, setReplyMessage] = useState('');
  const [changelogForm, setChangelogForm] = useState({ title: '', summary: '', body: '' });
  const [changelogMessage, setChangelogMessage] = useState('');

  async function handleReply(postId: string) {
    const body = replies[postId]?.trim();
    if (!body) return;
    await sendOfficialReply(postId, body);
    setReplies((prev) => ({ ...prev, [postId]: '' }));
    setReplyMessage('Official reply posted.');
  }

  async function handlePublish(e: FormEvent) {
    e.preventDefault();
    await publishChangelog(changelogForm);
    setChangelogForm({ title: '', summary: '', body: '' });
    setChangelogMessage('Changelog entry published.');
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Product Feedback</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Feedback Board</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">
          Move ideas across the roadmap, reply officially, and publish changelog entries.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Retry
          </button>
        </Card>
      ) : null}

      <Card className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Idea</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Official reply</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No feedback posts yet.'}
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link href={`/feedback/${post.id}`} className="font-bold text-secondary hover:underline">
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{post.authorName}</p>
                  </TableCell>
                  <TableCell>{post.votes}</TableCell>
                  <TableCell>
                    <Select value={post.status} disabled={actionBusy} onValueChange={(v) => void setStatus(post.id, v as FeedbackStatus)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FEEDBACK_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {feedbackStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <StatusBadge tone={STATUS_TONE[post.status]} className="mt-1.5">
                      {feedbackStatusLabel(post.status)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Textarea
                        rows={2}
                        placeholder="Team response…"
                        value={replies[post.id] ?? ''}
                        onChange={(e) => setReplies((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      />
                      <Button size="sm" disabled={actionBusy} onClick={() => void handleReply(post.id)}>
                        Post reply
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {replyMessage ? <p className="mt-3 text-sm text-secondary">{replyMessage}</p> : null}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-base font-bold text-primary">Publish changelog</h2>
        <form className="max-w-xl space-y-3" onSubmit={(e) => void handlePublish(e)}>
          <div className="space-y-1.5">
            <Label htmlFor="changelog-title">Title</Label>
            <Input
              id="changelog-title"
              required
              minLength={3}
              value={changelogForm.title}
              onChange={(e) => setChangelogForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="changelog-summary">Summary</Label>
            <Input
              id="changelog-summary"
              required
              minLength={10}
              value={changelogForm.summary}
              onChange={(e) => setChangelogForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="changelog-body">Body</Label>
            <Textarea
              id="changelog-body"
              required
              minLength={10}
              rows={4}
              value={changelogForm.body}
              onChange={(e) => setChangelogForm((f) => ({ ...f, body: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={actionBusy}>
            Publish
          </Button>
          {changelogMessage ? <p className="text-sm text-secondary">{changelogMessage}</p> : null}
        </form>
      </Card>
    </div>
  );
}

export default function AdminFeedbackPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Feedback" subtitle="Roadmap & changelog">
          <FeedbackContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
