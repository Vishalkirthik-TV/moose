import { Navigate, Route, Routes } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { ThemeProvider } from './components/theme-provider';
import { Chat } from './pages/Chat';
import { Auth } from './pages/Auth';
import { Welcome } from './pages/Welcome';
import { Discover } from './pages/Discover';
import { Spaces } from './pages/Spaces';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

function SignedInRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/welcome" element={<Navigate to="/" replace />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/spaces" element={<Spaces />} />
            <Route path="/settings" element={<Settings />} />
            {/* Auth pages: send signed-in users home */}
            <Route path="/signin" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <SignedIn><SignedInRoutes /></SignedIn>
            <SignedOut>
                <Auth />
            </SignedOut>
        </ThemeProvider>
    );
}

export default App;
