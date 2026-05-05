'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LocateFixed, Minus, Plus, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getMapUsers, recomputeMapPositions } from '@/lib/map-api';
import { createThought } from '@/lib/thoughts-api';
import { getPublicUserProfile } from '@/lib/users-api';
import { useAuth } from '@/lib/auth-context';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { t } from '@/lib/tokens';
import type { MapUser } from '@/types/map';
import type { PublicUserProfile } from '@/types/users';

type HomePageProps = {
  thoughtVersion: number;
  onThoughtSaved: () => void;
  onOpenUserProfile: (userId: number) => void;
};

function getMapDistance(first: MapUser, second: MapUser) {
  const xDistance = first.x - second.x;
  const yDistance = first.y - second.y;
  return Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));
}

function getClosenessLabel(distance: number) {
  if (distance < 0.25) {
    return 'Very close';
  }

  if (distance < 0.65) {
    return 'Nearby';
  }

  return 'Farther away';
}

export default function HomePage({
  thoughtVersion,
  onThoughtSaved,
  onOpenUserProfile
}: HomePageProps) {
  const { token, user } = useAuth();
  const [writeOpen, setWriteOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitAction, setSubmitAction] = useState<'draft' | 'published' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mapUsers, setMapUsers] = useState<MapUser[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isRecomputingMap, setIsRecomputingMap] = useState(false);
  const [mapMessage, setMapMessage] = useState('');
  const [mapErrorMessage, setMapErrorMessage] = useState('');
  const [selectedMapUserId, setSelectedMapUserId] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PublicUserProfile | null>(null);
  const [isLoadingSelectedProfile, setIsLoadingSelectedProfile] = useState(false);
  const [selectedProfileError, setSelectedProfileError] = useState('');
  const [mapZoom, setMapZoom] = useState(2.4);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const selectedMapUser =
    mapUsers.find((mapUser) => mapUser.user_id === selectedMapUserId) ?? null;
  const currentMapUser =
    mapUsers.find((mapUser) => mapUser.user_id === user?.id) ?? null;
  const selectedDistance =
    currentMapUser && selectedMapUser && currentMapUser.user_id !== selectedMapUser.user_id
      ? getMapDistance(currentMapUser, selectedMapUser)
      : null;
  const nearestMapUsers = currentMapUser
    ? mapUsers
        .filter((mapUser) => mapUser.user_id !== currentMapUser.user_id)
        .map((mapUser) => ({
          ...mapUser,
          distance: getMapDistance(currentMapUser, mapUser)
        }))
        .sort((first, second) => first.distance - second.distance)
        .slice(0, 5)
    : [];

  function getViewportPosition(mapUser: MapUser) {
    return {
      x: 50 + (mapUser.x * 42 * mapZoom) + mapOffset.x,
      y: 50 + (mapUser.y * 42 * mapZoom) + mapOffset.y
    };
  }

  async function loadMapUsers() {
    const nextMapUsers = await getMapUsers();
    setMapUsers(nextMapUsers);
  }

  async function handleRecomputeMap() {
    if (!token) {
      setMapErrorMessage('Log in before refreshing the map.');
      return;
    }

    setIsRecomputingMap(true);
    setMapErrorMessage('');
    setMapMessage('');

    try {
      const result = await recomputeMapPositions(token);
      await loadMapUsers();
      setMapMessage(result.message);
    } catch (error) {
      setMapErrorMessage(
        error instanceof Error ? error.message : 'Unable to refresh the map.'
      );
    } finally {
      setIsRecomputingMap(false);
    }
  }

  function handleCenterOnMe() {
    if (!currentMapUser) {
      return;
    }

    setMapOffset({
      x: -(currentMapUser.x * 42 * mapZoom),
      y: -(currentMapUser.y * 42 * mapZoom)
    });
  }

  function handleResetMapView() {
    setMapZoom(2.4);
    setMapOffset({ x: 0, y: 0 });
  }

  async function handleSelectMapUser(mapUser: MapUser) {
    setSelectedMapUserId(mapUser.user_id);
    setSelectedProfile(null);
    setSelectedProfileError('');
    setIsLoadingSelectedProfile(true);

    try {
      const profile = await getPublicUserProfile(mapUser.user_id);
      setSelectedProfile(profile);
    } catch (error) {
      setSelectedProfileError(
        error instanceof Error ? error.message : 'Unable to load this profile.'
      );
    } finally {
      setIsLoadingSelectedProfile(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      setIsLoadingMap(true);
      setMapErrorMessage('');

      try {
        if (token) {
          const result = await recomputeMapPositions(token);
          if (!cancelled) {
            setMapMessage(result.message);
          }
        }

        const nextMapUsers = await getMapUsers();

        if (!cancelled) {
          setMapUsers(nextMapUsers);
        }
      } catch (error) {
        if (!cancelled) {
          setMapErrorMessage(
            error instanceof Error ? error.message : 'Unable to load the map.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMap(false);
        }
      }
    }

    void loadMap();

    return () => {
      cancelled = true;
    };
  }, [token, thoughtVersion]);

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
      setSuccessMessage('');
    } finally {
      setSubmitAction(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Compact post bar */}
        <Card className={t.card}>
          <CardContent className="p-4">
            <button
              onClick={() => {
                setErrorMessage('');
                setSuccessMessage('');
                setWriteOpen(true);
              }}
              className="flex w-full items-center gap-3 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-violet text-sm font-medium text-app-violet-fg ring-1 ring-app-violet-line">
                {user?.display_name.slice(0, 1).toUpperCase() ?? 'Y'}
              </div>
              <div className={cn('flex-1 rounded-full border border-app-line bg-app-surface-hover px-5 py-3 text-sm transition hover:bg-app-surface-hover', t.fgMuted)}>
                Add another thought to sharpen your place in the space.
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Semantic space map */}
        <Card className={t.card}>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className={t.fg}>Semantic space</CardTitle>
              <CardDescription className={t.fgMuted}>
                Similar thoughts appear closer together
              </CardDescription>
              {!isLoadingMap && !mapErrorMessage && mapUsers.length > 0 && (
                <div className={cn('mt-2 flex flex-wrap items-center gap-3 text-xs', t.fgDim)}>
                  <span>
                    {mapUsers.length} mapped {mapUsers.length === 1 ? 'mind' : 'minds'}
                  </span>
                  {mapMessage && <span>{mapMessage}</span>}
                  <button
                    type="button"
                    onClick={handleResetMapView}
                    className="text-teal-200 hover:underline"
                  >
                    Reset view
                  </button>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => void handleRecomputeMap()}
              disabled={!token || isRecomputingMap}
              className={t.btnOutline}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', isRecomputingMap && 'animate-spin')} />
              {isRecomputingMap ? 'Refreshing...' : 'Refresh map'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 xl:grid-cols-[minmax(720px,1fr)_minmax(300px,360px)] 2xl:grid-cols-[minmax(900px,1fr)_380px]">
            <div className="relative h-[min(68vh,720px)] min-h-[460px] overflow-hidden rounded-[28px] border border-app-line bg-[radial-gradient(circle_at_center,#1e1b4b,transparent_25%),#020617]">
              <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-white/10" />
              <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-white/10" />

              <div className="absolute right-4 top-4 z-10 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMapZoom((current) => Math.min(5, current + 0.4))}
                  className={cn('h-9 w-9 rounded-2xl bg-slate-950/70 text-white', t.btnOutline)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMapZoom((current) => Math.max(1, current - 0.4))}
                  className={cn('h-9 w-9 rounded-2xl bg-slate-950/70 text-white', t.btnOutline)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCenterOnMe}
                  disabled={!currentMapUser}
                  className={cn('h-9 w-9 rounded-2xl bg-slate-950/70 text-white', t.btnOutline)}
                >
                  <LocateFixed className="h-4 w-4" />
                </Button>
              </div>

              <div className={cn('absolute left-4 top-4 z-10 rounded-2xl px-3 py-2 text-xs text-white', t.overlayLabel)}>
                {currentMapUser ? 'Your dot is white' : 'Publish a public thought to appear here'}
              </div>

              {currentMapUser && selectedMapUser && currentMapUser.user_id !== selectedMapUser.user_id && (
                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                  <line
                    x1={`${getViewportPosition(currentMapUser).x}%`}
                    y1={`${getViewportPosition(currentMapUser).y}%`}
                    x2={`${getViewportPosition(selectedMapUser).x}%`}
                    y2={`${getViewportPosition(selectedMapUser).y}%`}
                    stroke="rgba(255,255,255,0.42)"
                    strokeDasharray="6 8"
                    strokeWidth="2"
                  />
                </svg>
              )}

              {isLoadingMap && (
                <div className={cn('absolute inset-0 flex items-center justify-center text-sm', t.fgMuted)}>
                  Loading semantic map...
                </div>
              )}

              {!isLoadingMap && mapErrorMessage && (
                <div className="absolute left-5 right-5 top-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {mapErrorMessage}
                </div>
              )}

              {!isLoadingMap && !mapErrorMessage && mapUsers.length === 0 && (
                <div className={cn('absolute inset-0 flex items-center justify-center px-6 text-center text-sm', t.fgMuted)}>
                  Publish public thoughts from at least two users, then refresh the map.
                </div>
              )}

              {!isLoadingMap &&
                !mapErrorMessage &&
                mapUsers.map((mapUser) => {
                  const isCurrentUser = user?.id === mapUser.user_id;
                  const isSelected = selectedMapUserId === mapUser.user_id;

                  return (
                    <motion.div
                      key={mapUser.user_id}
                      className="group absolute -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${getViewportPosition(mapUser).x}%`,
                        top: `${getViewportPosition(mapUser).y}%`
                      }}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{
                        scale: isCurrentUser ? [1, 1.12, 1] : 1,
                        opacity: 1
                      }}
                      transition={{
                        duration: isCurrentUser ? 2.4 : 0.25,
                        repeat: isCurrentUser ? Infinity : 0,
                        ease: 'easeInOut'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => void handleSelectMapUser(mapUser)}
                        className={cn(
                          'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-semibold ring-1 transition hover:scale-110',
                          isCurrentUser
                            ? 'bg-white text-slate-950 shadow-[0_0_35px_rgba(255,255,255,0.8)] ring-white/80'
                            : 'bg-violet-300/80 text-slate-950 ring-violet-100/40',
                          isSelected && 'outline outline-2 outline-offset-4 outline-teal-200'
                        )}
                        title={`${mapUser.display_name} (@${mapUser.username})`}
                      >
                        {mapUser.display_name.slice(0, 1).toUpperCase()}
                      </button>

                      <div className="pointer-events-none absolute left-1/2 top-10 hidden min-w-36 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 text-center text-xs text-white shadow-xl group-hover:block">
                        <div className="font-medium">{mapUser.display_name}</div>
                        <div className="text-white/60">@{mapUser.username}</div>
                        {currentMapUser && currentMapUser.user_id !== mapUser.user_id && (
                          <div className="mt-1 text-teal-100">
                            {getClosenessLabel(getMapDistance(currentMapUser, mapUser))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            <div className={cn('min-h-[460px] rounded-[28px] p-5 xl:h-[min(68vh,720px)] xl:overflow-y-auto', t.inner)}>
              {!selectedMapUser && (
                <div className="flex h-full min-h-[240px] flex-col justify-center">
                  <div className={cn('text-lg font-medium', t.fg)}>
                    Select a dot
                  </div>
                  <p className={cn('mt-2 text-sm leading-6', t.fgMuted)}>
                    Click a mapped user to preview their public thoughts while keeping your place in the semantic space.
                  </p>

                  {currentMapUser && nearestMapUsers.length > 0 && (
                    <div className="mt-5 space-y-2">
                      <div className={cn('text-xs uppercase tracking-[0.18em]', t.fgDim)}>
                        Closest to you
                      </div>
                      {nearestMapUsers.map((nearUser) => (
                        <button
                          key={nearUser.user_id}
                          type="button"
                          onClick={() => void handleSelectMapUser(nearUser)}
                          className={cn('w-full rounded-2xl px-3 py-2 text-left text-sm transition hover:bg-app-surface-hover', t.fg)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate">{nearUser.display_name}</span>
                            <span className={cn('shrink-0 text-xs', t.fgMuted)}>
                              {getClosenessLabel(nearUser.distance)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedMapUser && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={cn('truncate text-xl font-semibold', t.fg)}>
                        {selectedMapUser.display_name}
                      </div>
                      <div className={cn('truncate text-sm', t.fgMuted)}>
                        @{selectedMapUser.username}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMapUserId(null);
                        setSelectedProfile(null);
                        setSelectedProfileError('');
                      }}
                      className={cn('rounded-xl p-2 transition hover:bg-app-surface-hover', t.fgMuted)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {currentMapUser && currentMapUser.user_id !== selectedMapUser.user_id && (
                    <div className={cn('rounded-2xl px-3 py-2 text-xs', t.accentCard)}>
                      {selectedDistance !== null
                        ? `${getClosenessLabel(selectedDistance)} from your dot · distance ${selectedDistance.toFixed(2)}`
                        : 'Connected from your dot'}
                    </div>
                  )}

                  {isLoadingSelectedProfile && (
                    <div className={cn('text-sm', t.fgMuted)}>
                      Loading public thoughts...
                    </div>
                  )}

                  {!isLoadingSelectedProfile && selectedProfileError && (
                    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {selectedProfileError}
                    </div>
                  )}

                  {!isLoadingSelectedProfile && selectedProfile && (
                    <div className="space-y-3">
                      {selectedProfile.thoughts.length === 0 && (
                        <div className={cn('text-sm', t.fgMuted)}>
                          This user has not published public thoughts yet.
                        </div>
                      )}

                      {selectedProfile.thoughts.slice(0, 3).map((thought) => (
                        <div key={thought.id} className={cn('rounded-2xl p-3 text-sm leading-6', t.cardSm, t.fg)}>
                          {thought.content}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className={cn('w-full', t.btnOutline)}
                    onClick={() => onOpenUserProfile(selectedMapUser.user_id)}
                  >
                    View full profile
                  </Button>
                </div>
              )}
            </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Write modal */}
      <AnimatePresence>
        {writeOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={t.modalBackdrop}
              onClick={() => setWriteOpen(false)}
            />

            <motion.div
              className="relative z-10 w-full max-w-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={t.cardModal}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className={cn('text-2xl', t.fg)}>Write</CardTitle>
                    <CardDescription className={t.fgMuted}>
                      A quiet place to publish a raw thought.
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => {
                      setErrorMessage('');
                      setSuccessMessage('');
                      setWriteOpen(false);
                    }}
                    className={cn('rounded-xl p-2 transition hover:bg-app-surface-hover', t.fgMuted)}
                  >
                    <X className="h-5 w-5" />
                  </button>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
