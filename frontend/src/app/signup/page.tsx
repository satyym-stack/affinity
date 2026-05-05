'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { t } from '@/lib/tokens';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const { signup, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [isLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await signup({
        email,
        username,
        display_name: displayName,
        password
      });
      router.push('/');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to create account.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={cn('flex min-h-screen items-center justify-center p-6', t.page)}>
      <Card className={cn('w-full max-w-md', t.card)}>
        <CardHeader>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-app-violet ring-1 ring-app-violet-line">
            <Sparkles className="h-5 w-5 text-app-violet-fg" />
          </div>
          <CardTitle className={cn('text-3xl', t.fg)}>Create account</CardTitle>
          <CardDescription className={t.fgMuted}>
            Start saving thoughts into your own semantic space.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className={cn('text-sm font-medium', t.fg)} htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={cn('h-11 rounded-2xl', t.input)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={cn('text-sm font-medium', t.fg)} htmlFor="username">
                Username
              </label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={cn('h-11 rounded-2xl', t.input)}
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <label className={cn('text-sm font-medium', t.fg)} htmlFor="display-name">
                Display name
              </label>
              <Input
                id="display-name"
                autoComplete="name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className={cn('h-11 rounded-2xl', t.input)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={cn('text-sm font-medium', t.fg)} htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={cn('h-11 rounded-2xl', t.input)}
                required
                minLength={8}
              />
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              className={cn('h-11 w-full', t.btnPrimary)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className={cn('mt-5 text-sm', t.fgMuted)}>
            Already have an account?{' '}
            <Link href="/login" className="text-app-violet-fg hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
