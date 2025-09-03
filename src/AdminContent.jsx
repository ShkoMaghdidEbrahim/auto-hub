import { Button, Layout, theme } from 'antd';
import './assets/styles/global.scss';
import { Route, Routes } from 'react-router-dom';
import { Suspense, useState } from 'react';
import routes from './routes.jsx';
import useLocalStorage from './database/useLocalStorage.js';
import {
  darkBackground,
  localStorageName,
  whiteBackground
} from './configs/constants.js';
import Login from './pages/Login.jsx';
import useBackGesture from './configs/useBackGesture.js';
import SiderComponent from './components/Layout/SiderComponent.jsx';
import HeaderComponent from './components/Layout/HeaderComponent.jsx';
import LoadingFallback from './components/App/LoadingFallback.jsx';
const { Content } = Layout;

function AdminContent({ isDarkMode, setDarkMode, color, setColor, broken }) {
  const {
    token: { borderRadiusLG }
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState(true);
  const [auth, setAuth] = useLocalStorage(localStorageName, null);

  const routesWithPermissions = routes.filter((route) => {
    if (!auth || !auth.user || !auth.user.permissions) return false;
    return auth.user.permissions.includes(route.permission);
  });

  useBackGesture(
    () => {
      setCollapsed(true);
    },
    'appBackGestureState',
    [collapsed]
  );

  if (!auth) {
    return <Login />;
  }

  return (
    <>
      <Layout className={'layoutStyle'} hasSider={true}>
        <SiderComponent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          broken={broken}
          color={color}
          borderRadiusLG={borderRadiusLG}
          isDarkMode={isDarkMode}
        />
        <Layout
          style={{
            overflowX: 'hidden'
          }}
        >
          <HeaderComponent
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            color={color}
            setColor={setColor}
            isDarkMode={isDarkMode}
            setDarkMode={setDarkMode}
            broken={broken}
            auth={auth}
            setAuth={setAuth}
          />

          <Content
            style={{
              color: 'white',
              margin: 0,
              height: '100%',
              background: isDarkMode ? darkBackground : whiteBackground,
              outline: isDarkMode ? '1px solid #414141' : '1px solid #d3d3d3',
              overflowY: 'auto'
            }}
          >
            <Routes>
              {routesWithPermissions.map((route) => {
                return (
                  <Route
                    path={route.path}
                    key={route.key}
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <route.component />
                      </Suspense>
                    }
                  />
                );
              })}
              <Route
                path="*"
                element={
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                      height: '100%',
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: isDarkMode ? 'white' : 'black'
                    }}
                  >
                    <img
                      src="/404.png"
                      alt="404"
                      style={{
                        width: '75%',
                        height: '75%',
                        objectFit: 'contain'
                      }}
                    />
                    <div
                      style={{
                        position: 'relative',
                        height: '25%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: 20
                      }}
                    >
                      <p
                        style={{
                          fontSize: 40,
                          color: isDarkMode ? 'white' : 'black'
                        }}
                      >
                        Page Not Found
                      </p>

                      <Button
                        type="primary"
                        size={'large'}
                        onClick={() => {
                          window.location.href = '/';
                        }}
                        block
                      >
                        Go Home
                      </Button>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

export default AdminContent;
