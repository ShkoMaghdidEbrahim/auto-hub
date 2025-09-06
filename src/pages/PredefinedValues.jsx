import React, { useState } from 'react';
import { Button, Card, Col, Divider, Row, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatIQD } from '../helpers/formatMoney.js';
import AddAndUpdateCarsModal from '../components/PredefinedValues/Cars/AddAndUpdateCarsModal.jsx';

const PredefinedValues = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [addAndUpdateCarsModal, setAddAndUpdateCarsModal] = useState({
    open: false,
    car: null
  });

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
      dataIndex: 'vehicle_size',
      key: 'vehicle_size'
    },
    {
      title: t('size_fee'),
      dataIndex: 'size_fee',
      key: 'size_fee',
      render: (value) => formatIQD(value.toLocaleString())
    },
    {
      title: t('plate_number_cost'),
      dataIndex: 'plate_number_cost',
      key: 'plate_number_cost',
      render: (value) => formatIQD(value.toLocaleString())
    },
    {
      title: t('legal_cost'),
      dataIndex: 'legal_cost',
      key: 'legal_cost',
      render: (value) => formatIQD(value.toLocaleString())
    },
    {
      title: t('inspection_cost'),
      dataIndex: 'inspection_cost',
      key: 'inspection_cost',
      render: (value) => formatIQD(value.toLocaleString())
    },
    {
      title: t('electronic_contract_cost'),
      dataIndex: 'electronic_contract_cost',
      key: 'electronic_contract_cost',
      render: (value) => formatIQD(value.toLocaleString())
    },
    {
      title: t('window_check_cost'),
      dataIndex: 'window_check_cost',
      key: 'window_check_cost',
      render: (value) => formatIQD(value.toLocaleString())
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
            dataSource={[]}
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
        />
      ) : null}
    </Card>
  );
};

export default PredefinedValues;
