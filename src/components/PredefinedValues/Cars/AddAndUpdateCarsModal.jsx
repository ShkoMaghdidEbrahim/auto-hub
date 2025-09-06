import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const { Text } = Typography;

const AddAndUpdateCarsModal = ({ open, onClose, car, onDone }) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    console.log(values);
  };

  return (
    <Modal
      title={car ? t('add_car') : t('update_car')}
      open={open}
      width={Math.min(800, window.innerWidth * 0.9)}
      onCancel={onClose}
      footer={null}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          ...car
        }}
      >
        <Row gutter={[10, 16]}>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('car_name')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="car_name"
                rules={[
                  {
                    required: true,
                    message: t('car_name_required')
                  }
                ]}
              >
                <Input
                  styles={{
                    width: '100%'
                  }}
                  placeholder={t('car_name')}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('car_model')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="car_model"
                rules={[
                  {
                    required: true,
                    message: t('car_model_required')
                  }
                ]}
              >
                <InputNumber
                  min={0}
                  max={5000}
                  style={{
                    width: '100%'
                  }}
                  placeholder={t('car_model')}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('number_of_cylinders')}
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="number_of_cylinders"
                rules={[
                  {
                    required: false,
                    message: t('number_of_cylinders_required')
                  }
                ]}
              >
                <InputNumber
                  min={1}
                  max={25}
                  style={{
                    width: '100%'
                  }}
                  placeholder={t('number_of_cylinders')}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('vehicle_size')} *
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="vehicle_size"
                rules={[
                  {
                    required: true,
                    message: t('vehicle_size_required')
                  }
                ]}
              >
                <Select
                  style={{
                    width: '100%'
                  }}
                  placeholder={t('vehicle_size')}
                >
                  <Select.Option value="small">{t('small')}</Select.Option>
                  <Select.Option value="medium">{t('medium')}</Select.Option>
                  <Select.Option value="large">{t('large')}</Select.Option>
                </Select>
              </Form.Item>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('size_fee')}
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="size_fee"
                rules={[
                  {
                    required: false,
                    message: t('size_fee_required')
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('amount')}
                  min={0}
                  step={250}
                  parser={(value) => value.replace(/\D/g, '')}
                  formatter={(value) => `${Number(value).toLocaleString()}`}
                  addonBefore={'IQD'}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('plate_number_cost')}
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="plate_number_cost"
                rules={[
                  {
                    required: false,
                    message: t('plate_number_cost_required')
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('amount')}
                  min={0}
                  step={250}
                  parser={(value) => value.replace(/\D/g, '')}
                  formatter={(value) => `${Number(value).toLocaleString()}`}
                  addonBefore={'IQD'}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('legal_cost')}
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="legal_cost"
                rules={[
                  {
                    required: false,
                    message: t('legal_cost_required')
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('amount')}
                  min={0}
                  step={250}
                  parser={(value) => value.replace(/\D/g, '')}
                  formatter={(value) => `${Number(value).toLocaleString()}`}
                  addonBefore={'IQD'}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('inspection_cost')}
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="inspection_cost"
                rules={[
                  {
                    required: false,
                    message: t('inspection_cost_required')
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('amount')}
                  min={0}
                  step={250}
                  parser={(value) => value.replace(/\D/g, '')}
                  formatter={(value) => `${Number(value).toLocaleString()}`}
                  addonBefore={'IQD'}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('electronic_contract_cost')}
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="electronic_contract_cost"
                rules={[
                  {
                    required: false,
                    message: t('electronic_contract_cost_required')
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('amount')}
                  min={0}
                  step={250}
                  parser={(value) => value.replace(/\D/g, '')}
                  formatter={(value) => `${Number(value).toLocaleString()}`}
                  addonBefore={'IQD'}
                />
              </Form.Item>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Space
              style={{
                width: '100%'
              }}
              direction="vertical"
            >
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}
              >
                {t('window_check_cost')}
              </Text>
              <Form.Item
                style={{ margin: 0 }}
                name="window_check_cost"
                rules={[
                  {
                    required: false,
                    message: t('window_check_cost_required')
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('amount')}
                  min={0}
                  step={250}
                  parser={(value) => value.replace(/\D/g, '')}
                  formatter={(value) => `${Number(value).toLocaleString()}`}
                  addonBefore={'IQD'}
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
                  {car ? t('update_car') : t('create_car')}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAndUpdateCarsModal;
