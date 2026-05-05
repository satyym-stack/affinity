'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createThought } from '@/lib/thoughts-api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { t } from '@/lib/tokens';

type WritePageProps = {
  onThoughtSaved: () => void;
};

export default function WritePage({ onThoughtSaved }: WritePageProps) {
  const { token } = useAuth();
  const [text, setText] = useState('');
  const [submitAction, setSubmitAction] = useState<'draft' | 'published' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(status: 'draft' | 'published') {
    const content = text.trim();

    if (!token) {
      setErrorMessage('Log in before saving a thought.');
      setSuccessMessage('');
      return;
    }

    if (!content) {
      setErrorMessage('Write a thought before saving it.');
      setSuccessMessage('');
      return;
    }

    setSubmitAction(status);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await createThought(
        {
          content,
          status,
          visibility: status === 'published' ? 'public' : 'private',
          prompt_source: null
        },
        token
      );
      setText('');
      setSuccessMessage(
        status === 'published'
          ? 'Thought published to the shared space.'
          : 'Draft saved to your profile.'
      );
      onThoughtSaved();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save your thought.'
      );
    } finally {
      setSubmitAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className={t.card}>
        <CardHeader>
          <CardTitle className={cn('text-3xl', t.fg)}>Write</CardTitle>
          <CardDescription className={t.fgMuted}>
            {token
              ? 'A quiet place to publish a raw thought.'
              : 'Log in to save and publish thoughts.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start with the sentence you would least likely post anywhere else."
            className={cn(
              'min-h-[320px] rounded-[28px] p-5 text-base leading-7',
              t.input
            )}
          />

          {(errorMessage || successMessage) && (
            <div
              className={cn(
                'rounded-2xl border px-4 py-3 text-sm',
                errorMessage
                  ? 'border-red-400/30 bg-red-500/10 text-red-200'
                  : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
              )}
            >
              {errorMessage || successMessage}
            </div>
          )}

          <div className="flex justify-end gap-3">
            {!token && (
              <Button asChild variant="outline" className={t.btnOutline}>
                <Link href="/login">Log in</Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => void handleSubmit('draft')}
              disabled={submitAction !== null || !token}
              className={t.btnOutline}
            >
              {submitAction === 'draft' ? 'Saving...' : 'Save draft'}
            </Button>
            <Button
              onClick={() => void handleSubmit('published')}
              disabled={submitAction !== null || !token}
              className={t.btnPrimary}
            >
              {submitAction === 'published' ? 'Publishing...' : 'Publish thought'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
