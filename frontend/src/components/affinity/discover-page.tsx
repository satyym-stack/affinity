'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageSquareQuote, Search, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { getNearbyUsers } from '@/lib/matching-api';
import { listPublicThoughts, type PublicThought } from '@/lib/thoughts-api';
import { searchUsers } from '@/lib/users-api';
import { cn } from '@/lib/utils';
import { t } from '@/lib/tokens';
import type { NearbyUser } from '@/types/matching';
import type { UserSearchResult } from '@/types/users';

type DiscoverPageProps = {
  thoughtVersion: number;
  onOpenUserProfile: (userId: number) => void;
};

export default function DiscoverPage({
  thoughtVersion,
  onOpenUserProfile
}: DiscoverPageProps) {
  const { token, user } = useAuth();
  const [matches, setMatches] = useState<NearbyUser[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchErrorMessage, setMatchErrorMessage] = useState('');
  const [recentThoughts, setRecentThoughts] = useState<PublicThought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState('');
  const trimmedSearchQuery = searchQuery.trim();

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      if (!token) {
        setMatches([]);
        setMatchErrorMessage('');
        setIsLoadingMatches(false);
        return;
      }

      setIsLoadingMatches(true);
      setMatchErrorMessage('');

      try {
        const nextMatches = await getNearbyUsers(token, 10);
        if (!cancelled) {
          setMatches(nextMatches);
        }
      } catch (error) {
        if (!cancelled) {
          setMatchErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load nearby minds.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMatches(false);
        }
      }
    }

    void loadMatches();

    return () => {
      cancelled = true;
    };
  }, [token, thoughtVersion]);

  useEffect(() => {
    let cancelled = false;

    async function loadThoughts() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const nextThoughts = await listPublicThoughts();
        if (!cancelled) {
          setRecentThoughts(nextThoughts);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load recent thoughts.'
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
  }, [thoughtVersion]);

  useEffect(() => {
    let cancelled = false;

    if (trimmedSearchQuery.length < 2) {
      setSearchResults([]);
      setSearchErrorMessage('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchErrorMessage('');

    const timeoutId = window.setTimeout(() => {
      async function loadSearchResults() {
        try {
          const nextResults = await searchUsers(trimmedSearchQuery, 8);
          if (!cancelled) {
            setSearchResults(nextResults);
          }
        } catch (error) {
          if (!cancelled) {
            setSearchResults([]);
            setSearchErrorMessage(
              error instanceof Error ? error.message : 'Unable to search users.'
            );
          }
        } finally {
          if (!cancelled) {
            setIsSearching(false);
          }
        }
      }

      void loadSearchResults();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [trimmedSearchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={cn('text-3xl font-semibold tracking-tight', t.fg)}>
            Discover
          </h1>
          <p className={cn('mt-2', t.fgMuted)}>
            Explore nearby and distant ways of seeing the world.
          </p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search className={cn('pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2', t.fgDim)} />
          <Input
            className={cn('h-12 rounded-2xl pl-11', t.input)}
            placeholder="Search users"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {trimmedSearchQuery.length >= 2 && (
        <Card className={t.cardSm}>
          <CardContent className="p-4">
            {isSearching && (
              <div className={cn('px-2 py-1 text-sm', t.fgMuted)}>
                Searching users...
              </div>
            )}

            {!isSearching && searchErrorMessage && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                {searchErrorMessage}
              </div>
            )}

            {!isSearching &&
              !searchErrorMessage &&
              searchResults.length === 0 && (
                <div className={cn('px-2 py-1 text-sm', t.fgMuted)}>
                  No users found.
                </div>
              )}

            {!isSearching &&
              !searchErrorMessage &&
              searchResults.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.user_id}
                      type="button"
                      onClick={() => onOpenUserProfile(result.user_id)}
                      className={cn(
                        'rounded-2xl p-4 text-left transition hover:bg-white/5',
                        t.inner
                      )}
                    >
                      <div className={cn('font-medium', t.fg)}>
                        {result.display_name}
                      </div>
                      <div className={cn('mt-1 text-sm', t.fgMuted)}>
                        @{result.username}
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="near" className="space-y-6">
        <TabsList className={t.tabList}>
          <TabsTrigger value="near" className="rounded-xl">
            Near you
          </TabsTrigger>
          <TabsTrigger value="recent" className="rounded-xl">
            Recent thoughts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="near">
          <div className="space-y-4">
            {!user && (
              <Card className={t.cardSm}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className={cn('text-lg font-medium', t.fg)}>
                      Sign in to discover nearby minds
                    </div>
                    <p className={cn('mt-2 text-sm', t.fgMuted)}>
                      Public thoughts are still available in the Recent thoughts tab.
                    </p>
                  </div>
                  <Button asChild className={t.btnPrimary}>
                    <Link href="/login">Log in</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {user && isLoadingMatches && (
              <Card className={t.cardSm}>
                <CardContent className={cn('p-6 text-sm', t.fgMuted)}>
                  Finding nearby minds...
                </CardContent>
              </Card>
            )}

            {user && !isLoadingMatches && matchErrorMessage && (
              <Card className={t.cardSm}>
                <CardContent className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
                  {matchErrorMessage}
                </CardContent>
              </Card>
            )}

            {user && !isLoadingMatches && !matchErrorMessage && matches.length === 0 && (
              <Card className={t.cardSm}>
                <CardContent className={cn('p-6 text-sm', t.fgMuted)}>
                  Publish a public thought to discover nearby minds.
                </CardContent>
              </Card>
            )}

            {user && !isLoadingMatches && !matchErrorMessage && matches.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                {matches.map((match) => (
                  <Card key={match.user_id} className={t.cardSm}>
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className={cn('truncate text-lg font-medium', t.fg)}>
                            {match.display_name}
                          </div>
                          <div className={cn('truncate text-sm', t.fgMuted)}>
                            @{match.username}
                          </div>
                        </div>
                        <Badge className={t.badgeAccent}>
                          {match.distance.toFixed(2)}
                        </Badge>
                      </div>

                      <div className={cn('flex items-center gap-2 text-sm', t.fgSoft)}>
                        <UserRound className="h-4 w-4" />
                        Semantic distance from your public thoughts
                      </div>

                      <Button
                        variant="outline"
                        className={cn('mt-4', t.btnOutline)}
                        onClick={() => onOpenUserProfile(match.user_id)}
                      >
                        View profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="space-y-4">
            {isLoading && (
              <Card className={t.cardSm}>
                <CardContent className={cn('p-6 text-sm', t.fgMuted)}>
                  Loading recent thoughts...
                </CardContent>
              </Card>
            )}

            {!isLoading && errorMessage && (
              <Card className={t.cardSm}>
                <CardContent className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
                  {errorMessage}
                </CardContent>
              </Card>
            )}

            {!isLoading && !errorMessage && recentThoughts.length === 0 && (
              <Card className={t.cardSm}>
                <CardContent className={cn('p-6 text-sm', t.fgMuted)}>
                  No public thoughts yet. Publish one from the Write flow to see
                  it here.
                </CardContent>
              </Card>
            )}

            {!isLoading &&
              !errorMessage &&
              recentThoughts.map((thought) => (
                <Card key={thought.id} className={t.cardSm}>
                  <CardContent className="p-6">
                    <div className={cn('mb-2 flex items-center gap-2 text-xs', t.fgMuted)}>
                      <MessageSquareQuote className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {thought.display_name} @{thought.username}
                      </span>
                    </div>
                    <p className={t.fg}>{thought.content}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
