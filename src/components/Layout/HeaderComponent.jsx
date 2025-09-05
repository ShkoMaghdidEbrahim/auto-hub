import { Row, Typography, Layout } from 'antd';
import { MenuOutlined, SettingFilled } from '@ant-design/icons';
import routes from '../../routes.jsx';
import { useState } from 'react';
import SettingsDrawer from '../App/SettingsDrawer.jsx';
import { useTranslation } from 'react-i18next';

const { Header } = Layout;

const HeaderComponent = ({
  setCollapsed,
  isDarkMode,
  setDarkMode,
  collapsed,
  setAuth,
  setColor,
  color,
  CustomHeader,
  broken
}) => {
  const { t } = useTranslation();
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  return (
    <>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingRight: 20,
          paddingLeft: 20,
          outline: isDarkMode ? '1px solid #414141' : '1px solid #d3d3d3'
        }}
      >
        <Row
          style={{
            display: 'flex',
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {collapsed !== undefined ? (
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <MenuOutlined
                style={{
                  fontSize: 30,
                  color: color
                }}
              />
            </div>
          ) : null}

          <Typography.Title
            level={3}
            style={{
              color: color,
              margin: 0
            }}
          >
            {CustomHeader
              ? CustomHeader
              : t(
                  routes.find((route) => '#' + route.path === location.hash)
                    ?.label
                )}
          </Typography.Title>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 15
            }}
          >
            <div
              onClick={() => setSettingsDrawerOpen(true)}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <SettingFilled
                style={{
                  fontSize: 30,
                  color: color
                }}
              />
            </div>
          </div>
        </Row>
      </Header>

      {settingsDrawerOpen ? (
        <SettingsDrawer
          open={settingsDrawerOpen}
          onClose={() => setSettingsDrawerOpen(false)}
          isDarkMode={isDarkMode}
          setDarkMode={setDarkMode}
          setColor={setColor}
          color={color}
          setAuth={setAuth}
          broken={broken}
        />
      ) : null}
    </>
  );
};

export default HeaderComponent;
