'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import AppShell, { type AppPage } from './app-shell';
import DiscoverPage from './discover-page';
import HomePage from './home-page';
import Landing from './landing';
import Onboarding from './onboarding';
import Placement from './placement';
import ProfilePage from './profile-page';
import SettingsPage from './settings-page';
import PublicProfilePage from './public-profile-page';
import WritePage from './write-page';

type Screen = 'landing' | 'onboarding' | 'placement' | 'app';
type Answers = Record<string, string>;

export default function PrototypeApp() {
  const { isLoading, user } = useAuth();
  const [screen, setScreen] = useState<Screen>('landing');
  const [appPage, setAppPage] = useState<AppPage>('home');
  const [previousAppPage, setPreviousAppPage] = useState<AppPage>('home');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [thoughtVersion, setThoughtVersion] = useState(0);

  function handleThoughtSaved() {
    setThoughtVersion((current) => current + 1);
  }

  function handleOpenUserProfile(userId: number) {
    setPreviousAppPage(appPage);
    setSelectedUserId(userId);
  }

  function handleCloseUserProfile() {
    setSelectedUserId(null);
    setAppPage(previousAppPage);
  }

  function handleSetAppPage(page: AppPage) {
    setSelectedUserId(null);
    setAppPage(page);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
        Loading Affinity...
      </div>
    );
  }

  const activeScreen = user && screen === 'landing' ? 'app' : screen;

  return (
    <div className="min-h-screen bg-slate-950">
      <AnimatePresence mode="wait">
        {activeScreen === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Landing />
          </motion.div>
        )}

        {activeScreen === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Onboarding
              answers={answers}
              setAnswers={setAnswers}
              onFinish={() => setScreen('placement')}
            />
          </motion.div>
        )}

        {activeScreen === 'placement' && (
          <motion.div
            key="placement"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Placement onContinue={() => setScreen('app')} />
          </motion.div>
        )}

        {activeScreen === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AppShell current={appPage} setCurrent={handleSetAppPage}>
              {selectedUserId && (
                <PublicProfilePage
                  userId={selectedUserId}
                  onBack={handleCloseUserProfile}
                />
              )}
              {!selectedUserId && appPage === 'home' && (
                <HomePage
                  thoughtVersion={thoughtVersion}
                  onThoughtSaved={handleThoughtSaved}
                  onOpenUserProfile={handleOpenUserProfile}
                />
              )}
              {!selectedUserId && appPage === 'write' && (
                <WritePage onThoughtSaved={handleThoughtSaved} />
              )}
              {!selectedUserId && appPage === 'discover' && (
                <DiscoverPage
                  thoughtVersion={thoughtVersion}
                  onOpenUserProfile={handleOpenUserProfile}
                />
              )}
              {!selectedUserId && appPage === 'profile' && (
                <ProfilePage thoughtVersion={thoughtVersion} />
              )}
              {!selectedUserId && appPage === 'settings' && <SettingsPage />}
            </AppShell>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
