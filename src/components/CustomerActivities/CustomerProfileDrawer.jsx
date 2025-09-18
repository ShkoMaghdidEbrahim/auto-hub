import { Button, Card, Col, Drawer, Row, Statistic, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { getCustomerActivities } from '../../database/APIs/CustomerActivities.js';
import { useEffect, useState } from 'react';
import BatchTransactionsDrawer from './BatchTransactionsDrawer.jsx';
import RepaymentModal from './RepaymentModal.jsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  importTransportationColumns,
  registrationColumns,
  transactionColumns
} from '../../helpers/TransactionColumns.js';

import '../../helpers/Vazirmatn-Bold-bold.js';
import '../../helpers/Vazirmatn-Regular-normal.js';

const formatUSD = (value) => `$${Number(value || 0).toFixed(2)}`;
const formatIQD = (value) => `${Number(value || 0).toLocaleString()} IQD`;

const CustomerProfileDrawer = ({ open, onClose, customer }) => {
  const { t, i18n } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [batchTransactionsDrawer, setBatchTransactionsDrawer] = useState({
    open: false,
    batch: null
  });
  const [RepaymentModalOpen, setRepaymentModalOpen] = useState(false);

  console.log(customer);

  useEffect(() => {
    if (!customer?.id) return;
    getCustomerActivities(customer.id).then((response) => {
      setActivities(response || []);
    });
  }, [customer]);

  console.log(i18n.dir());

  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a3'
    });

    const isRTL = i18n.dir() === 'rtl';

    doc.setFont('Vazirmatn-Bold', 'bold');
    doc.setLanguage(i18n.language);

    const pageWidth = doc.internal.pageSize.getWidth();
    try {
      const logoImg = new Image();
      logoImg.src = '/logo.png';
      const logoX = isRTL ? pageWidth - 50 : 20;
      doc.addImage(logoImg, 'PNG', logoX, 10, 30, 20);
    } catch {
      console.log('Logo not found, continuing without logo');
    }

    doc.setFontSize(16);
    doc.text(
      `${t('customer_transactions')} - ${customer?.full_name || ''}`,
      isRTL ? doc.internal.pageSize.width - 40 : 40,
      40,
      { align: isRTL ? 'right' : 'left' }
    );

    doc.setFontSize(12);
    const customerInfo = [
      `${t('customer_name')}: ${customer?.full_name || '-'}`,
      `${t('phone')}: ${customer?.phone || '-'}`,
      `${t('email')}: ${customer?.email || '-'}`,
      `${t('address')}: ${customer?.address || '-'}`,
      `${t('created_at')}: ${new Date(customer?.created_at).toLocaleDateString()}`
    ];
    customerInfo.forEach((line, i) => {
      doc.text(
        line,
        isRTL ? doc.internal.pageSize.width - 40 : 40,
        70 + i * 18,
        { align: isRTL ? 'right' : 'left' }
      );
    });

    const addTable = (title, columns, data) => {
      if (!data.length) return;

      doc.addPage();
      doc.setFontSize(14);
      doc.text(title, isRTL ? doc.internal.pageSize.width - 40 : 40, 40, {
        align: isRTL ? 'right' : 'left'
      });

      const tableColumns = columns.map((col) => ({
        header: col.title,
        dataKey: col.key
      }));

      const tableData = data.map((row) => {
        const rowData = {};
        columns.forEach((col) => {
          if (col.render) {
            rowData[col.key] = col.render(row[col.dataIndex], row);
          } else if (Array.isArray(col.dataIndex)) {
            rowData[col.key] = row[col.dataIndex[0]]?.[col.dataIndex[1]] ?? '-';
          } else {
            rowData[col.key] = row[col.dataIndex] ?? '-';
          }
        });
        return rowData;
      });

      autoTable(doc, {
        startY: 20,
        head: [tableColumns.map((c) => c.header)],
        body: tableData.map((row) => tableColumns.map((c) => row[c.dataKey])),
        styles: {
          font: 'Vazirmatn-Regular',
          fontStyle: 'normal',
          cellWidth: 'wrap',
          minCellWidth: 40,
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: isRTL ? 'right' : 'left',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [52, 152, 219],
          textColor: 255,
          font: 'Vazirmatn-Bold',
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: '#f5f5f5'
        },
        tableWidth: 'auto',
        showHead: 'everyPage',
        margin: isRTL ? { right: 10, left: 10 } : { left: 10, right: 10 },
        showFoot: 'everyPage',
        theme: 'striped'
      });
    };

    const allImports = activities.flatMap((b) => b.importsList || []);
    addTable(
      t('imports_and_transportation'),
      importTransportationColumns,
      allImports
    );

    const allRegistrations = activities.flatMap(
      (b) => b.registrationsList || []
    );
    addTable(t('registrations'), registrationColumns, allRegistrations);

    const allTransactions = activities.flatMap((b) => b.transactionsList || []);
    addTable(t('transactions'), transactionColumns, allTransactions);

    doc.addPage();
    doc.setFontSize(14);
    doc.text(t('summary'), isRTL ? doc.internal.pageSize.width - 40 : 40, 40, {
      align: isRTL ? 'right' : 'left'
    });

    const totalUsd = activities.reduce((s, b) => s + (b.totals?.usd || 0), 0);
    const totalIqd = activities.reduce((s, b) => s + (b.totals?.iqd || 0), 0);
    const outstandingUsd = activities.reduce(
      (s, b) => s + (b.outstanding?.usd || 0),
      0
    );
    const outstandingIqd = activities.reduce(
      (s, b) => s + (b.outstanding?.iqd || 0),
      0
    );

    autoTable(doc, {
      body: [
        [t('total_usd'), formatUSD(totalUsd)],
        [t('total_iqd'), formatIQD(totalIqd)],
        [t('outstanding_usd'), formatUSD(outstandingUsd)],
        [t('outstanding_iqd'), formatIQD(outstandingIqd)]
      ],
      startY: 60,
      theme: 'grid',
      styles: {
        font: 'Vazirmatn-Regular',
        fontStyle: 'normal',
        halign: isRTL ? 'right' : 'left'
      }
    });

    doc.save(`customer_${customer?.id || 'transactions'}.pdf`);
  };

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
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  onClick={() => setRepaymentModalOpen(true)}
                >
                  {t('repayment')}
                </Button>
              </Col>
              <Col span={12}>
                <Button type="default" block onClick={exportPDF}>
                  {t('export_transactions')}
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
                  setBatchTransactionsDrawer({ open: true, batch: record })
              })}
              scroll={{ x: 'max-content' }}
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

      {RepaymentModalOpen && (
        <RepaymentModal
          open={RepaymentModalOpen}
          onClose={() => {
            setRepaymentModalOpen(false);
            getCustomerActivities(customer.id).then((response) => {
              setActivities(response || []);
            });
          }}
          batches={activities.filter(
            (b) => b.outstanding.usd > 0 || b.outstanding.iqd > 0
          )}
        />
      )}
    </>
  );
};

export default CustomerProfileDrawer;
