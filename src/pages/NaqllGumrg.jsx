 import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Divider,
  Row,
  Col,
  Table,
  Popconfirm,
  Space,
  message
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import AddAndUpdateNaqllGumrgDrawer from '../components/NaqllGumrg/AddAndUpdateNaqllGumrgDrawer';
import {
  getImportTransportationRecords,
  deleteImportTransportationRecord
} from '../database/APIs/NaqllGumrgApi';
import { formatIQD, formatUSD } from '../helpers/formatMoney';

const NaqllGumrg = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [importTransportationInfo, setImportTransportationInfo] = useState([]);
  const [addAndUpdateModal, setAddAndUpdateModal] = useState({
    open: false,
    record: null
  });

  // Function to fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getImportTransportationRecords();
      setImportTransportationInfo(data);
    } catch (error) {
      console.error('Error fetching import transportation records:', error);
      message.error(t('failed_to_fetch_records'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteImportTransportationRecord(id);
      message.success(t('record_deleted_successfully'));
      fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
      message.error(t('failed_to_delete_record'));
      setLoading(false);
    }
  };

  const importTransportationColumns = [
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
      title: t('car_color'),
      dataIndex: 'car_color',
      key: 'car_color',
      width: 100
    },
    {
      title: t('import_fee'),
      dataIndex: 'import_fee',
      key: 'import_fee',
      width: 100,
      render: (value) => formatIQD(value)
    },
    {
      title: t('import_system_fee'),
      dataIndex: 'import_system_fee',
      key: 'import_system_fee',
      width: 120,
      render: (value) => formatIQD(value)
    },
    {
      title: t('car_coc_fee'),
      dataIndex: 'car_coc_fee',
      key: 'car_coc_fee',
      width: 100,
      render: (value) => formatUSD(value)
    },
    {
      title: t('transportation_fee'),
      dataIndex: 'transportation_fee',
      key: 'transportation_fee',
      width: 120,
      render: (value) => formatUSD(value)
    },
    {
      title: t('total_usd'),
      dataIndex: 'total_usd',
      key: 'total_usd',
      width: 100,
      render: (value) => formatUSD(value)
    },
    {
      title: t('total_iqd'),
      dataIndex: 'total_iqd',
      key: 'total_iqd',
      width: 100,
      render: (value) => formatIQD(value)
    },
    {
      title: t('paid_amount_usd'),
      dataIndex: 'paid_amount_usd',
      key: 'paid_amount_usd',
      width: 120,
      render: (value) => formatUSD(value)
    },
    {
      title: t('paid_amount_iqd'),
      dataIndex: 'paid_amount_iqd',
      key: 'paid_amount_iqd',
      width: 120,
      render: (value) => formatIQD(value)
    },
    {
      title: t('note'),
      dataIndex: 'note',
      key: 'note',
      width: 150,
      ellipsis: true
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
              setAddAndUpdateModal({
                open: true,
                record: record
              })
            }
          >
            {t('edit')}
          </Button>

          <Popconfirm
            title={t('are_you_sure_you_want_to_delete')}
            onConfirm={() => handleDelete(record.id)}
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
                  {t('naqll_gumrg')}
                </Divider>
              </Col>
              <Col span={6}>
                <Button
                  block
                  type="primary"
                  onClick={() =>
                    setAddAndUpdateModal({
                      open: true,
                      record: null
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
              columns={importTransportationColumns}
              dataSource={importTransportationInfo}
              rowKey="id"
              scroll={{
                x: 'max-content'
              }}
            />
          </Col>
        </Row>
      </Card>

      {addAndUpdateModal.open && (
        <AddAndUpdateNaqllGumrgDrawer
          open={addAndUpdateModal.open}
          record={addAndUpdateModal.record}
          onClose={() =>
            setAddAndUpdateModal({
              open: false,
              record: null
            })
          }
          onSuccess={() => {
            fetchData();
          }}
          t={t}
        />
      )}
    </>
  );
};

export default NaqllGumrg;