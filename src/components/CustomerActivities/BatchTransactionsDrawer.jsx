import { Drawer, Table, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

const BatchTransactionsDrawer = ({ open, onClose, batch }) => {
  const { t } = useTranslation();

  const transactionColumns = [
    { title: t('transaction_id'), dataIndex: 'id', key: 'id' },
    {
      title: t('amount_usd'),
      dataIndex: 'amount_usd',
      key: 'amount_usd',
      render: (val) => `$${Number(val || 0).toFixed(2)}`
    },
    {
      title: t('amount_iqd'),
      dataIndex: 'amount_iqd',
      key: 'amount_iqd',
      render: (val) => `${Number(val || 0).toLocaleString()} IQD`
    },
    { title: t('note'), dataIndex: 'note', key: 'note' },
    {
      title: t('created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => (val ? new Date(val).toLocaleString() : '-')
    }
  ];

  const importColumns = [
    { title: t('import_id'), dataIndex: 'id', key: 'id' },
    {
      title: t('total_usd'),
      dataIndex: 'total_usd',
      key: 'total_usd',
      render: (val) => `$${Number(val || 0).toFixed(2)}`
    },
    {
      title: t('total_iqd'),
      dataIndex: 'total_iqd',
      key: 'total_iqd',
      render: (val) => `${Number(val || 0).toLocaleString()} IQD`
    },
    {
      title: t('paid_usd'),
      dataIndex: 'paid_amount_usd',
      key: 'paid_amount_usd',
      render: (val) => `$${Number(val || 0).toFixed(2)}`
    },
    {
      title: t('paid_iqd'),
      dataIndex: 'paid_amount_iqd',
      key: 'paid_amount_iqd',
      render: (val) => `${Number(val || 0).toLocaleString()} IQD`
    }
  ];

  const registrationColumns = [
    { title: t('registration_id'), dataIndex: 'id', key: 'id' },
    {
      title: t('total'),
      dataIndex: 'total',
      key: 'total',
      render: (val) => `${Number(val || 0).toLocaleString()} IQD`
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
                rowKey="id"
                columns={transactionColumns}
                dataSource={batch?.transactionsList || []}
                pagination={false}
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
                      rowKey="id"
                      columns={importColumns}
                      dataSource={batch?.importsList || []}
                      pagination={false}
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
                      rowKey="id"
                      columns={registrationColumns}
                      dataSource={batch?.registrationsList || []}
                      pagination={false}
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
