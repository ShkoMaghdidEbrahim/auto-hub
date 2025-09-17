import { Col, Drawer, Row, Table, Card, Statistic, Tag, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { getCustomerActivities } from '../../database/APIs/CustomerActivities.js';
import { useEffect, useState } from 'react';
import BatchTransactionsDrawer from './BatchTransactionsDrawer.jsx';
import RepaymentModal from './RepaymentModal.jsx';

const CustomerProfileDrawer = ({ open, onClose, customer }) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [batchTransactionsDrawer, setBatchTransactionsDrawer] = useState({
    open: false,
    batch: null
  });

  const [RepaymentModalOpen, setRepaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!customer?.id) return;
    getCustomerActivities(customer.id).then((response) => {
      setActivities(response);
    });
  }, [customer]);

  const columns = [
    {
      title: t('batch_id'),
      dataIndex: 'batchId',
      key: 'batchId'
    },
    {
      title: t('batch_name'),
      dataIndex: 'batchName',
      key: 'batchName'
    },
    {
      title: t('batch_type'),
      dataIndex: 'batchType',
      key: 'batchType',
      render: (text, record) => (
        <Tag
          color={
            record.batchType === 'import_and_transportation' ? 'blue' : 'orange'
          }
        >
          {t(text)}
        </Tag>
      )
    },
    {
      title: t('total_usd'),
      dataIndex: ['totals', 'usd'],
      key: 'totalUsd',
      render: (val) => `$${val.toFixed(2)}`
    },
    {
      title: t('total_iqd'),
      dataIndex: ['totals', 'iqd'],
      key: 'totalIqd',
      render: (val) => `${val.toLocaleString()} IQD`
    },
    {
      title: t('outstanding_usd'),
      dataIndex: ['outstanding', 'usd'],
      key: 'outstandingUsd',
      render: (val) => `$${val.toFixed(2)}`
    },
    {
      title: t('outstanding_iqd'),
      dataIndex: ['outstanding', 'iqd'],
      key: 'outstandingIqd',
      render: (val) => `${val.toLocaleString()} IQD`
    },
    {
      title: t('status'),
      key: 'status',
      render: (_, record) => {
        const isPaid =
          record.outstanding.usd <= 0 && record.outstanding.iqd <= 0;
        return isPaid ? (
          <Tag color="green">{t('paid')}</Tag>
        ) : (
          <Tag color="red">{t('not_paid')}</Tag>
        );
      }
    }
  ];

  return (
    <>
      <Drawer
        height="100%"
        title={t('customer_profile')}
        placement="bottom"
        open={open}
        onClose={onClose}
        footer={null}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Row gutter={[10, 10]}>
              <Col span={24}>
                <Button
                  type="primary"
                  block
                  onClick={() => {
                    setRepaymentModalOpen(true);
                  }}
                >
                  {t('repayment')}
                </Button>
              </Col>
            </Row>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('total_usd')}
                value={activities.reduce((s, b) => s + (b.totals?.usd || 0), 0)}
                precision={2}
                prefix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('total_iqd')}
                value={activities.reduce((s, b) => s + (b.totals?.iqd || 0), 0)}
                precision={0}
                suffix="IQD"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('outstanding_usd')}
                value={activities.reduce(
                  (s, b) => s + (b.outstanding?.usd || 0),
                  0
                )}
                precision={2}
                prefix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('outstanding_iqd')}
                value={activities.reduce(
                  (s, b) => s + (b.outstanding?.iqd || 0),
                  0
                )}
                precision={0}
                suffix="IQD"
              />
            </Card>
          </Col>

          <Col span={24}>
            <Table
              rowKey="batchId"
              columns={columns}
              dataSource={activities}
              onRow={(record) => ({
                onClick: () =>
                  setBatchTransactionsDrawer({
                    open: true,
                    batch: record
                  })
              })}
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
          </Col>
        </Row>
      </Drawer>

      {batchTransactionsDrawer.open && (
        <BatchTransactionsDrawer
          open={batchTransactionsDrawer.open}
          onClose={() =>
            setBatchTransactionsDrawer({ open: false, batch: null })
          }
          batch={batchTransactionsDrawer.batch}
        />
      )}

      {RepaymentModalOpen ? (
        <RepaymentModal
          open={RepaymentModalOpen}
          onClose={() => {
            setRepaymentModalOpen(false);
            getCustomerActivities(customer.id).then((response) => {
              setActivities(response);
            });
          }}
          batches={activities.filter(
            (b) => b.outstanding.usd > 0 || b.outstanding.iqd > 0
          )}
        />
      ) : null}
    </>
  );
};

export default CustomerProfileDrawer;
