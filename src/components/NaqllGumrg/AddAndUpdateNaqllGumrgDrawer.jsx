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
  Select,
  message
} from 'antd';
import {
  CarOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  addNaqllGumrgRecord,
  updateNaqllGumrgRecord,
  getCustomerBatches
} from '../../database/APIs/NaqllGumrgApi';
import { getCustomers } from '../../database/APIs/CustomersApi';
import { getCars } from '../../database/APIs/CarsApi';
import { getSizesEnum } from '../../database/APIs/CarsApi';

const { Title } = Typography;
const { TextArea } = Input;

const AddAndUpdateNaqllGumrgDrawer = ({ open, record, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [has_debt, setHasDebt] = useState(record?.has_debt || false);
  const [oldBatch, setOldBatch] = useState(!!record?.batch);
  const [cars, setCars] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCarName, setSelectedCarName] = useState(
    record?.car_name || null
  );
  const [vehicleSizes, setVehicleSizes] = useState([]);
  const [customerBatches, setCustomerBatches] = useState([]);

  const customerId = form.getFieldValue('customerId');
  const totalUsd = form.getFieldValue('total_usd');
  const totalIqd = form.getFieldValue('total_iqd');

  useEffect(() => {
    setLoading(true);
    Promise.all([getCars(), getCustomers(), getSizesEnum()])
      .then(([carsData, customersData, sizes]) => {
        setCars(carsData || []);
        setCustomers(customersData || []);
        setVehicleSizes(sizes || []);
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        message.error(t('error_loading_data'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Load customer batches when customer changes
  useEffect(() => {
    if (record?.customer_id || customerId) {
      getCustomerBatches(record?.customer_id || customerId)
        .then((data) => {
          setCustomerBatches(data || []);
        })
        .catch((error) => {
          console.error('Error loading customer batches:', error);
        });
    }
  }, [record, customerId]);

  // Set form values when record changes
  useEffect(() => {
    if (record && customers.length > 0) {
      form.setFieldsValue({
        customerId: record.customer_id,
        ...record,
        date: record.date ? dayjs(record.date) : dayjs(),
        old_batch: !!record.batch,
        batch_id: record.batch_id
      });
      setHasDebt(record.has_debt || false);
      setOldBatch(!!record.batch);
      setSelectedCarName(record.car_name || null);
    } else if (!record) {
      form.setFieldsValue({
        date: dayjs(),
        exchange_rate: 1500,
        has_debt: false,
        old_batch: false
      });
    }
  }, [record, customers, form]);

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
        import_fee: car.import_fee,
        import_system_fee: car.import_system_fee,
        car_coc_fee: car.car_coc_fee,
        transportation_fee: car.transportation_fee
      });
      setTimeout(() => {
        calculateTotal();
      }, 100);
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      console.log('Form values:', values);

      // Helper function to safely convert to number
      const toNumber = (value, defaultValue = 0) => {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
      };

      const toInteger = (value, defaultValue = 0) => {
        const num = parseInt(value);
        return isNaN(num) ? defaultValue : num;
      };

      const naqllGumrgData = {
        customer_id: values.customerId,
        vin_number: values.vin_number || null,
        car_name: values.car_name || null,
        car_model: toInteger(values.car_model),
        car_color: values.car_color || null,
        import_fee: Math.round(toNumber(values.import_fee)),
        import_system_fee: Math.round(toNumber(values.import_system_fee)),
        car_coc_fee: Math.round(toNumber(values.car_coc_fee) * 100) / 100,
        transportation_fee: Math.round(toNumber(values.transportation_fee) * 100) / 100,
        total_usd: Math.round(toNumber(values.total_usd) * 100) / 100,
        total_iqd: Math.round(toNumber(values.total_iqd)),
        usd_to_iqd_rate: Math.round(toNumber(values.exchange_rate)),
        note: values.note || null
      };

      const otherData = {
        has_debt: has_debt || false,
        paid_amount_usd: has_debt ? Math.round(toNumber(values.paid_amount_usd) * 100) / 100 : Math.round(toNumber(values.total_usd) * 100) / 100,
        paid_amount_iqd: has_debt ? Math.round(toNumber(values.paid_amount_iqd)) : Math.round(toNumber(values.total_iqd)),
        old_batch: oldBatch,
        batch_id: values.batch_id || null,
        batch_name: values.batch_name || null
      };

      console.log('NaqllGumrg data to submit:', naqllGumrgData);

      // Validate required fields before submission
      const requiredFields = [
        'customer_id',
        'vin_number',
        'car_name',
        'car_model',
        'car_color'
      ];
      const missingFields = requiredFields.filter(
        (field) => !naqllGumrgData[field]
      );

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        message.error(t('please_fill_required_fields'));
        return;
      }

      if (record) {
        await updateNaqllGumrgRecord(record.id, naqllGumrgData, otherData);
        console.log('NaqllGumrg record updated successfully');
        message.success(t('record_updated_successfully'));
      } else {
        await addNaqllGumrgRecord(naqllGumrgData, otherData);
        console.log('NaqllGumrg record created successfully');
        message.success(t('record_created_successfully'));
      }

      form.resetFields();
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error submitting NaqllGumrg record:', error);

      // More specific error handling
      if (error.message) {
        message.error(`${t('error_saving_record')}: ${error.message}`);
      } else {
        message.error(t('error_saving_record'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDebtChange = (e) => {
    setHasDebt(e.target.checked);
    if (!e.target.checked) {
      form.setFieldsValue({ 
        paid_amount_usd: undefined,
        paid_amount_iqd: undefined 
      });
    } else {
      // When debt is enabled, set paid amounts to 0
      form.setFieldsValue({ 
        paid_amount_usd: 0,
        paid_amount_iqd: 0 
      });
    }
  };

  const handleBatchChange = (e) => {
    setOldBatch(e.target.checked);
    if (!e.target.checked) {
      form.setFieldsValue({ batch_id: undefined });
    } else {
      form.setFieldsValue({ batch_name: undefined });
    }
  };

  const calculateTotal = () => {
    const values = form.getFieldsValue();
    const usdFields = ['car_coc_fee', 'transportation_fee'];
    const iqdFields = ['import_fee', 'import_system_fee'];

    const totalUsd = usdFields.reduce((sum, field) => {
      const value = values[field];
      return sum + (value ? parseFloat(value) : 0);
    }, 0);

    const totalIqd = iqdFields.reduce((sum, field) => {
      const value = values[field];
      return sum + (value ? parseFloat(value) : 0);
    }, 0);

    // Get exchange rate from form or use default
    const exchangeRate = values.exchange_rate || 1500;
    const totalIqdFromUsd = totalUsd * exchangeRate;
    const finalTotalIqd = totalIqd + totalIqdFromUsd;

    form.setFieldsValue({
      total_usd: Number(totalUsd.toFixed(2)),
      total_iqd: Math.round(finalTotalIqd)
    });

    if (!has_debt) {
      form.setFieldsValue({
        paid_amount_usd: Number(totalUsd.toFixed(2)),
        paid_amount_iqd: Math.round(finalTotalIqd)
      });
    }
  };

  const onMoneyFieldChange = () => {
    calculateTotal();
  };

  return (
    <Drawer
      title={
        record ? t('edit_naqll_gumrg_record') : t('add_naqll_gumrg_record')
      }
      placement="bottom"
      onClose={onClose}
      open={open}
      height={'100%'}
    >
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <CarOutlined style={{ marginRight: '8px' }} />
          {t('naqll_gumrg_form')}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
          scrollToFirstError
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
              <Col xs={24} sm={12} md={12}>
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
                      loading={loading}
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
                      onChange={() => {
                        // Reset batch selection when customer changes
                        form.setFieldsValue({ batch_id: undefined });
                      }}
                    />
                  ) : (
                    <Input
                      placeholder={t('customer_name')}
                      disabled={loading}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12}>
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
            </Row>
          </Card>

          {/* Fees Information Section */}
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
                  label={t('import_fee')}
                  name="import_fee"
                  rules={[
                    { required: true, message: t('please_enter_import_fee') }
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
                  label={t('import_system_fee')}
                  name="import_system_fee"
                  rules={[
                    {
                      required: true,
                      message: t('please_enter_import_system_fee')
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
                  label={t('car_coc_fee')}
                  name="car_coc_fee"
                  rules={[
                    { required: true, message: t('please_enter_car_coc_fee') }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder={t('amount')}
                    min={0}
                    step={0.01}
                    precision={2}
                    parser={(value) => value.replace(/[^\d.]/g, '')}
                    formatter={(value) =>
                      value
                        ? `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                        : ''
                    }
                    addonBefore={'USD'}
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={t('transportation_fee')}
                  name="transportation_fee"
                  rules={[
                    {
                      required: true,
                      message: t('please_enter_transportation_fee')
                    }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder={t('amount')}
                    min={0}
                    step={0.01}
                    precision={2}
                    parser={(value) => value.replace(/[^\d.]/g, '')}
                    formatter={(value) =>
                      value
                        ? `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                        : ''
                    }
                    addonBefore={'USD'}
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item label={t('exchange_rate')} name="exchange_rate">
                  <InputNumber
                    placeholder={t('enter_exchange_rate')}
                    style={{ width: '100%' }}
                    defaultValue={1500}
                    min={0}
                    step={250}
                    parser={(value) => value.replace(/\D/g, '')}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                    addonBefore={'IQD'}
                    onChange={onMoneyFieldChange}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={t('total_usd_auto_calculated')}
                  name="total_usd"
                >
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

              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={t('total_iqd_auto_calculated')}
                  name="total_iqd"
                >
                  <InputNumber
                    placeholder={t('total_calculated_automatically')}
                    style={{ width: '100%' }}
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    readOnly
                    value={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Debt Checkbox and Paid Amount Fields */}
            {!record ? (
              <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24}>
                  <Form.Item name="has_debt" valuePropName="checked">
                    <Checkbox onChange={handleDebtChange}>
                      {t('has_outstanding_debt')}
                    </Checkbox>
                  </Form.Item>
                </Col>

                {has_debt && (
                  <>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label={t('paid_amount_usd')}
                        name="paid_amount_usd"
                        rules={[
                          {
                            required: has_debt,
                            message: t('please_enter_paid_amount_usd')
                          },
                          {
                            validator: (_, value) => {
                              if (value > totalUsd) {
                                return Promise.reject(
                                  new Error(t('paid_amount_cannot_exceed_total'))
                                );
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder={t('amount')}
                          min={0}
                          max={totalUsd}
                          step={0.01}
                          precision={2}
                          parser={(value) => value.replace(/[^\d.]/g, '')}
                          formatter={(value) =>
                            value
                              ? `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                              : ''
                          }
                          addonBefore={'USD'}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label={t('paid_amount_iqd')}
                        name="paid_amount_iqd"
                        rules={[
                          {
                            required: has_debt,
                            message: t('please_enter_paid_amount_iqd')
                          },
                          {
                            validator: (_, value) => {
                              if (value > totalIqd) {
                                return Promise.reject(
                                  new Error(t('paid_amount_cannot_exceed_total'))
                                );
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder={t('amount')}
                          min={0}
                          max={totalIqd}
                          step={250}
                          parser={(value) => value.replace(/\D/g, '')}
                          formatter={(value) => `${Number(value).toLocaleString()}`}
                          addonBefore={'IQD'}
                        />
                      </Form.Item>
                    </Col>
                  </>
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
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label={t('batch_name')}
                        name="batch_name"
                        rules={[
                          {
                            required: !oldBatch,
                            message: t('please_write_batch_name')
                          }
                        ]}
                      >
                        <Input placeholder={t('batch_name')} />
                      </Form.Item>
                    </Col>
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
                {record ? t('update_record') : t('create_registration')}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </Drawer>
  );
};

export default AddAndUpdateNaqllGumrgDrawer;