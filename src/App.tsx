import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { AmbientCursorGlow } from './components/AmbientCursorGlow';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <AppProvider>
      {loading && <LoadingScreen onFinish={() => setLoading(false)} />}
      <AmbientCursorGlow />
      <Dashboard />
    </AppProvider>
  );
}
