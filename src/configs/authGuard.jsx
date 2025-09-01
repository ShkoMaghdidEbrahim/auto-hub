import { useEffect, useState } from 'react';
import { verifyAuthentication } from '../database/supabase.js';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { darkBackground, whiteBackground } from './constants.js';

export const AuthGuard = ({ children }) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await verifyAuthentication();
      setIsAuthenticated(result);
      setIsLoading(false);
    };

    checkAuth();

    const authCheckInterval = setInterval(checkAuth, 60000);

    return () => clearInterval(authCheckInterval);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '20px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background:
            document.documentElement.classList.contains('dark') ||
            JSON.parse(window.localStorage.getItem('darkMode'))?.darkMode ===
              true
              ? darkBackground
              : whiteBackground
        }}
      >
        <Spin size="large" />
        <p
          style={{
            marginTop: '10px',
            color:
              document.documentElement.classList.contains('dark') ||
              JSON.parse(window.localStorage.getItem('darkMode'))?.darkMode ===
                true
                ? 'white'
                : 'black'
          }}
        >
          {t('loading')}
        </p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
