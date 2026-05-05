'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  deleteThought,
  listMyThoughts,
  type Thought,
  updateThought
} from '@/lib/thoughts-api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { t } from '@/lib/tokens';

type ProfilePageProps = {
  thoughtVersion: number;
};

export default function ProfilePage({ thoughtVersion }: ProfilePageProps) {
  const { token, user } = useAuth();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState('');
  const [editingThoughtId, setEditingThoughtId] = useState<number | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [savingThoughtId, setSavingThoughtId] = useState<number | null>(null);
  const [deletingThoughtId, setDeletingThoughtId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const publicThoughts = thoughts.filter(
    (thought) => thought.status === 'published' && thought.visibility === 'public'
  );

  useEffect(() => {
    let cancelled = false;

    async function loadThoughts() {
      if (!token) {
        setThoughts([]);
        setLoadErrorMessage('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadErrorMessage('');

      try {
        const nextThoughts = await listMyThoughts(token);
        if (!cancelled) {
          setThoughts(nextThoughts);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load your thoughts.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadThoughts();

    return () => {
      cancelled = true;
    };
  }, [thoughtVersion, token]);

  function handleStartEditing(thought: Thought) {
    setEditingThoughtId(thought.id);
    setDraftContent(thought.content);
    setSaveMessage('');
    setActionErrorMessage('');
  }

  function handleCancelEditing() {
    setEditingThoughtId(null);
    setDraftContent('');
    setSavingThoughtId(null);
    setActionErrorMessage('');
  }

  async function handleSaveThought(thought: Thought) {
    const content = draftContent.trim();

    if (!token) {
      setActionErrorMessage('Log in before editing thoughts.');
      setSaveMessage('');
      return;
    }

    if (!content) {
      setActionErrorMessage('Thoughts cannot be empty.');
      setSaveMessage('');
      return;
    }

    setSavingThoughtId(thought.id);
    setActionErrorMessage('');
    setSaveMessage('');

    try {
      const updatedThought = await updateThought(
        thought.id,
        {
          content,
          status: thought.status,
          visibility: thought.visibility,
          prompt_source: thought.prompt_source
        },
        token
      );

      setThoughts((currentThoughts) =>
        currentThoughts.map((currentThought) =>
          currentThought.id === updatedThought.id ? updatedThought : currentThought
        )
      );
      setEditingThoughtId(null);
      setDraftContent('');
      setSaveMessage('Thought updated.');
    } catch (error) {
      setActionErrorMessage(
        error instanceof Error ? error.message : 'Unable to update your thought.'
      );
      setSaveMessage('');
    } finally {
      setSavingThoughtId(null);
    }
  }

  async function handleDeleteThought(thought: Thought) {
    if (!token) {
      setActionErrorMessage('Log in before deleting thoughts.');
      setSaveMessage('');
      return;
    }

    setDeletingThoughtId(thought.id);
    setActionErrorMessage('');
    setSaveMessage('');

    try {
      await deleteThought(thought.id, token);
      setThoughts((currentThoughts) =>
        currentThoughts.filter(
          (currentThought) => currentThought.id !== thought.id
        )
      );

      if (editingThoughtId === thought.id) {
        setEditingThoughtId(null);
        setDraftContent('');
      }

      setSaveMessage('Thought deleted.');
    } catch (error) {
      setActionErrorMessage(
        error instanceof Error ? error.message : 'Unable to delete your thought.'
      );
    } finally {
      setDeletingThoughtId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className={t.card}>
        <CardContent className="p-7">
          <div>
            <h1 className={cn('text-4xl font-semibold tracking-tight', t.fg)}>
              {user?.display_name ?? 'Your profile'}
            </h1>
            <p className={cn('mt-3 max-w-2xl', t.fgSoft)}>
              {user
                ? `@${user.username}`
                : 'Log in to see your saved thoughts and profile.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className={t.card}>
          <CardHeader>
            <CardTitle className={t.fg}>Your thoughts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {isLoading && (
              <div className={cn('p-5 text-sm', t.inner, t.fgMuted)}>
                Loading your thoughts...
              </div>
            )}

            {!token && (
              <div className={cn('p-5 text-sm', t.inner, t.fgMuted)}>
                <div>Log in to view, edit, and delete your thoughts.</div>
                <Button asChild className={cn('mt-4', t.btnPrimary)}>
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            )}

            {token && !isLoading && loadErrorMessage && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200">
                {loadErrorMessage}
              </div>
            )}

            {token && !isLoading && !loadErrorMessage && thoughts.length === 0 && (
              <div className={cn('p-5 text-sm', t.inner, t.fgMuted)}>
                No thoughts yet. Publish one from Home or Write to start filling
                out your profile.
              </div>
            )}

            {token &&
              !isLoading &&
              !loadErrorMessage &&
              thoughts.map((thought) => (
                <div key={thought.id} className={cn('p-5', t.inner)}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className={cn('text-xs uppercase tracking-[0.2em]', t.fgDim)}>
                      {thought.status === 'published' ? 'Published' : 'Draft'}
                    </div>
                    <div className="flex gap-2">
                      {editingThoughtId !== thought.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEditing(thought)}
                          disabled={deletingThoughtId === thought.id}
                          className={t.btnOutline}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDeleteThought(thought)}
                        disabled={
                          savingThoughtId === thought.id ||
                          deletingThoughtId === thought.id
                        }
                        className="rounded-2xl border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                      >
                        {deletingThoughtId === thought.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>

                  {editingThoughtId === thought.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={draftContent}
                        onChange={(event) => setDraftContent(event.target.value)}
                        className={cn(
                          'min-h-[160px] rounded-[24px] p-4 text-base leading-7',
                          t.input
                        )}
                      />
                      <div className="flex flex-wrap justify-end gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEditing}
                          disabled={
                            savingThoughtId === thought.id ||
                            deletingThoughtId === thought.id
                          }
                          className={t.btnOutline}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => void handleSaveThought(thought)}
                          disabled={
                            savingThoughtId === thought.id ||
                            deletingThoughtId === thought.id
                          }
                          className={t.btnPrimary}
                        >
                          {savingThoughtId === thought.id ? 'Saving...' : 'Save changes'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={t.fg}>{thought.content}</div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {(actionErrorMessage || saveMessage) && !isLoading && (
            <Card className={t.card}>
              <CardContent
                className={cn(
                  'p-5 text-sm',
                  actionErrorMessage
                    ? 'rounded-2xl border border-red-400/30 bg-red-500/10 text-red-200'
                    : 'rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                )}
              >
                {actionErrorMessage || saveMessage}
              </CardContent>
            </Card>
          )}

          <Card className={t.card}>
            <CardHeader>
              <CardTitle className={t.fg}>Recent public thoughts</CardTitle>
            </CardHeader>
            <CardContent className={cn('space-y-3', t.fgSoft)}>
              {publicThoughts.length === 0 && (
                <div className={cn('p-4 text-sm', t.inner)}>
                  Publish a public thought to show it here.
                </div>
              )}

              {publicThoughts.slice(0, 2).map((thought) => (
                <div key={thought.id} className={cn('p-4', t.inner)}>
                  {thought.content}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
