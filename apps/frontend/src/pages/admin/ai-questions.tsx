import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminAiQuestions } from '../../hooks/admin/useAdminAiQuestions';

function AiQuestionsContent() {
  const [search, setSearch] = useState('');
  const { questions, loading, error, reload } = useAdminAiQuestions(search);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Conversation Insights</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">AI Questions</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">Questions sent to DOVA AI by signed-in customers and visitors.</p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>Retry</button>
        </Card>
      ) : null}

      <Card className="p-5">
        <Input
          placeholder="Search question, customer name, or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-4 md:max-w-md"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Asked by</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No AI questions yet.'}
                </TableCell>
              </TableRow>
            ) : questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="max-w-[560px] whitespace-normal font-medium">{question.text}</TableCell>
                <TableCell>
                  {question.userName ? (
                    <div><div className="font-bold">{question.userName}</div><div className="text-xs text-muted-foreground">{question.userEmail}</div></div>
                  ) : <span className="text-muted-foreground">Visitor</span>}
                </TableCell>
                <TableCell>{question.userId ? 'Logged in' : 'Guest'}</TableCell>
                <TableCell className="whitespace-nowrap">{new Date(question.createdAt).toLocaleString('en-NG')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function AdminAiQuestionsPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="AI Questions" subtitle="Questions asked through DOVA AI">
          <AiQuestionsContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
