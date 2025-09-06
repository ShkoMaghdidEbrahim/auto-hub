import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Divider, Row, Space, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatIQD } from '../helpers/formatMoney.js';
import AddAndUpdateCarsModal from '../components/PredefinedValues/Cars/AddAndUpdateCarsModal.jsx';
import { deleteCar, getCars } from '../database/APIs/CarsApi.js';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const PredefinedValues = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);

  const [addAndUpdateCarsModal, setAddAndUpdateCarsModal] = useState({
    open: false,
    car: null
  });

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

  return (
    <Card
      style={{
        minHeight: '100%',
        borderRadius: 0
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
    </Card>
  );
};

export default PredefinedValues;
