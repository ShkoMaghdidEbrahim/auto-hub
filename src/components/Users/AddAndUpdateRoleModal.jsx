import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Transfer,
  Typography
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { createRole, updateRole } from '../../database/APIs/UsersApi.js';

const { Text } = Typography;

const AddAndUpdateRoleModal = ({
  open,
  onClose,
  role,
  permissions,
  onDone
}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [targetKeys, setTargetKeys] = useState(
    role ? role.permissions.map((p) => p.id) : []
  );
  const [sourceKeys, setSourceKeys] = useState(
    permissions?.map((p) => ({
      key: p?.id,
      title: p?.name
    })) || []
  );

  const onFinish = (values) => {
    setLoading(true);
    if (role) {
      updateRole(role.id, values.name, values.description, targetKeys)
        .then(() => {
          message.success(t('role_updated_successfully'));
          onDone();
          onClose();
        })
        .catch((err) => {
          console.error(err);
          message.error(t('error_updating_role'));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      createRole(values.name, values.description, targetKeys)
        .then(() => {
          message.success(t('role_created_successfully'));
          onDone();
          onClose();
        })
        .catch((err) => {
          console.error(err);
          message.error(t('error_creating_role'));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const filterOption = (inputValue, option) =>
    option.description.indexOf(inputValue) > -1;

  const handleChange = (newTargetKeys) => {
    setTargetKeys(newTargetKeys);
  };

  const handleSearch = (dir, value) => {
    const filtered = permissions.filter(
      (item) =>
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase())
    );
    if (dir === 'left') {
      setSourceKeys(filtered);
    } else {
      const newTargetKeys = role
        ? role.permissions
            .filter(
              (p) =>
                p.name.toLowerCase().includes(value.toLowerCase()) ||
                p.description.toLowerCase().includes(value.toLowerCase())
            )
            .map((p) => p.id)
        : [];
      setTargetKeys(newTargetKeys);
    }
  };

  return (
    <Modal
      title={role ? t('update_role') : t('create_role')}
      open={open}
      onCancel={onClose}
      footer={null}
      width={'90%'}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name: role?.name || '',
          description: role?.description || ''
        }}
      >
        <Row gutter={[10, 16]}>
          <Col lg={12} md={12} sm={24} xs={24}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('role_name')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t('role_name_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  placeholder={t('role_name')}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col lg={12} md={12} sm={24} xs={24}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('role_description')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="description"
                rules={[
                  {
                    required: true,
                    message: t('role_description_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  placeholder={t('role_description')}
                />
              </Form.Item>
            </Space>
          </Col>
          <Col span={24}>
            <Transfer
              listStyle={{
                width: '100%',
                height: 400
              }}
              dataSource={sourceKeys}
              showSearch
              filterOption={filterOption}
              targetKeys={targetKeys}
              onChange={handleChange}
              onSearch={handleSearch}
              render={(item) => item.title}
            />
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
                  {role ? t('update_role') : t('create_role')}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAndUpdateRoleModal;
