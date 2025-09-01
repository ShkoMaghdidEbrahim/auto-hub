import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  notification,
  Row,
  Typography
} from 'antd';
import useLocalStorage from '../database/useLocalStorage.js';
import { localStorageName } from '../configs/constants.js';
import { Navigate, useNavigate } from 'react-router-dom';
import { LockOutlined, SettingFilled, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { supabase } from '../database/supabase.js';
import { useTranslation } from 'react-i18next';
import SettingsDrawer from '../components/App/SettingsDrawer.jsx';

const Login = ({ isDarkMode, setDarkMode, color, setColor, broken }) => {
  const { t } = useTranslation();
  const [auth, setAuth] = useLocalStorage(localStorageName, null);
  const navigate = useNavigate();
  const [openSettings, setOpenSettings] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);

  const onLogin = async (values) => {
    try {
      setLoginLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.username,
        password: values.password
      });

      if (error) {
        throw error;
      }

      const { user, session } = data;

      setAuth({
        user: user,
        token: session.access_token
      });

      navigate('/');
    } catch (error) {
      console.error(error);
      notification.error({
        message: t('login_failed'),
        description: error.message || t('failed_to_login'),
        placement: 'topRight'
      });
    } finally {
      setLoginLoading(false);
    }
  };

  if (auth) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Button
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 997
        }}
        onClick={() => {
          setOpenSettings(true);
        }}
        type="text"
        size={'large'}
        icon={
          <SettingFilled
            style={{
              fontSize: 26
            }}
          />
        }
      />
      <Layout
        className={'layoutStyle'}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 0
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              textAlign: 'center',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography.Title
              level={1}
              style={{
                fontWeight: 'bold',
                margin: 0
              }}
            >
              {t('welcome_to')}
            </Typography.Title>
            <Typography.Title
              level={1}
              style={{
                fontWeight: 'bold',
                marginTop: 0,
                fontSize: 70,
                marginBottom: 20,
                color: color
              }}
            >
              Auto Hub
            </Typography.Title>
          </div>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Card
              variant={'outlined'}
              style={{
                width: '90%',
                maxWidth: 400
              }}
            >
              <Typography
                style={{
                  textAlign: 'center'
                }}
              >
                <Typography.Title
                  style={{
                    fontSize: 26,
                    fontWeight: 'bold'
                  }}
                >
                  {t('login')}
                </Typography.Title>
                <Typography.Paragraph
                  style={{
                    fontSize: 16,
                    color: '#8C8C8C',
                    fontWeight: 'bold'
                  }}
                >
                  {t('please_login_to_continue')}
                </Typography.Paragraph>
              </Typography>
              <Form onFinish={onLogin}>
                <Row gutter={[10, 10]}>
                  <Col span={24}>
                    <Form.Item
                      name="username"
                      rules={[
                        {
                          required: true,
                          message: t('please_input_your_username')
                        }
                      ]}
                    >
                      <Input
                        size={'large'}
                        prefix={<UserOutlined />}
                        placeholder={t('username')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: t('please_input_your_password')
                        }
                      ]}
                    >
                      <Input.Password
                        size={'large'}
                        prefix={<LockOutlined />}
                        placeholder={t('password')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{
                        marginBottom: 0,
                        marginTop: 5
                      }}
                    >
                      <Button
                        disabled={loginLoading}
                        size={'large'}
                        htmlType={'submit'}
                        type="primary"
                        block
                        loading={loginLoading}
                      >
                        {t('login')}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </div>
        </div>

        {openSettings ? (
          <SettingsDrawer
            open={openSettings}
            onClose={() => setOpenSettings(false)}
            isDarkMode={isDarkMode}
            setDarkMode={setDarkMode}
            setColor={setColor}
            broken={broken}
          />
        ) : null}
      </Layout>
    </>
  );
};

export default Login;
