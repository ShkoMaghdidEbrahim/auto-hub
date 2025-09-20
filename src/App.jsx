import { Suspense, useState } from 'react';
import {
  colors,
  darkBackground,
  whiteBackground
} from './configs/constants.js';
import { ConfigProvider, Spin, theme, Layout, Grid } from 'antd';
import { getDirection, translation } from './locales/i18n.js';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './configs/authGuard.jsx';
import Login from './pages/Login.jsx';
import { makeDeeper } from './configs/makeDeeper.js';
import useLocalStorage from './database/useLocalStorage.js';

const { useBreakpoint } = Grid;

import AdminContent from './AdminContent.jsx';
import DynamicReceipt from './pages/DynamicReceipt.jsx';

const App = () => {
  const [colorLocalStorage] = useLocalStorage('darkMode', null);
  const [isDarkMode, setDarkMode] = useState(colorLocalStorage?.darkMode);
  const [color, setColor] = useState(
    colorLocalStorage?.color ? colorLocalStorage.color : colors[0]
  );
  const broken = useBreakpoint();

  return (
    <>
      <ConfigProvider
        direction={getDirection()}
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: color,
            colorBgContainer: isDarkMode
              ? makeDeeper(darkBackground)
              : makeDeeper(whiteBackground),
            Layout: {
              siderBg: isDarkMode ? darkBackground : whiteBackground,
              headerBg: isDarkMode ? darkBackground : whiteBackground,
              triggerColor: color
            },
            Card: {
              padding: 10
            },
            Popconfirm: {
              fontSize: 15
            },
            Drawer: {
              colorBgElevated: isDarkMode ? darkBackground : whiteBackground
            },
            Menu: {
              itemSelectedBg: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.05)`
            }
          }
        }}
      >
        <Layout className={'layoutStyle'}>
          <BrowserRouter>
            <Suspense
              fallback={
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
                      JSON.parse(window.localStorage.getItem('darkMode'))
                        ?.darkMode === true
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
                        JSON.parse(window.localStorage.getItem('darkMode'))
                          ?.darkMode === true
                          ? 'white'
                          : 'black'
                    }}
                  >
                    {translation('loading')}
                  </p>
                </div>
              }
            >
              <Routes>
                <Route
                  path="/dynamic-receipt"
                  element={<DynamicReceipt isDarkMode={isDarkMode} />}
                />
                <Route
                  path="/login"
                  element={
                    <Login
                      isDarkMode={isDarkMode}
                      setDarkMode={setDarkMode}
                      color={color}
                      setColor={setColor}
                      broken={!broken.lg}
                    />
                  }
                />
                <Route
                  path="*"
                  element={
                    <AuthGuard>
                      <AdminContent
                        isDarkMode={isDarkMode}
                        setDarkMode={setDarkMode}
                        color={color}
                        setColor={setColor}
                        broken={!broken.lg}
                      />
                    </AuthGuard>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </Layout>
      </ConfigProvider>
    </>
  );
};

export default App;
