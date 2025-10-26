import { useState, useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [globalStats, setGlobalStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    totalTime: 0,
    streak: 0,
    level: 1,
    experience: 0
  });

  useEffect(() => {
    // Load user data from localStorage
    const savedUser = localStorage.getItem('actUser');
    const savedStats = localStorage.getItem('actStats');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedStats) setGlobalStats(JSON.parse(savedStats));
  }, []);

  const updateStats = (newStats) => {
    const updated = { ...globalStats, ...newStats };
    setGlobalStats(updated);
    localStorage.setItem('actStats', JSON.stringify(updated));
  };

  return (
    <Component
      {...pageProps}
      user={user}
      setUser={setUser}
      globalStats={globalStats}
      updateStats={updateStats}
    />
  );
}

export default MyApp;