'use client';

import type { ReactNode } from 'react';
import {
  Sparkles,
  Home,
  PenSquare,
  Compass,
  User,
  Settings,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { t } from '@/lib/tokens';
import { useTheme } from '@/lib/theme-context';

export type AppPage =
  | 'home'
  | 'write'
  | 'discover'
  | 'map'
  | 'profile'
  | 'settings';

type AppShellProps = {
  current: AppPage;
  setCurrent: (page: AppPage) => void;
  children: ReactNode;
};

export default function AppShell({
  current,
  setCurrent,
  children
}: AppShellProps) {
  const { theme, toggle } = useTheme();
  const { logout, user } = useAuth();
  const router = useRouter();

  const nav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'write', label: 'Write', icon: PenSquare },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  return (
    <div className={t.page}>
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-6 px-4 py-6 lg:px-6 2xl:px-8">
        <aside
          className={cn(
            'hidden w-64 shrink-0 p-4 md:flex md:flex-col',
            t.sidebar
          )}
        >
          <div className="mb-6 flex items-center gap-3 px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-app-violet ring-1 ring-app-violet-line">
              <Sparkles className="h-5 w-5 text-app-violet-fg" />
            </div>
            <div>
              <div className={cn('text-lg font-semibold', t.fg)}>Affinity</div>
              <div className={cn('text-xs', t.fgMuted)}>Thought-based network</div>
            </div>
          </div>

          <nav className="space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = current === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrent(item.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                    active ? t.navActive : t.navInactive
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4">
            {user && (
              <div className={cn('mb-3 rounded-2xl px-3 py-3', t.inner)}>
                <div className={cn('text-sm font-medium', t.fg)}>
                  {user.display_name}
                </div>
                <div className={cn('text-xs', t.fgMuted)}>@{user.username}</div>
              </div>
            )}
            <button
              onClick={toggle}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                t.navInactive
              )}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </span>
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className={cn(
                'mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                t.navInactive
              )}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
