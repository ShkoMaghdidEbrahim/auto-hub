import { Button, Col, Drawer, Row, Radio, ColorPicker } from 'antd';
import useLocalStorage from '../../database/useLocalStorage.js';
import { CloseOutlined, LogoutOutlined } from '@ant-design/icons';
import { changeLanguage, getCurrentLanguage } from '../../locales/i18n.js';
import { signOut } from '../../database/supabase.js';
import useBackGesture from '../../configs/useBackGesture.js';
import { colors } from '../../configs/constants.js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SettingsDrawer = ({
  open,
  onClose,
  isDarkMode,
  setDarkMode,
  setColor,
  broken,
  color
}) => {
  const { t } = useTranslation();
  useBackGesture(onClose, 'SettingsDrawer');
  const navigate = useNavigate();

  const [colorLocalStorage, setColorLocalStorage] = useLocalStorage(
    'darkMode',
    null
  );

  return (
    <>
      <Drawer
        title={t('settings')}
        onClose={onClose}
        closeIcon={
          <CloseOutlined
            style={{
              fontSize: 26
            }}
          />
        }
        keyboard={true}
        width={broken ? '100%' : 600}
        placement={t('rtl') ? 'left' : 'right'}
        open={open}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
          }}
        >
          <Row gutter={[10, 10]}>
            <Col span={24}>{t('dark_mode')}</Col>
            <Col span={24}>
              <Radio.Group
                size={'large'}
                onChange={(e) => {
                  setDarkMode(e.target.value);
                  if (e.target.value) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  setColorLocalStorage({
                    color: colorLocalStorage?.color || '#0F4415',
                    darkMode: e.target.value
                  });
                }}
                block
                options={[
                  {
                    label: t('light_mode'),
                    value: false
                  },
                  {
                    label: t('dark_mode'),
                    value: true
                  }
                ]}
                defaultValue={isDarkMode}
                optionType="button"
                buttonStyle="solid"
              />
            </Col>
            <Col span={24}>{t('language')}</Col>
            <Col span={24}>
              <Radio.Group
                size={'large'}
                onChange={(e) => {
                  changeLanguage(e.target.value);
                }}
                block
                options={[
                  {
                    label: t('english'),
                    value: 'en'
                  },
                  {
                    label: t('kurdish'),
                    value: 'ku'
                  }
                ]}
                defaultValue={getCurrentLanguage()}
                optionType="button"
                buttonStyle="solid"
              />
            </Col>
            <Col span={24}>{t('theme_accent_color')}</Col>
            <Col span={24}>
              <Row gutter={[10, 5]}>
                {colors.map((col, index) => (
                  <Col key={index} span={8}>
                    <Button
                      block={true}
                      style={{
                        height: 55,
                        background: col
                      }}
                      onClick={() => {
                        setColor(col);
                        setColorLocalStorage({
                          color: col,
                          darkMode: isDarkMode
                        });
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </Col>
            <Col span={24}>
              <ColorPicker
                format={'hex'}
                defaultFormat={'hex'}
                disabledAlpha={true}
                value={color}
                placement={'bottomRight'}
                onChange={(color) => {
                  setColor(color.toHexString());
                  setColorLocalStorage({
                    color: color.toHexString(),
                    darkMode: isDarkMode
                  });
                }}
              >
                <Button size={'large'} block type="primary">
                  {t('custom_color')}
                </Button>
              </ColorPicker>
            </Col>
          </Row>
          <Button
            type="primary"
            danger
            size={'large'}
            block
            style={{
              marginTop: 12,
              marginBottom: 12
            }}
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
            icon={<LogoutOutlined />}
          >
            {t('logout')}
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default SettingsDrawer;
