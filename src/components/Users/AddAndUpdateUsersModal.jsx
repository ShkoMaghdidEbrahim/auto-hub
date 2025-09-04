import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Typography
} from 'antd';
import { useTranslation } from 'react-i18next';
import { addUser, updateUser } from '../../database/UsersApi.js';
import { useState } from 'react';

const { Text } = Typography;

const AddAndUpdateUsersModal = ({ open, onClose, user, roles, onDone }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    if (user) {
      updateUser(user.id, values.email, values.password, values.role)
        .then(() => {
          message.success(t('user_updated_successfully'));
          onClose();
          onDone();
        })
        .catch((error) => {
          message.error(t('error_updating_user'));
          console.error('Error updating user:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      addUser(values.email, values.password, values.role)
        .then(() => {
          message.success(t('user_created_successfully'));
          onClose();
          onDone();
        })
        .catch((error) => {
          message.error(t('error_creating_user'));
          console.error('Error adding user:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Modal
      title={user ? t('update_user') : t('create_user')}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          email: user?.email || '',
          role: user?.user_role?.[0]?.id || null
        }}
      >
        <Row gutter={[10, 10]}>
          <Col span={24}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('email')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="email"
                rules={[
                  {
                    required: true,
                    message: t('user_email_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  type="email"
                  placeholder={t('user_email')}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col span={24}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('password')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="password"
                rules={[
                  {
                    required: !user,
                    message: t('user_password_required')
                  }
                ]}
              >
                <Input.Password
                  styles={{
                    width: '100%'
                  }}
                  type="password"
                  placeholder={t('user_password')}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col span={24}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('user_role')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="role"
                rules={[
                  {
                    required: true,
                    message: t('user_role_required')
                  }
                ]}
              >
                <Select placeholder={t('role')}>
                  {roles.map((role) => (
                    <Select.Option key={role.id} value={role.id}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>
          </Col>

          <Col
            span={24}
            style={{
              marginTop: 16
            }}
          >
            <Row gutter={[10, 10]}>
              <Col span={8}>
                <Button
                  onClick={() => {
                    onClose();
                  }}
                  loading={loading}
                  disabled={loading}
                  type="default"
                  block
                >
                  {t('cancel')}
                </Button>
              </Col>

              <Col span={16}>
                <Button
                  loading={loading}
                  disabled={loading}
                  type="primary"
                  htmlType="submit"
                  block
                >
                  {user ? t('update_user') : t('create_user')}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAndUpdateUsersModal;
