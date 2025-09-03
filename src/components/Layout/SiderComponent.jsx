import { CloseOutlined, GlobalOutlined } from '@ant-design/icons';
import { Menu, Layout, Button, Dropdown } from 'antd';
import routes from '../../routes.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { darkBackground, whiteBackground } from '../../configs/constants.js';
import { makeDeeper } from '../../configs/makeDeeper.js';

const { Sider } = Layout;

const SiderComponent = ({
  collapsed,
  setCollapsed,
  broken,
  color,
  borderRadiusLG,
  isDarkMode
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      collapsed={collapsed}
      trigger={null}
      breakpoint="lg"
      collapsedWidth={broken ? 0 : 100}
      onCollapse={(collapsed) => {
        setCollapsed(collapsed);
      }}
      width={broken ? '100%' : 300}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: broken ? 'fixed' : '',
        zIndex: 1000,
        outline: !broken
          ? isDarkMode
            ? '1px solid #414141'
            : '1px solid #d3d3d3'
          : 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
          height: 63,
          fontSize: 20,
          fontWeight: 'bold',
          gap: 5,
          marginBottom: 5
        }}
      >
        {broken ? (
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '0 10px',
              height: '100%',
              backgroundColor: color,
              borderRadius: borderRadiusLG + 2
            }}
          >
            <CloseOutlined
              style={{
                fontSize: 26
              }}
            />
          </div>
        ) : null}

        <div
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: broken
              ? 'none'
              : isDarkMode
                ? '1px solid #414141'
                : '1px solid #d3d3d3'
          }}
        >
          <img
            src={'/logo.png'}
            alt="Logo"
            style={{
              height: 50,
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      <div style={{}}>
        <Menu
          mode="inline"
          style={{
            backgroundColor: isDarkMode ? darkBackground : whiteBackground,
            fontSize: 15,
            height: '85%',
            width: '100%',
            borderRadius: 0,
            border: 'none',
            overflowX: 'hidden',
            overflowY: 'auto'
          }}
          defaultSelectedKeys={[
            routes
              .find((route) => route?.path === location?.pathname)
              ?.key?.toString()
          ]}
          items={routes
            .filter((route) => route.show)
            .map((item) => {
              return {
                key: item.key,
                icon: item.icon,
                label: t(item.label),
                onClick: (e) => {
                  setCollapsed(true);
                  const route = routes.find(
                    (ro) => ro.key.toString() === e.key.toString()
                  );
                  navigate(route.path);
                }
              };
            })}
        />
      </div>
    </Sider>
  );
};

export default SiderComponent;
