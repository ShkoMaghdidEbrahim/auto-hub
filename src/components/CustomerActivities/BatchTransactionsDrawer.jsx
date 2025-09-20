import { Drawer, Table, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatIQD, formatUSD } from '../../helpers/formatMoney.js';
import React from 'react';

const BatchTransactionsDrawer = ({ open, onClose, batch }) => {
  const { t } = useTranslation();

  const transactionColumns = [
    { title: t('transaction_id'), dataIndex: 'id', key: 'id' },
    {
      title: t('batch_id'),
      dataIndex: 'batch_id',
      key: 'batch_id',
      render: (val) => val || '-'
    },
    {
      title: t('amount_iqd'),
      dataIndex: 'amount_iqd',
      key: 'amount_iqd',
      render: (val) => `${Number(val || 0).toLocaleString()} IQD`
    },
    {
      title: t('amount_usd'),
      dataIndex: 'amount_usd',
      key: 'amount_usd',
      render: (val) => `$${Number(val || 0).toFixed(2)}`
    },
    { title: t('note'), dataIndex: 'note', key: 'note' },
    {
      title: t('created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => (val ? new Date(val).toLocaleString() : '-')
    },
    {
      title: t('updated_at'),
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (val) => (val ? new Date(val).toLocaleString() : '-')
    },
    {
      title: t('context_type'),
      dataIndex: 'context_type',
      key: 'context_type',
      render: (val) => t(val || 'unknown')
    },
    {
      title: t('context_id'),
      dataIndex: 'context_id',
      key: 'context_id',
      render: (val) => val || '-'
    }
  ];

  const importTransportationColumns = [
    {
      title: t('vin_number'),
      dataIndex: 'vin_number',
      key: 'vin_number',
      width: 150
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
    }
  ];

  const registrationColumns = [
    {
      title: t('vin_number'),
      dataIndex: 'vin_number',
      key: 'vin_number',
      width: 150
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
      title: t('number_of_cylinders'),
      dataIndex: 'number_of_cylinders',
      key: 'number_of_cylinders',
      width: 100
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
      title: t('size_fee'),
      dataIndex: 'size_fee',
      key: 'size_fee',
      width: 100,
      render: (value) => formatIQD(value)
    },
    {
      title: t('plate_number_cost'),
      dataIndex: 'plate_number_cost',
      key: 'plate_number_cost',
      width: 100,
      render: (value) => formatIQD(value)
    },
    {
      title: t('legal_cost'),
      dataIndex: 'legal_cost',
      key: 'legal_cost',
      width: 100,
      render: (value) => formatIQD(value)
    },

    {
      title: t('inspection_cost'),
      dataIndex: 'inspection_cost',
      key: 'inspection_cost',
      width: 100,
      render: (value) => formatIQD(value)
    },
    {
      title: t('electronic_contract_cost'),
      dataIndex: 'electronic_contract_cost',
      key: 'electronic_contract_cost',
      width: 100,
      render: (value) => formatIQD(value)
    },
    {
      title: t('window_check_cost'),
      dataIndex: 'window_check_cost',
      key: 'window_check_cost',
      width: 100,
      render: (value) => formatIQD(value)
    },
    {
      title: t('expenses'),
      dataIndex: 'expenses',
      key: 'expenses',
      width: 100,
      render: (value) => formatIQD(value)
    },
    {
      title: t('labor_fees'),
      dataIndex: 'labor_fees',
      key: 'labor_fees',
      width: 100,
      render: (value) => formatIQD(value)
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
    }
  ];

  return (
    <Drawer
      title={`${t('batch_details')} #${batch?.batchName}`}
      open={open}
      onClose={onClose}
      placement="bottom"
      footer={null}
      height={'45%'}
    >
      <Tabs
        defaultActiveKey="transactions"
        items={[
          {
            key: 'transactions',
            label: t('transactions'),
            children: (
              <Table
                columns={transactionColumns}
                dataSource={batch?.transactionsList || []}
                rowKey="id"
                scroll={{
                  x: 'max-content'
                }}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
                  pageSizeOptions: ['10', '20', '50', '100']
                }}
              />
            )
          },
          ...(batch?.batchType === 'import_and_transportation'
            ? [
                {
                  key: t('import_and_transportation'),
                  label: t('imports'),
                  children: (
                    <Table
                      columns={importTransportationColumns}
                      dataSource={batch?.importsList || []}
                      rowKey="id"
                      scroll={{
                        x: 'max-content'
                      }}
                      pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
                        pageSizeOptions: ['10', '20', '50', '100']
                      }}
                    />
                  )
                }
              ]
            : []),
          ...(batch?.batchType === 'vehicle_registration'
            ? [
                {
                  key: t('vehicle_registration'),
                  label: t('registrations'),
                  children: (
                    <Table
                      columns={registrationColumns}
                      dataSource={batch?.registrationsList || []}
                      rowKey="id"
                      scroll={{
                        x: 'max-content'
                      }}
                      pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
                        pageSizeOptions: ['10', '20', '50', '100']
                      }}
                    />
                  )
                }
              ]
            : [])
        ]}
      />
    </Drawer>
  );
};

export default BatchTransactionsDrawer;
