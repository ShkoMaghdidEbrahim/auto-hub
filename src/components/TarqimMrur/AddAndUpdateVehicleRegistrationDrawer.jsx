import React, { useState, useEffect } from 'react';
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
  Drawer,
  Select
} from 'antd';
import {
  CarOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getCars } from '../../database/APIs/CarsApi';
import { getSizesEnum } from '../../database/APIs/CarsApi';
import {
  addRegistration,
  getCustomerBatches,
  updateRegistration
} from '../../database/APIs/RegistrationApi';
import { getCustomers } from '../../database/APIs/CustomersApi';

const { Title } = Typography;
const { TextArea } = Input;

const VehicleRegistrationDrawer = ({
  open,
  onClose,
  onSuccess,
  registration
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [has_debt, setHasDebt] = useState(registration?.has_debt || false);
  const [oldBatch, setOldBatch] = useState(!!registration?.batch);
  const [cars, setCars] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicleSizes, setVehicleSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCarName, setSelectedCarName] = useState(
    registration?.car_name || null
  );
  const [customerBatches, setCustomerBatches] = useState([]);

  const total = form.getFieldValue('total');
  const customerId = form.getFieldValue('customerId');

  useEffect(() => {
    getCars()
      .then((data) => {
        setCars(data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
    getSizesEnum()
      .then((data) => setVehicleSizes(data))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
    getCustomers()
      .then((data) => {
        setCustomers(data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (registration?.customer_id || customerId) {
      getCustomerBatches(registration?.customer_id || customerId)
        .then((data) => {
          setCustomerBatches(data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [registration, customerId]);

  useEffect(() => {
    if (registration?.car_name) {
      setSelectedCarName(registration.car_name);
    }
  }, [registration]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      console.log('Form values:', values);

      const registrationData = {
        customer_id: values.customerId,
        vin_number: values.vin_number,
        temporary_plate_number: values.temporary_plate_number || null,
        car_name: values.car_name,
        car_model: parseInt(values.car_model) || 0,
        number_of_cylinders: parseInt(values.number_of_cylinders) || 0,
        vehicle_size: values.vehicle_size || null,
        car_color: values.car_color,
        size_fee: Math.round(parseFloat(values.size_fee) || 0),
        plate_number_cost: Math.round(
          parseFloat(values.plate_number_cost) || 0
        ),
        legal_cost: Math.round(parseFloat(values.legal_cost) || 0),
        inspection_cost: Math.round(parseFloat(values.inspection_cost) || 0),
        electronic_contract_cost: Math.round(
          parseFloat(values.electronic_contract_cost) || 0
        ),
        window_check_cost: Math.round(
          parseFloat(values.window_check_cost) || 0
        ),
        expenses: Math.round(parseFloat(values.expenses) || 0),
        labor_fees: Math.round(parseFloat(values.labor_fees) || 0),
        total: Math.round(parseFloat(values.total) || 0),
        note: values.note || null
      };

      const otherData = {
        has_debt: values.has_debt || false,
        paid_amount: values.paid_amount || null,
        old_batch: oldBatch,
        batch_id: values.batch_id || null,
        batch_name: values.batch_name || null
      };

      console.log('Registration data to submit:', registrationData);

      if (registration) {
        await updateRegistration(registration.id, registrationData, otherData);
        console.log('Registration updated successfully');
      } else {
        await addRegistration(registrationData, otherData);
        console.log('Registration created successfully');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting registration:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const onCarNameSelect = (value) => {
    setSelectedCarName(value);
    form.setFieldsValue({ car_name: value, car_model: undefined });
  };

  const onCarYearSelect = (yearValue) => {
    const numericYear = parseInt(yearValue);
    const car = cars.find(
      (c) =>
        c.car_name === selectedCarName && parseInt(c.car_model) === numericYear
    );

    if (car) {
      form.setFieldsValue({
        car_name: car.car_name,
        car_model: car.car_model,
        number_of_cylinders: car.number_of_cylinders,
        vehicle_size: car.vehicle_size,
        size_fee: car.size_fee,
        plate_number_cost: car.plate_number_cost,
        legal_cost: car.legal_cost,
        inspection_cost: car.inspection_cost,
        electronic_contract_cost: car.electronic_contract_cost
      });
    }
  };

  const handleDebtChange = (e) => {
    setHasDebt(e.target.checked);
    if (!e.target.checked) {
      form.setFieldsValue({ paid_amount: undefined });
    }
  };

  const handleBatchChange = (e) => {
    setOldBatch(e.target.checked);
    if (!e.target.checked) {
      form.setFieldsValue({ batch_id: undefined });
    }
  };

  const calculateTotal = () => {
    const values = form.getFieldsValue();
    const moneyFields = [
      'size_fee',
      'plate_number_cost',
      'legal_cost',
      'inspection_cost',
      'electronic_contract_cost',
      'window_check_cost',
      'expenses',
      'labor_fees'
    ];

    const total = moneyFields.reduce((sum, field) => {
      const value = values[field];
      return sum + (value ? parseFloat(value) : 0);
    }, 0);

    form.setFieldsValue({ total: total.toFixed(2) });
  };

  const onMoneyFieldChange = () => {
    calculateTotal();
  };

  return (
    <Drawer
      title={registration ? t('edit_registration') : t('add_registration')}
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
          initialValues={{
            date: dayjs(),
            customerId: registration?.customer?.id,
            old_batch: !!registration?.batch,
            ...registration
          }}
        >
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
                  label={t('customer_name')}
                  name="customerId"
                  rules={[
                    { required: true, message: t('customer_name_required') }
                  ]}
                >
                  {customers && customers.length > 0 ? (
                    <Select
                      placeholder={t('search_customer')}
                      showSearch
                      allowClear
                      options={
                        customers?.map((customer) => ({
                          value: customer.id,
                          label: customer.full_name,
                          key: customer.id
                        })) || []
                      }
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <Input
                      placeholder={t('customer_name')}
                      disabled={loading}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('car_name')}
                  name="car_name"
                  rules={[
                    { required: true, message: t('please_enter_car_name') }
                  ]}
                >
                  {cars && cars.length > 0 ? (
                    <Select
                      placeholder={t('car_name')}
                      showSearch
                      allowClear
                      loading={loading}
                      options={Array.from(
                        new Set(cars.map((c) => c.car_name))
                      ).map((name) => ({ value: name, label: name }))}
                      onSelect={onCarNameSelect}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <Input
                      placeholder={t('enter_car_name')}
                      disabled={loading}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('car_model')}
                  name="car_model"
                  rules={[{ required: true, message: t('please_enter_model') }]}
                >
                  {cars && cars.length > 0 ? (
                    <Select
                      placeholder={t('enter_model')}
                      showSearch
                      allowClear
                      disabled={!selectedCarName}
                      options={Array.from(
                        new Set(
                          cars
                            .filter((c) => c.car_name === selectedCarName)
                            .map((c) => parseInt(c.car_model))
                        )
                      )
                        .sort((a, b) => b - a)
                        .map((year) => ({ value: year, label: String(year) }))}
                      onSelect={onCarYearSelect}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <InputNumber
                      placeholder={t('enter_model')}
                      style={{ width: '100%' }}
                      min={1900}
                      max={2030}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('number_of_cylinders')}
                  name="number_of_cylinders"
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
                  name="vehicle_size"
                  rules={[
                    { required: true, message: t('please_enter_vehicle_size') }
                  ]}
                >
                  {vehicleSizes && vehicleSizes.length > 0 ? (
                    <Select
                      placeholder={t('enter_vehicle_size')}
                      showSearch
                      allowClear
                      loading={loading}
                      options={vehicleSizes.map((size) => ({
                        value: size.id,
                        label: size.name
                      }))}
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <InputNumber
                      placeholder={t('enter_vehicle_size')}
                      style={{ width: '100%' }}
                      min={0}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('size_fee')}
                  name="size_fee"
                  rules={[
                    { required: true, message: t('please_enter_size_fee') }
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
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('car_color')}
                  name="car_color"
                  rules={[{ required: true, message: t('please_enter_color') }]}
                >
                  <Input placeholder={t('enter_color')} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('vin_number')}
                  name="vin_number"
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
                  name="temporary_plate_number"
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
                  name="plate_number_cost"
                  rules={[
                    { required: true, message: t('please_enter_number_price') }
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
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('legal_price')}
                  name="legal_cost"
                  rules={[
                    { required: true, message: t('please_enter_legal_price') }
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
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('examine_price')}
                  name="inspection_cost"
                  rules={[
                    { required: true, message: t('please_enter_examine_price') }
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
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('contract_price')}
                  name="electronic_contract_cost"
                  rules={[
                    {
                      required: true,
                      message: t('please_enter_contract_price')
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
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('window_price')}
                  name="window_check_cost"
                  rules={[
                    { required: true, message: t('please_enter_window_price') }
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
                    style={{ width: '100%' }}
                    placeholder={t('amount')}
                    min={0}
                    step={250}
                    parser={(value) => value.replace(/\D/g, '')}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                    addonBefore={'IQD'}
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('labor_fees')}
                  name="labor_fees"
                  rules={[
                    { required: true, message: t('please_enter_labor_fees') }
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
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item label={t('total_auto_calculated')} name="total">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder={t('amount')}
                    min={0}
                    step={250}
                    parser={(value) => value.replace(/\D/g, '')}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                    addonBefore={'IQD'}
                    precision={2}
                    readOnly
                    value={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Debt Checkbox in Pricing Section */}
            {!registration ? (
              <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24}>
                  <Form.Item name="has_debt" valuePropName="checked">
                    <Checkbox onChange={handleDebtChange}>
                      {t('has_outstanding_debt')}
                    </Checkbox>
                  </Form.Item>
                </Col>

                {has_debt && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      label={t('paid_amount')}
                      name="paid_amount"
                      rules={[
                        {
                          required: has_debt,
                          message: t('please_enter_paid_amount')
                        },
                        {
                          validator: (_, value) => {
                            if (value > total) {
                              return Promise.reject(
                                new Error(t('paid_amount_cannot_exceed_total'))
                              );
                            }
                            return Promise.resolve();
                          },
                          message: t('paid_amount_cant_be_more_than_total')
                        }
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder={t('amount')}
                        min={0}
                        step={250}
                        max={total}
                        parser={(value) => value.replace(/\D/g, '')}
                        formatter={(value) =>
                          `${Number(value).toLocaleString()}`
                        }
                        addonBefore={'IQD'}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            ) : null}
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
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                  <Col xs={24}>
                    <Form.Item name="old_batch" valuePropName="checked">
                      <Checkbox onChange={handleBatchChange}>
                        {t('belongs_to_old_batch')}
                      </Checkbox>
                    </Form.Item>
                  </Col>

                  {oldBatch ? (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label={t('batch')}
                        name="batch_id"
                        rules={[
                          {
                            required: oldBatch,
                            message: t('please_select_batch')
                          }
                        ]}
                      >
                        <Select
                          placeholder={t('select_batch')}
                          showSearch
                          allowClear
                          loading={loading}
                          options={customerBatches?.map((batch) => ({
                            value: batch.id,
                            label: batch.name || `Batch #${batch.id}`
                          }))}
                          filterOption={(input, option) =>
                            (option?.label ?? '')
                              .toString()
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  ) : (
                    <Form.Item
                      label={t('batch_name')}
                      name="batch_name"
                      rules={[
                        {
                          required: oldBatch,
                          message: t('please_write_batch_name')
                        }
                      ]}
                    >
                      <Input placeholder={t('batch_name')} />
                    </Form.Item>
                  )}
                </Row>
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
                loading={submitting}
                style={{
                  minWidth: '200px',
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {registration
                  ? t('update_registration')
                  : t('create_registration')}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </Drawer>
  );
};

export default VehicleRegistrationDrawer;
