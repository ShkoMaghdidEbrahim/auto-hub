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
import { addNaqllGumrgRecord, updateNaqllGumrgRecord } from '../../database/APIs/NaqllGumrgApi';
import { getCustomers } from '../../database/APIs/CustomersApi';
import { getCars } from '../../database/APIs/CarsApi';

const { Title } = Typography;
const { TextArea } = Input;

const AddAndUpdateNaqllGumrgDrawer = ({
    open,
    record,
    onClose,
    onSuccess
}) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [has_debt, setHasDebt] = useState(record?.has_debt || false);
    const [cars, setCars] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([getCars(), getCustomers()])
            .then(([carsData, customersData]) => {
                setCars(carsData || []);
                setCustomers(customersData || []);
            })
            .catch((error) => {
                console.error('Error loading data:', error);
                message.error(t('error_loading_data'));
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Set form values when record changes
    useEffect(() => {
        if (record && customers.length > 0) {
            const customerName = record.customers?.full_name;
            form.setFieldsValue({
                customerId: customerName,
                ...record,
                date: record.date ? dayjs(record.date) : dayjs()
            });
            setHasDebt(record.has_debt || false);
        } else if (!record) {
            form.setFieldsValue({
                date: dayjs(),
                exchange_rate: 1500
            });
        }
    }, [record, customers, form]);

    const handleCarSelect = (value, option) => {
        const car = cars.find((c) => c.id === option?.key || c.car_name === value);

        if (car) {
            form.setFieldsValue({
                car_name: car.car_name,
                car_model: car.car_model,
                number_of_cylinders: car.number_of_cylinders,
                vehicle_size: car.vehicle_size,
                import_fee: car.import_fee,
                import_system_fee: car.import_system_fee,
                car_coc_fee: car.car_coc_fee,
                transportation_fee: car.transportation_fee
            });
            // Trigger total calculation after setting values
            setTimeout(() => {
                calculateTotal();
            }, 100);
        }
    };

    const onFinish = async (values) => {
        try {
            setSubmitting(true);
            console.log('Form values:', values);

            // Fixed customer ID resolution
            let customerId = null;
            if (values.customerId) {
                const selectedCustomer = customers.find(
                    (c) => c.full_name === values.customerId || c.id === values.customerId
                );
                customerId = selectedCustomer ? selectedCustomer.id : null;
                
                if (!customerId) {
                    console.error('Customer not found for:', values.customerId);
                    message.error(t('customer_not_found'));
                    return;
                }
            }

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
                customer_id: customerId,
                vin_number: values.vin_number || null,
                temporary_plate_number: values.temporary_plate_number || null,
                car_name: values.car_name || null,
                car_model: toInteger(values.car_model),
                number_of_cylinders: toInteger(values.number_of_cylinders),
                vehicle_size: toInteger(values.vehicle_size),
                car_color: values.car_color || null,
                import_fee: Math.round(toNumber(values.import_fee)),
                import_system_fee: Math.round(toNumber(values.import_system_fee)),
                car_coc_fee: Math.round(toNumber(values.car_coc_fee)),
                transportation_fee: Math.round(toNumber(values.transportation_fee)),
                window_check_cost: Math.round(toNumber(values.window_check_cost)),
                expenses: Math.round(toNumber(values.expenses)),
                labor_fees: Math.round(toNumber(values.labor_fees)),
                total_usd: Math.round(toNumber(values.total_usd)),
                total_iqd: Math.round(toNumber(values.total_iqd)),
                paid_amount_usd: Math.round(toNumber(values.paid_amount_usd)),
                paid_amount_iqd: Math.round(toNumber(values.paid_amount_iqd)),
                has_debt: has_debt || false,
                debt_amount: has_debt ? Math.round(toNumber(values.debt_amount)) : null,
                date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                note: values.note || null
            };

            console.log('NaqllGumrg data to submit:', naqllGumrgData);

            // Validate required fields before submission
            const requiredFields = ['customer_id', 'vin_number', 'car_name', 'car_model', 'car_color'];
            const missingFields = requiredFields.filter(field => !naqllGumrgData[field]);
            
            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                message.error(t('please_fill_required_fields'));
                return;
            }

            if (record) {
                await updateNaqllGumrgRecord(record.id, naqllGumrgData);
                console.log('NaqllGumrg record updated successfully');
                message.success(t('record_updated_successfully'));
            } else {
                await addNaqllGumrgRecord(naqllGumrgData);
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
            form.setFieldsValue({ debt_amount: undefined });
        }
    };

    const calculateTotal = () => {
        const values = form.getFieldsValue();
        const moneyFields = [
            'import_fee',
            'import_system_fee',
            'car_coc_fee',
            'transportation_fee',
            'window_check_cost',
            'expenses',
            'labor_fees'
        ];

        const totalUsd = moneyFields.reduce((sum, field) => {
            const value = values[field];
            return sum + (value ? parseFloat(value) : 0);
        }, 0);

        // Get exchange rate from form or use default
        const exchangeRate = values.exchange_rate || 1500;
        const totalIqd = totalUsd * exchangeRate;

        form.setFieldsValue({
            total_usd: Number(totalUsd.toFixed(2)),
            total_iqd: Math.round(totalIqd)
        });
    };

    const onMoneyFieldChange = () => {
        calculateTotal();
    };

    return (
        <Drawer
            title={record ? t('edit_naqll_gumrg_record') : t('add_naqll_gumrg_record')}
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
                                    label={t('car_model')}
                                    name="car_model"
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
                                    <InputNumber
                                        placeholder={t('enter_vehicle_size')}
                                        style={{ width: '100%' }}
                                        min={0}
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
                                        placeholder={t('enter_import_fee')}
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
                                    label={t('import_system_fee')}
                                    name="import_system_fee"
                                    rules={[
                                        { required: true, message: t('please_enter_import_system_fee') }
                                    ]}
                                >
                                    <InputNumber
                                        placeholder={t('enter_import_system_fee')}
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
                                    label={t('car_coc_fee')}
                                    name="car_coc_fee"
                                    rules={[
                                        { required: true, message: t('please_enter_car_coc_fee') }
                                    ]}
                                >
                                    <InputNumber
                                        placeholder={t('enter_car_coc_fee')}
                                        style={{ width: '100%' }}
                                        min={0}
                                        precision={2}
                                        prefix="$"
                                        onChange={onMoneyFieldChange}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <Form.Item
                                    label={t('transportation_fee')}
                                    name="transportation_fee"
                                    rules={[
                                        { required: true, message: t('please_enter_transportation_fee') }
                                    ]}
                                >
                                    <InputNumber
                                        placeholder={t('enter_transportation_fee')}
                                        style={{ width: '100%' }}
                                        min={0}
                                        precision={2}
                                        prefix="$"
                                        onChange={onMoneyFieldChange}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <Form.Item
                                    label={t('window_check_cost')}
                                    name="window_check_cost"
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

                            <Col xs={24} sm={12} md={6}>
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

                            <Col xs={24} sm={12} md={6}>
                                <Form.Item
                                    label={t('labor_fees')}
                                    name="labor_fees"
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
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    label={t('exchange_rate')}
                                    name="exchange_rate"
                                >
                                    <InputNumber
                                        placeholder={t('enter_exchange_rate')}
                                        style={{ width: '100%' }}
                                        min={0}
                                        precision={2}
                                        defaultValue={1500}
                                        onChange={onMoneyFieldChange}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* Totals and Payments Section */}
                    <Card
                        title={
                            <span>
                                <DollarOutlined style={{ marginRight: '8px' }} />
                                {t('totals_and_payments')}
                            </span>
                        }
                        style={{ marginBottom: '24px' }}
                        size="small"
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item
                                    label={t('paid_usd')}
                                    name="paid_amount_usd"
                                >
                                    <InputNumber
                                        placeholder={t('enter_paid_usd')}
                                        style={{ width: '100%' }}
                                        min={0}
                                        precision={6}
                                        prefix="$"
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <Form.Item
                                    label={t('paid_iqd')}
                                    name="paid_amount_iqd"
                                >
                                    <InputNumber
                                        placeholder={t('enter_paid_iqd')}
                                        style={{ width: '100%' }}
                                        min={0}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item label={t('total_usd_auto_calculated')} name="total_usd">
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
                                <Form.Item label={t('total_iqd_auto_calculated')} name="total_iqd">
                                    <InputNumber
                                        placeholder={t('total_calculated_automatically')}
                                        style={{ width: '100%' }}
                                        min={0}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        readOnly
                                        value={0}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Debt Checkbox in Pricing Section */}
                        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                            <Col xs={24}>
                                <Form.Item name="has_debt" valuePropName="checked">
                                    <Checkbox onChange={handleDebtChange} checked={has_debt}>
                                        {t('has_outstanding_debt')}
                                    </Checkbox>
                                </Form.Item>
                            </Col>

                            {has_debt && (
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        label={t('debt_amount')}
                                        name="debt_amount"
                                        rules={[
                                            {
                                                required: has_debt,
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

                    {/* Additional Information Section - removed date field since it's not in table */}
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

export default AddAndUpdateNaqllGumrgDrawer;