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
import {
  addCustomer,
  updateCustomer
} from '../../../database/APIs/CustomersApi.js';
import { useState } from 'react';

const { Text } = Typography;

const AddAndUpdateCustomersModal = ({ open, onClose, customer, onDone }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);

    if (customer) {
      updateCustomer(customer.id, values)
        .then(() => {
          message.success(t('customer_updated_successfully'));
          onClose();
          onDone();
        })
        .catch((error) => {
          message.error(t('error_updating_customer'));
          console.error('Error updating customer:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      addCustomer(values)
        .then(() => {
          message.success(t('customer_created_successfully'));
          onClose();
          onDone();
        })
        .catch((error) => {
          message.error(t('error_creating_customer'));
          console.error('Error adding customer:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Modal
      title={customer ? t('update_customer') : t('create_customer')}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden={true}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          ...customer
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
                {t('customer_name')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="full_name"
                rules={[
                  {
                    required: true,
                    message: t('customer_name_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  type="text"
                  placeholder={t('customer_name')}
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
                {t('customer_phone')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="phone"
                rules={[
                  {
                    required: true,
                    message: t('customer_phone_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  type="text"
                  placeholder={t('customer_phone')}
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
                {t('customer_email')}
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="email"
                rules={[
                  {
                    required: false,
                    message: t('customer_email_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  type="email"
                  placeholder={t('customer_email')}
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
                {t('customer_address')}
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="address"
                rules={[
                  {
                    required: false,
                    message: t('customer_address_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  type="text"
                  placeholder={t('customer_address')}
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
                  {customer ? t('update_customer') : t('create_customer')}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAndUpdateCustomersModal;
