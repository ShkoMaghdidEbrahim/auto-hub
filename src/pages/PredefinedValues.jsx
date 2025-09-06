import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Divider, Row, Table, Space, Modal } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatIQD } from '../helpers/formatMoney.js';
import AddAndUpdateCustomersModal from '../components/PredifnedValues/AddAndUpdateCustomersModal.jsx';
import AddAndUpdateCarsModal from '../components/PredefinedValues/Cars/AddAndUpdateCarsModal.jsx';
import { getCustomers, deleteCustomer } from '../database/APIs/CustomersApi.js';
import { deleteCar, getCars } from '../database/APIs/CarsApi.js';

const PredefinedValues = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [cars, setCars] = useState([]);
  const [addAndUpdateCarsModal, setAddAndUpdateCarsModal] = useState({
    open: false,
    car: null
  });
  const [addAndUpdateCustomersModal, setAddAndUpdateCustomersModal] = useState({
    open: false,
    customer: null
  });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    open: false,
    customerId: null,
    customerName: ''
  });

  // Fetch customers from database
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load customers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle delete confirmation
  const handleDeleteCustomer = (customerId, customerName) => {
    setDeleteConfirmModal({
      open: true,
      customerId,
      customerName
    });
  };

  // Confirm delete action
  const confirmDelete = async () => {
    try {
      await deleteCustomer(deleteConfirmModal.customerId);
      fetchCustomers();
      setDeleteConfirmModal({
        open: false,
        customerId: null,
        customerName: ''
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    getCars()
      .then((data) => {
        setCars(data);
      })
      .catch((error) => {
        console.error('Error fetching cars:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const carsColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span>{id}</span>
    },
    {
      title: t('car_name'),
      dataIndex: 'car_name',
      key: 'car_name'
    },
    {
      title: t('car_model'),
      dataIndex: 'car_model',
      key: 'car_model'
    },
    {
      title: t('number_of_cylinders'),
      dataIndex: 'number_of_cylinders',
      key: 'number_of_cylinders',
      render: (value) => (value ? value : '-')
    },
    {
      title: t('vehicle_size'),
      dataIndex: 'vehicle_size_types',
      key: 'vehicle_size_types',
      render: (vehicle_size_types) => vehicle_size_types?.name || '-'
    },
    {
      title: t('size_fee'),
      dataIndex: 'size_fee',
      key: 'size_fee',
      render: (value) => formatIQD(value)
    },
    {
      title: t('plate_number_cost'),
      dataIndex: 'plate_number_cost',
      key: 'plate_number_cost',
      render: (value) => formatIQD(value)
    },
    {
      title: t('legal_cost'),
      dataIndex: 'legal_cost',
      key: 'legal_cost',
      render: (value) => formatIQD(value)
    },
    {
      title: t('inspection_cost'),
      dataIndex: 'inspection_cost',
      key: 'inspection_cost',
      render: (value) => formatIQD(value)
    },
    {
      title: t('electronic_contract_cost'),
      dataIndex: 'electronic_contract_cost',
      key: 'electronic_contract_cost',
      render: (value) => formatIQD(value)
    },
    {
      title: t('window_check_cost'),
      dataIndex: 'window_check_cost',
      key: 'window_check_cost',
      render: (value) => formatIQD(value)
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 250,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            loading={loading}
            disabled={loading}
            shape={'round'}
            type="default"
            icon={<EditOutlined />}
            onClick={() =>
              setAddAndUpdateCarsModal({ open: true, car: record })
            }
          >
            {t('edit')}
          </Button>

          <Button
            shape={'round'}
            type="default"
            danger
            loading={loading}
            disabled={loading}
            icon={<DeleteOutlined />}
            onClick={() =>
              deleteCar(record.id)
                .then(() => {
                  setLoading(true);
                  getCars()
                    .then((data) => {
                      setCars(data);
                    })
                    .catch((error) =>
                      console.error('Error fetching cars:', error)
                    )
                    .finally(() => setLoading(false));
                })
                .catch((error) => console.error('Error deleting car:', error))
            }
          >
            {t('delete')}
          </Button>
        </Space>
      )
    }
  ];
  const customersColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span>{id}</span>
    },
    {
      title: t('customer_name'),
      dataIndex: 'full_name',
      key: 'full_name'
    },
    {
      title: t('customer_phone'),
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: t('customer_email'),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: t('customer_address'),
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 250,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            loading={loading}
            disabled={loading}
            shape={'round'}
            type="default"
            icon={<EditOutlined />}
            onClick={() =>
              setAddAndUpdateCustomersModal({ open: true, customer: record })
            }
          >
            {t('edit')}
          </Button>

          <Button
            shape={'round'}
            type="default"
            danger
            loading={loading}
            disabled={loading}
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCustomer(record.id, record.full_name)}
          >
            {t('delete')}
          </Button>
        </Space>
      )
    }
  ];
  return (
    <>
      <Card
        style={{
          borderRadius: 0,
          marginBottom: '16px'
        }}
        variant={'borderless'}
        key={'dashboard'}
      >
        <Row gutter={[10, 16]}>
          <Col span={24}>
            <Row gutter={[10, 10]}>
              <Col span={18}>
                <Divider
                  orientation={t('rtl') ? 'right' : 'left'}
                  style={{
                    fontSize: 24,
                    margin: 0
                  }}
                  dashed={true}
                >
                  {t('cars')}
                </Divider>
              </Col>
              <Col span={6}>
                <Button
                  block
                  type="primary"
                  onClick={() =>
                    setAddAndUpdateCarsModal({ open: true, car: null })
                  }
                >
                  {t('add_car')}
                </Button>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Table
              loading={loading}
              columns={carsColumns}
              dataSource={cars}
              scroll={{
                x: 'max-content'
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card
        style={{
          borderRadius: 0
        }}
        variant={'borderless'}
        key={'customers'}
      >
        <Row gutter={[10, 16]}>
          <Col span={24}>
            <Row gutter={[10, 10]}>
              <Col span={18}>
                <Divider
                  orientation={t('rtl') ? 'right' : 'left'}
                  style={{
                    fontSize: 24,
                    margin: 0
                  }}
                  dashed={true}
                >
                  {t('customers')}
                </Divider>
              </Col>
              <Col span={6}>
                <Button
                  block
                  type="primary"
                  onClick={() =>
                    setAddAndUpdateCustomersModal({
                      open: true,
                      customer: null
                    })
                  }
                >
                  {t('add_customer')}
                </Button>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Table
              loading={loading}
              columns={customersColumns}
              dataSource={customers}
              rowKey="id"
              scroll={{
                x: 'max-content'
              }}
            />
          </Col>
        </Row>
      </Card>
      <AddAndUpdateCustomersModal
        open={addAndUpdateCustomersModal.open}
        onClose={() =>
          setAddAndUpdateCustomersModal({ open: false, customer: null })
        }
        customer={addAndUpdateCustomersModal.customer}
        onDone={fetchCustomers}
      />

      {addAndUpdateCarsModal.open ? (
        <AddAndUpdateCarsModal
          open={addAndUpdateCarsModal.open}
          car={addAndUpdateCarsModal.car}
          onClose={() => setAddAndUpdateCarsModal({ open: false, car: null })}
          onDone={() => {
            setLoading(true);
            getCars()
              .then((data) => {
                setCars(data);
              })
              .catch((error) => console.error('Error fetching cars:', error))
              .finally(() => setLoading(false));
          }}
        />
      ) : null}

      {/* Custom Delete Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            {t('confirm_delete')}
          </div>
        }
        open={deleteConfirmModal.open}
        onCancel={() =>
          setDeleteConfirmModal({
            open: false,
            customerId: null,
            customerName: ''
          })
        }
        footer={[
          <Button
            key="cancel"
            onClick={() =>
              setDeleteConfirmModal({
                open: false,
                customerId: null,
                customerName: ''
              })
            }
          >
            {t('no')}
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={confirmDelete}
            loading={loading}
          >
            {t('yes')}
          </Button>
        ]}
        centered
      >
        <p>
          {t('are_you_sure_you_want_to_delete')}{' '}
          <strong>"{deleteConfirmModal.customerName}"</strong>?
        </p>
      </Modal>
    </>
  );
};

export default PredefinedValues;
