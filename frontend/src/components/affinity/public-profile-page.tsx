'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPublicUserProfile } from '@/lib/users-api';
import { cn } from '@/lib/utils';
import { t } from '@/lib/tokens';
import type { PublicUserProfile } from '@/types/users';

type PublicProfilePageProps = {
  userId: number;
  onBack: () => void;
};

export default function PublicProfilePage({
  userId,
  onBack
}: PublicProfilePageProps) {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const nextProfile = await getPublicUserProfile(userId);

        if (!cancelled) {
          setProfile(nextProfile);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load profile.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className={t.btnOutline}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {isLoading && (
        <Card className={t.card}>
          <CardContent className={cn('p-6 text-sm', t.fgMuted)}>
            Loading profile...
          </CardContent>
        </Card>
      )}

      {!isLoading && errorMessage && (
        <Card className={t.card}>
          <CardContent className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
            {errorMessage}
          </CardContent>
        </Card>
      )}

      {!isLoading && !errorMessage && profile && (
        <>
          <Card className={t.card}>
            <CardContent className="p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-app-violet text-xl font-semibold text-app-violet-fg ring-1 ring-app-violet-line">
                  {profile.display_name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h1 className={cn('truncate text-4xl font-semibold tracking-tight', t.fg)}>
                    {profile.display_name}
                  </h1>
                  <p className={cn('mt-1 text-sm', t.fgMuted)}>
                    @{profile.username}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={t.card}>
            <CardHeader>
              <CardTitle className={t.fg}>Public thoughts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.thoughts.length === 0 && (
                <div className={cn('rounded-2xl p-5 text-sm', t.inner, t.fgMuted)}>
                  This user has not published public thoughts yet.
                </div>
              )}

              {profile.thoughts.map((thought) => (
                <div key={thought.id} className={cn('rounded-2xl p-5', t.inner)}>
                  <div className={cn('mb-2 flex items-center gap-2 text-sm', t.fgMuted)}>
                    <MessageSquareQuote className="h-4 w-4" />
                    Public thought
                  </div>
                  <p className={t.fg}>{thought.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
