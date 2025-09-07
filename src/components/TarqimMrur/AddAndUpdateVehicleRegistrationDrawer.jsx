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
  AutoComplete
} from 'antd';
import {
  CarOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getCars } from '../../database/APIs/CarsApi';
import {
  addRegistration,
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
  const [hasDebt, setHasDebt] = useState(false);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [carModels, setCarModels] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    if (open) {
      fetchCars();
      fetchCustomers();
    } else {
      // Reset form when drawer is closed
      form.resetFields();
      setSelectedCar(null);
    }
  }, [open]);

  // Pre-fill form when editing
  useEffect(() => {
    if (open && registration) {
      console.log('Pre-filling form with registration data:', registration);

      // Find the customer name from the customer object
      const customerName = registration.customers?.full_name || '';

      // Pre-fill the form with all available data
      form.setFieldsValue({
        customerId: customerName,
        carName: registration.car_name,
        model: registration.car_model,
        cylinders: registration.number_of_cylinders,
        vehicleSize: registration.vehicle_size,
        color: registration.car_color,
        vinNumber: registration.vin_number,
        temporaryPlateNumber: registration.temporary_plate_number,
        sizeFee: registration.size_fee,
        numberPrice: registration.plate_number_cost,
        legalPrice: registration.legal_cost,
        examinePrice: registration.inspection_cost,
        contractPrice: registration.electronic_contract_cost,
        windowPrice: registration.window_check_cost,
        expenses: registration.expenses,
        fees: registration.expenses, // Map expenses to fees field
        laborFees: registration.labor_fees,
        total: registration.total,
        note: registration.note,
        hasDebt: registration.has_debt || false,
        debtAmount: registration.debt_amount || 0
      });

      // Set debt state if applicable
      setHasDebt(registration.has_debt || false);

      // Find and set the selected car
      const car = cars.find((c) => c.car_name === registration.car_name);
      if (car) {
        setSelectedCar(car);
      }
    }
  }, [open, registration, cars, form]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const carsData = await getCars();
      console.log('Fetched cars data:', carsData);
      console.log('Number of cars:', carsData?.length || 0);
      setCars(carsData || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const customersData = await getCustomers();
      console.log('Fetched customers data:', customersData);
      console.log('Number of customers:', customersData?.length || 0);
      setCustomers(customersData || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const handleCarSelect = (value, option) => {
    console.log('Car selected:', { value, option, cars });
    const car = cars.find((c) => c.id === option?.key || c.car_name === value);
    console.log('Found car:', car);
    setSelectedCar(car);

    // Auto-fill form fields based on selected car
    if (car) {
      form.setFieldsValue({
        carName: car.car_name,
        model: car.car_model,
        cylinders: car.number_of_cylinders,
        vehicleSize: car.vehicle_size,
        sizeFee: car.size_fee,
        numberPrice: car.plate_number_cost,
        legalPrice: car.legal_cost,
        examinePrice: car.inspection_cost,
        contractPrice: car.electronic_contract_cost
      });
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      console.log('Form values:', values);

      // Find customer ID from selected customer name
      console.log('Form customerId value:', values.customerId);
      console.log('Available customers:', customers);
      const selectedCustomer = customers.find(
        (c) => c.full_name === values.customerId
      );
      console.log('Selected customer:', selectedCustomer);
      const customerId = selectedCustomer ? selectedCustomer.id : null;
      console.log('Final customer ID:', customerId);

      // Map form values to database fields
      const registrationData = {
        customer_id: customerId,
        vin_number: values.vinNumber,
        temporary_plate_number: values.temporaryPlateNumber || null,
        car_name: values.carName,
        car_model: parseInt(values.model) || 0,
        number_of_cylinders: parseInt(values.cylinders) || 0,
        vehicle_size: parseInt(values.vehicleSize) || 0,
        car_color: values.color,
        size_fee: Math.round(parseFloat(values.sizeFee) || 0),
        plate_number_cost: Math.round(parseFloat(values.numberPrice) || 0),
        legal_cost: Math.round(parseFloat(values.legalPrice) || 0),
        inspection_cost: Math.round(parseFloat(values.examinePrice) || 0),
        electronic_contract_cost: Math.round(
          parseFloat(values.contractPrice) || 0
        ),
        window_check_cost: Math.round(parseFloat(values.windowPrice) || 0),
        expenses: Math.round(parseFloat(values.fees) || 0),
        labor_fees: Math.round(parseFloat(values.laborFees) || 0),
        total: Math.round(parseFloat(values.total) || 0),
        note: values.note || null
      };

      console.log('Registration data to submit:', registrationData);

      // Submit to database (create or update)
      if (registration) {
        // Update existing registration
        await updateRegistration(registration.id, registrationData);
        console.log('Registration updated successfully');
      } else {
        // Create new registration
        await addRegistration(registrationData);
        console.log('Registration created successfully');
      }

      // Success - close drawer and refresh data
      form.resetFields();
      setSelectedCar(null);
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error submitting registration:', error);
      // You might want to show an error message to the user here
    } finally {
      setSubmitting(false);
    }
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
      'fees',
      'laborFees'
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
                  label={t('customer')}
                  name="customerId"
                  rules={[
                    { required: true, message: t('please_select_customer') }
                  ]}
                >
                  {customers && customers.length > 0 ? (
                    <Select
                      placeholder={t('search_customer')}
                      showSearch
                      allowClear
                      options={
                        customers?.map((customer) => ({
                          value: customer.full_name,
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
                      placeholder={t('enter_customer_name')}
                      disabled={loading}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('car_name')}
                  name="carName"
                  rules={[
                    { required: true, message: t('please_enter_car_name') }
                  ]}
                >
                  {cars && cars.length > 0 ? (
                    <Select
                      placeholder={t('search_car_name')}
                      showSearch
                      allowClear
                      loading={loading}
                      options={
                        cars?.map((car) => ({
                          value: car.car_name,
                          label: car.car_name,
                          key: car.id
                        })) || []
                      }
                      onSelect={(value, option) =>
                        handleCarSelect(value, option)
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
                      placeholder={t('enter_car_name')}
                      disabled={loading}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label={t('model')}
                  name="model"
                  rules={[{ required: true, message: t('please_enter_model') }]}
                >
                  <InputNumber
                    placeholder={t('enter_model')}
                    style={{ width: '100%' }}
                    min={1900}
                    max={2030}
                  />
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
                  <InputNumber
                    placeholder={t('enter_vehicle_size')}
                    style={{ width: '100%' }}
                    min={0}
                  />
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
                  name="temporaryPlateNumber"
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
                <Form.Item
                  label={t('labor_fees')}
                  name="laborFees"
                  rules={[
                    { required: true, message: t('please_enter_labor_fees') }
                  ]}
                >
                  <InputNumber
                    placeholder={t('enter_labor_fees')}
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
