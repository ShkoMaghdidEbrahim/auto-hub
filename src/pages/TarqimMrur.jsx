import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Divider,
  Row,
  Col,
  Table,
  Popconfirm,
  Space
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AddAndUpdateVehicleRegistrationDrawer from '../components/TarqimMrur/AddAndUpdateVehicleRegistrationDrawer';
import {
  getRegistrations,
  deleteRegistration
} from '../database/APIs/RegistrationApi';
import { formatIQD } from '../helpers/formatMoney';

const TarqimMrur = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState([]);

  useEffect(() => {
    getRegistrations()
      .then((data) => {
        setRegistrationInfo(data);
      })
      .catch((error) => {
        console.error('Error fetching registrations:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const [
    addAndUpdateVehicleRegistrationModal,
    setAddAndUpdateVehicleRegistrationModal
  ] = useState({
    open: false,
    registration: null
  });

  const registrationColumns = [
    {
      title: t('vin_number'),
      dataIndex: 'vin_number',
      key: 'vin_number',
      width: 150
    },
    {
      title: t('customer_name'),
      dataIndex: 'customer',
      key: 'full_name',
      width: 120,
      render: (customer) => customer?.full_name || t('no_customer')
    },
    {
      title: t('car_name'),
      dataIndex: 'car_name',
      key: 'car_name',
      width: 120
    },
    {
      title: t('car_model'),
      dataIndex: 'car_model',
      key: 'car_model',
      width: 100
    },
    {
      title: t('vehicle_size'),
      dataIndex: 'vehicle_size_type',
      key: 'vehicle_size',
      width: 120,
      render: (vehicleSize) => vehicleSize?.name || t('no_size')
    },
    {
      title: t('car_color'),
      dataIndex: 'car_color',
      key: 'car_color',
      width: 100
    },
    {
      title: t('plate_number'),
      dataIndex: 'temporary_plate_number',
      key: 'temporary_plate_number',
      width: 120
    },
    {
      title: t('total'),
      dataIndex: 'total',
      key: 'total',
      width: 100,
      render: (value) => formatIQD(value)
    },
    {
      title: t('created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (value) => new Date(value).toLocaleDateString()
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
              setAddAndUpdateVehicleRegistrationModal({
                open: true,
                registration: record
              })
            }
          >
            {t('edit')}
          </Button>

          <Popconfirm
            title={t('are_you_sure_you_want_to_delete')}
            onConfirm={() =>
              deleteRegistration(record.id)
                .then(() => {
                  getRegistrations()
                    .then((data) => {
                      setRegistrationInfo(data);
                    })
                    .catch((error) => {
                      console.error('Error fetching registrations:', error);
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                })
                .catch((error) => {
                  console.error('Error deleting registration:', error);
                })
            }
            okText={t('yes')}
            cancelText={t('no')}
          >
            <Button
              shape={'round'}
              type="default"
              danger
              loading={loading}
              disabled={loading}
              icon={<DeleteOutlined />}
            >
              {t('delete')}
            </Button>
          </Popconfirm>
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
                    setAddAndUpdateVehicleRegistrationModal({
                      open: true,
                      registration: null
                    })
                  }
                >
                  {t('add_registration')}
                </Button>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Table
              loading={loading}
              columns={registrationColumns}
              dataSource={registrationInfo}
              rowKey="id"
              scroll={{
                x: 'max-content'
              }}
            />
          </Col>
        </Row>
      </Card>

      {addAndUpdateVehicleRegistrationModal.open ? (
        <AddAndUpdateVehicleRegistrationDrawer
          open={addAndUpdateVehicleRegistrationModal.open}
          registration={addAndUpdateVehicleRegistrationModal.registration}
          onClose={() =>
            setAddAndUpdateVehicleRegistrationModal({
              open: false,
              registration: null
            })
          }
          onSuccess={() => {
            getRegistrations()
              .then((data) => {
                setRegistrationInfo(data);
              })
              .catch((error) => {
                console.error('Error fetching registrations:', error);
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        />
      ) : null}
    </>
  );
};

export default TarqimMrur;
