import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { ThemeProvider } from './components/theme-provider';
import { Chat } from './pages/Chat';
import { Auth } from './pages/Auth';
import { Welcome } from './pages/Welcome';
import { Discover } from './pages/Discover';
import { Spaces } from './pages/Spaces';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

function SignedInRoutes({ currentPath }: { currentPath: string }) {
  if (currentPath === '#/chat' || currentPath.startsWith('#/chat?')) return <Chat />;
  if (currentPath === '#/discover') return <Discover />;
  if (currentPath === '#/spaces') return <Spaces />;
  if (currentPath === '#/settings') return <Settings />;
  if (currentPath === '' || currentPath === '#' || currentPath === '#/' || currentPath === '#/welcome') return <Welcome />;
  return <NotFound />;
}

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Redirect to welcome if signed in and on auth pages
  useEffect(() => {
    if (isSignedIn && (currentPath === '#/signin' || currentPath === '#/signup')) {
      window.location.hash = '#/welcome';
    }
  }, [isSignedIn, currentPath]);

  return (
    <ThemeProvider>
      <SignedIn><SignedInRoutes currentPath={currentPath} /></SignedIn>
      <SignedOut>
        <Auth />
      </SignedOut>
    </ThemeProvider>
  );
}

export default App;
