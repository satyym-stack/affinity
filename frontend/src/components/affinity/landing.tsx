'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { t } from '@/lib/tokens';
import { listPublicThoughts, type Thought } from '@/lib/thoughts-api';

export default function Landing() {
  const [publicThoughts, setPublicThoughts] = useState<Thought[]>([]);
  const [isLoadingThoughts, setIsLoadingThoughts] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPublicThoughts() {
      try {
        const thoughts = await listPublicThoughts(3);

        if (!cancelled) {
          setPublicThoughts(thoughts);
        }
      } catch {
        if (!cancelled) {
          setPublicThoughts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingThoughts(false);
        }
      }
    }

    void loadPublicThoughts();

    return () => {
      cancelled = true;
    };
  }, []);

  const hoveredThought = publicThoughts[0]?.content;

  return (
    <div className={cn('landing-bg', t.page)}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-app-violet ring-1 ring-app-violet-line">
              <Sparkles className="h-5 w-5 text-app-violet-fg" />
            </div>
            <div>
              <div className={cn('text-lg font-semibold', t.fg)}>Affinity</div>
              <div className={cn('text-xs', t.fgMuted)}>
                Publish thoughts, not profiles
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="ghost" className={t.btnGhost}>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className={t.btnPrimary}>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge className={cn('mb-5', t.badge)}>
              Thought-based social graph
            </Badge>

            <h1 className={cn('max-w-2xl text-5xl font-semibold tracking-tight sm:text-6xl', t.fg)}>
              Publish thoughts, not profiles.
            </h1>

            <p className={cn('mt-6 max-w-xl text-lg leading-8', t.fgSoft)}>
              Write honestly. We place your dot in a shared semantic space, so
              you can discover people who see the world like you do.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className={t.btnPrimary}>
                <Link href="/signup">
                  Start Writing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className={t.btnOutline}>
                Explore the Space
              </Button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                { title: 'Write', desc: 'Share a few honest thoughts.' },
                { title: 'Position', desc: 'Your language shapes your place.' },
                { title: 'Discover', desc: 'Find nearby minds and clusters.' }
              ].map((item) => (
                <Card key={item.title} className={t.cardMd}>
                  <CardContent className="p-5">
                    <div className={cn('font-medium', t.fg)}>{item.title}</div>
                    <div className={cn('mt-2 text-sm', t.fgMuted)}>
                      {item.desc}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[32px] bg-app-surface blur-3xl" />

            <Card className={cn(t.card, 'overflow-hidden shadow-2xl backdrop-blur')}>
              <CardContent className="p-0">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className={cn('relative min-h-[520px] border-b p-8 border-app-line lg:border-b-0 lg:border-r')}>
                    {[...Array(22)].map((_, i) => {
                      const left = `${10 + ((i * 17) % 75)}%`;
                      const top = `${8 + ((i * 23) % 80)}%`;
                      const size = 8 + (i % 4) * 4;

                      return (
                        <motion.div
                          key={i}
                          className={cn(
                            'absolute rounded-full',
                            i % 5 === 0
                              ? 'bg-violet-300/90'
                              : i % 3 === 0
                                ? 'bg-teal-300/80'
                                : 'bg-white/70'
                          )}
                          style={{ left, top, width: size, height: size }}
                          animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
                          transition={{
                            duration: 3 + (i % 5),
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                      );
                    })}

                    <div className={cn('absolute bottom-6 left-6 right-6 p-4', t.overlayLabel)}>
                      <div className={cn('mb-2 text-sm', t.fgMuted)}>
                        {hoveredThought ? 'Hovered thought' : 'Shared space'}
                      </div>
                      <p className={cn('text-sm leading-6', t.fgSoft)}>
                        {hoveredThought ??
                          'Public thoughts from real users will appear here as the space fills.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <div>
                      <div className={cn('text-sm', t.fgMuted)}>
                        Recent public thoughts
                      </div>
                      <div className="mt-3 space-y-3">
                        {isLoadingThoughts && (
                          <div className={cn('p-4 text-sm', t.inner, t.fgMuted)}>
                            Loading public thoughts...
                          </div>
                        )}

                        {!isLoadingThoughts && publicThoughts.length === 0 && (
                          <div className={cn('p-4 text-sm', t.inner, t.fgMuted)}>
                            No public thoughts yet.
                          </div>
                        )}

                        {!isLoadingThoughts &&
                          publicThoughts.map((thought) => (
                            <div key={thought.id} className={cn('p-4 text-sm', t.inner, t.fg)}>
                              {thought.content}
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className={cn('p-4', t.accentCard)}>
                      <div className={cn('text-sm font-medium', 'text-app-violet-fg')}>
                        Current cluster
                      </div>
                      <div className={cn('mt-2 text-sm', t.fgSoft)}>
                        Reflective, emotionally precise, open to ambiguity.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
