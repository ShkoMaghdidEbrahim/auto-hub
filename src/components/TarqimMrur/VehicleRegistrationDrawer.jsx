import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Form,
  Row,
  Col,
  InputNumber,
  DatePicker,
  Checkbox,
  Divider,
  Typography,
  Drawer
} from 'antd';
import {
  CarOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const VehicleRegistrationDrawer = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [hasDebt, setHasDebt] = useState(false);

  const onFinish = (values) => {
    console.log('Form values:', values);
    // TODO: Implement database submission when backend is ready
  };

  const handleDebtChange = (e) => {
    setHasDebt(e.target.checked);
    if (!e.target.checked) {
      form.setFieldsValue({ debtAmount: undefined });
    }
  };

  // Calculate total from all money fields
  const calculateTotal = () => {
    const values = form.getFieldsValue();
    const moneyFields = [
      'sizeFee',
      'numberPrice',
      'legalPrice',
      'examinePrice',
      'contractPrice',
      'windowPrice',
      'expenses',
      'fees'
    ];

    const total = moneyFields.reduce((sum, field) => {
      const value = values[field];
      return sum + (value ? parseFloat(value) : 0);
    }, 0);

    form.setFieldsValue({ total: total.toFixed(2) });
  };

  // Watch for changes in money fields to recalculate total
  const onMoneyFieldChange = () => {
    calculateTotal();
  };

  return (
    <Drawer
      title={t('vehicle_registration_form')}
      placement="bottom"
      onClose={onClose}
      open={open}
      height={'100%'}
    >
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <CarOutlined style={{ marginRight: '8px' }} />
          {t('vehicle_registration_form')}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
          scrollToFirstError
        >
          {/* Vehicle Information Section */}
          <Card
            title={
              <span>
                <CarOutlined style={{ marginRight: '8px' }} />
                {t('vehicle_information')}
              </span>
            }
            style={{ marginBottom: '24px' }}
            size="small"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('car_name')}
                  name="carName"
                  rules={[
                    { required: true, message: t('please_enter_car_name') }
                  ]}
                >
                  <Input placeholder={t('enter_car_name')} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('model')}
                  name="model"
                  rules={[{ required: true, message: t('please_enter_model') }]}
                >
                  <Input placeholder={t('enter_model')} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('number_of_cylinders')}
                  name="cylinders"
                  rules={[
                    { required: true, message: t('please_enter_cylinders') }
                  ]}
                >
                  <InputNumber
                    placeholder={t('enter_cylinders')}
                    style={{ width: '100%' }}
                    min={1}
                    max={16}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('vehicle_size')}
                  name="vehicleSize"
                  rules={[
                    { required: true, message: t('please_enter_vehicle_size') }
                  ]}
                >
                  <Input placeholder={t('enter_vehicle_size')} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('size_fee')}
                  name="sizeFee"
                  rules={[
                    { required: true, message: t('please_enter_size_fee') }
                  ]}
                >
                  <InputNumber
                    placeholder={t('enter_size_fee')}
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="$"
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('color')}
                  name="color"
                  rules={[{ required: true, message: t('please_enter_color') }]}
                >
                  <Input placeholder={t('enter_color')} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('vin_number')}
                  name="vinNumber"
                  rules={[
                    { required: true, message: t('please_enter_vin_number') }
                  ]}
                >
                  <Input placeholder={t('enter_vin_number')} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('temporary_number')}
                  name="temporaryNumber"
                  rules={[
                    {
                      required: true,
                      message: t('please_enter_temporary_number')
                    }
                  ]}
                >
                  <Input placeholder={t('enter_temporary_number')} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Pricing Information Section */}
          <Card
            title={
              <span>
                <DollarOutlined style={{ marginRight: '8px' }} />
                {t('pricing_information')}
              </span>
            }
            style={{ marginBottom: '24px' }}
            size="small"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('number_price')}
                  name="numberPrice"
                  rules={[
                    { required: true, message: t('please_enter_number_price') }
                  ]}
                >
                  <InputNumber
                    placeholder={t('enter_number_price')}
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="$"
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('legal_price')}
                  name="legalPrice"
                  rules={[
                    { required: true, message: t('please_enter_legal_price') }
                  ]}
                >
                  <InputNumber
                    placeholder={t('enter_legal_price')}
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="$"
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('examine_price')}
                  name="examinePrice"
                  rules={[
                    { required: true, message: t('please_enter_examine_price') }
                  ]}
                >
                  <InputNumber
                    placeholder={t('enter_examine_price')}
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="$"
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('contract_price')}
                  name="contractPrice"
                  rules={[
                    {
                      required: true,
                      message: t('please_enter_contract_price')
                    }
                  ]}
                >
                  <InputNumber
                    placeholder={t('enter_contract_price')}
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="$"
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('window_price')}
                  name="windowPrice"
                  rules={[
                    { required: true, message: t('please_enter_window_price') }
                  ]}
                >
                  <InputNumber
                    placeholder={t('enter_window_price')}
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="$"
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('expenses')}
                  name="expenses"
                  rules={[
                    { required: true, message: t('please_enter_expenses') }
                  ]}
                >
                  <InputNumber
                    placeholder={t('enter_expenses')}
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="$"
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('fees')}
                  name="fees"
                  rules={[{ required: true, message: t('please_enter_fees') }]}
                >
                  <InputNumber
                    placeholder={t('enter_fees')}
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="$"
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item label={t('total_auto_calculated')} name="total">
                  <InputNumber
                    placeholder={t('total_calculated_automatically')}
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="$"
                    readOnly
                    value={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Debt Checkbox in Pricing Section */}
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col xs={24}>
                <Form.Item name="hasDebt" valuePropName="checked">
                  <Checkbox onChange={handleDebtChange}>
                    {t('has_outstanding_debt')}
                  </Checkbox>
                </Form.Item>
              </Col>

              {hasDebt && (
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t('debt_amount')}
                    name="debtAmount"
                    rules={[
                      {
                        required: hasDebt,
                        message: t('please_enter_debt_amount')
                      }
                    ]}
                  >
                    <InputNumber
                      placeholder={t('enter_debt_amount')}
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      prefix="$"
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Card>

          {/* Additional Information Section */}
          <Card
            title={
              <span>
                <FileTextOutlined style={{ marginRight: '8px' }} />
                {t('additional_information')}
              </span>
            }
            style={{ marginBottom: '24px' }}
            size="small"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('date')}
                  name="date"
                  rules={[{ required: true, message: t('please_select_date') }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder={t('date')}
                    defaultValue={dayjs()}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label={t('note')} name="note">
                  <TextArea
                    placeholder={t('enter_additional_notes')}
                    rows={4}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Divider />

          {/* Submit Button */}
          <Row justify="center">
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  minWidth: '200px',
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
                disabled
              >
                {t('submit_form')}
              </Button>
            </Col>
          </Row>

          <Row justify="center" style={{ marginTop: '16px' }}>
            <Col>
              <p
                style={{
                  color: '#666',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  margin: 0
                }}
              >
                {t('submit_disabled_message')}
              </p>
            </Col>
          </Row>
        </Form>
      </div>
    </Drawer>
  );
};

export default VehicleRegistrationDrawer;
