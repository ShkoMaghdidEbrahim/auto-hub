import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Typography
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  createPermission,
  updatePermission,
  updateRole
} from '../../database/UsersApi.js';

const { Text } = Typography;

const AddAndUpdatePermissionsModal = ({
  open,
  onClose,
  permission,
  onDone
}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);

    if (permission) {
      updatePermission(permission.id, values.name, values.description)
        .then(() => {
          message.success(t('permission_updated_successfully'));
          onDone();
          onClose();
        })
        .catch((err) => {
          console.error(err);
          message.error(t('error_updating_permission'));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      createPermission(values.name, values.description)
        .then(() => {
          message.success(t('permission_created_successfully'));
          onDone();
          onClose();
        })
        .catch((err) => {
          console.error(err);
          message.error(t('error_creating_permission'));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Modal
      title={permission ? t('update_permission') : t('create_permission')}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name: permission ? permission.name : '',
          description: permission ? permission.description : ''
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
                {t('permssion_name')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t('permission_name_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  placeholder={t('permission_name')}
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
                {t('permssion_description')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="description"
                rules={[
                  {
                    required: true,
                    message: t('permission_description_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  placeholder={t('permission_description')}
                />
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
                  {permission ? t('update_permission') : t('create_permission')}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAndUpdatePermissionsModal;
