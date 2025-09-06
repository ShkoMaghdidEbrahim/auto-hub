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
import { addCustomer, updateCustomer } from '../../database/CustomersApi.js';
import { useState, useEffect } from 'react';

const { Text } = Typography;

const AddAndUpdateCustomersModal = ({ open, onClose, customer, onDone }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Reset form when customer prop changes
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        full_name: customer?.full_name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        address: customer?.address || ''
      });
    }
  }, [open, customer, form]);

  const onFinish = (values) => {
    setLoading(true);
    const customerData = {
      full_name: values.full_name,
      phone: values.phone,
      email: values.email,
      address: values.address
    };

    if (customer) {
      updateCustomer(customer.id, customerData)
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
      addCustomer(customerData)
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
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
