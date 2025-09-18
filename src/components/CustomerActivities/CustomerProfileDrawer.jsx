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

  console.log(activities);
  const [RepaymentModalOpen, setRepaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!customer?.id) return;
    getCustomerActivities(customer.id).then((response) => {
      setActivities(response || []);
    });
  }, [customer]);

  const exportPDF = async () => {
    try {
      // Initialize PDF with optimized settings
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a3',
        compress: false
      });

      const isRTL = i18n.dir() === 'rtl';
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      // Color scheme
      const colors = {
        primary: [52, 152, 219], // Blue
        secondary: [46, 125, 50], // Green
        accent: [255, 193, 7], // Amber
        text: [33, 37, 41], // Dark gray
        light: [248, 249, 250], // Light gray
        white: [255, 255, 255],
        border: [222, 226, 230] // Light border
      };

      // Set up fonts
      doc.setFont('Vazirmatn-Bold', 'bold');
      doc.setLanguage(i18n.language);

      // Helper function to add decorative header
      const addPageHeader = (title, subtitle = '') => {
        // Add gradient-like background header
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 80, 'F');

        // Logo handling with better error management
        try {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoSize = 40;
            const logoX = isRTL ? pageWidth - margin - logoSize : margin;
            doc.addImage(logoImg, 'PNG', logoX, 20, logoSize, logoSize);
          };
          logoImg.onerror = () => {
            console.warn('Logo not found, adding placeholder');
            // Add placeholder logo circle
            doc.setFillColor(...colors.white);
            const logoX = isRTL ? pageWidth - margin - 20 : margin;
            doc.circle(logoX + 20, 40, 20, 'F');
            doc.setTextColor(...colors.primary);
            doc.setFontSize(16);
            doc.text('LOGO', logoX + 20, 45, { align: 'center' });
          };
          logoImg.src = '/logo.png';
        } catch (error) {
          console.error('Error loading logo:', error);
        }

        // Main title with shadow effect
        doc.setTextColor(...colors.white);
        doc.setFontSize(24);
        doc.setFont('Vazirmatn-Bold', 'bold');

        const titleX = isRTL ? pageWidth - margin - 100 : margin + 80;
        // Shadow
        doc.setTextColor(0, 0, 0, 0.3);
        doc.text(title, titleX + 1, 46, { align: isRTL ? 'right' : 'left' });
        // Main text
        doc.setTextColor(...colors.white);
        doc.text(title, titleX, 45, { align: isRTL ? 'right' : 'left' });

        // Subtitle
        if (subtitle) {
          doc.setFontSize(14);
          doc.setFont('Vazirmatn-Regular', 'normal');
          doc.setTextColor(255, 255, 255, 0.9);
          doc.text(subtitle, titleX, 65, { align: isRTL ? 'right' : 'left' });
        }

        // Add date and time
        const now = new Date();
        const dateStr =
          now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        doc.setFontSize(10);
        const dateX = isRTL ? margin : pageWidth - margin;
        doc.text(dateStr, dateX, 25, { align: isRTL ? 'left' : 'right' });

        return 100; // Return next Y position
      };

      // Enhanced summary section on first page
      const addSummarySection = (startY) => {
        const sectionY = startY + 20;

        // Section header
        doc.setFillColor(...colors.light);
        doc.rect(margin, sectionY, pageWidth - margin * 2, 35, 'F');

        doc.setTextColor(...colors.primary);
        doc.setFontSize(16);
        doc.setFont('Vazirmatn-Bold', 'bold');
        doc.text(
          t('financial_summary') || 'Financial Summary',
          isRTL ? pageWidth - margin - 20 : margin + 20,
          sectionY + 25,
          { align: isRTL ? 'right' : 'left' }
        );

        // Calculate totals with error handling
        const totals = {
          totalUsd:
            activities?.reduce((s, b) => s + (Number(b.totals?.usd) || 0), 0) ||
            0,
          totalIqd:
            activities?.reduce((s, b) => s + (Number(b.totals?.iqd) || 0), 0) ||
            0,
          outstandingUsd:
            activities?.reduce(
              (s, b) => s + (Number(b.outstanding?.usd) || 0),
              0
            ) || 0,
          outstandingIqd:
            activities?.reduce(
              (s, b) => s + (Number(b.outstanding?.iqd) || 0),
              0
            ) || 0
        };

        // Summary cards layout
        const cardWidth = (pageWidth - margin * 2 - 15) / 2;
        const cardHeight = 70;
        let cardY = sectionY + 50;

        const summaryCards = [
          {
            label: t('total_usd') || 'Total USD',
            value: formatUSD
              ? formatUSD(totals.totalUsd)
              : `${totals.totalUsd.toFixed(2)}`,
            color: colors.primary
          },
          {
            label: t('total_iqd') || 'Total IQD',
            value: formatIQD
              ? formatIQD(totals.totalIqd)
              : `${totals.totalIqd.toLocaleString()} IQD`,
            color: colors.secondary
          },
          {
            label: t('outstanding_usd') || 'Outstanding USD',
            value: formatUSD
              ? formatUSD(totals.outstandingUsd)
              : `${totals.outstandingUsd.toFixed(2)}`,
            color: colors.accent
          },
          {
            label: t('outstanding_iqd') || 'Outstanding IQD',
            value: formatIQD
              ? formatIQD(totals.outstandingIqd)
              : `${totals.outstandingIqd.toLocaleString()} IQD`,
            color: colors.primary
          }
        ];

        summaryCards.forEach((card, index) => {
          const cardX = margin + (index % 2) * (cardWidth + 15);
          if (index % 2 === 0 && index > 0) cardY += cardHeight + 15;

          // Card background
          doc.setFillColor(...colors.white);
          doc.rect(cardX, cardY, cardWidth, cardHeight, 'F');

          // Card border with color accent
          doc.setDrawColor(...card.color);
          doc.setLineWidth(2);
          doc.rect(cardX, cardY, cardWidth, cardHeight, 'S');

          // Color accent bar
          doc.setFillColor(...card.color);
          doc.rect(cardX, cardY, 5, cardHeight, 'F');

          // Label
          doc.setFontSize(11);
          doc.setFont('Vazirmatn-Regular', 'normal');
          doc.setTextColor(...colors.text);
          doc.text(card.label, cardX + 15, cardY + 25, {
            align: isRTL ? 'right' : 'left'
          });

          // Value
          doc.setFontSize(14);
          doc.setFont('Vazirmatn-Bold', 'bold');
          doc.setTextColor(...card.color);
          doc.text(card.value, cardX + 15, cardY + 45, {
            align: isRTL ? 'right' : 'left'
          });
        });

        return cardY + cardHeight + 30;
      };
      const addCustomerInfo = (startY) => {
        const cardHeight = 160;
        const cardY = startY + 20;

        // Card background with rounded corners effect
        doc.setFillColor(...colors.white);
        doc.rect(margin, cardY, pageWidth - margin * 2, cardHeight, 'F');

        // Card border
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(1);
        doc.rect(margin, cardY, pageWidth - margin * 2, cardHeight, 'S');

        // Card header
        doc.setFillColor(...colors.light);
        doc.rect(margin + 1, cardY + 1, pageWidth - margin * 2 - 2, 35, 'F');

        doc.setTextColor(...colors.primary);
        doc.setFontSize(16);
        doc.setFont('Vazirmatn-Bold', 'bold');
        doc.text(
          t('customer_information'),
          isRTL ? pageWidth - margin - 20 : margin + 20,
          cardY + 25,
          { align: isRTL ? 'right' : 'left' }
        );

        // Customer details in two columns
        doc.setFontSize(12);
        doc.setFont('Vazirmatn-Regular', 'normal');
        doc.setTextColor(...colors.text);

        const customerInfo = [
          { label: t('customer_name'), value: customer?.full_name || '-' },
          { label: t('phone'), value: customer?.phone || '-' },
          { label: t('email'), value: customer?.email || '-' },
          { label: t('address'), value: customer?.address || '-' },
          {
            label: t('created_at'),
            value: customer?.created_at
              ? new Date(customer.created_at).toLocaleDateString()
              : '-'
          }
        ];

        const leftColumnX = margin + 20;
        const rightColumnX = pageWidth / 2 + 20;

        customerInfo.forEach((info, index) => {
          const yPos = cardY + 55 + (index % 3) * 25;
          const xPos = index < 3 ? leftColumnX : rightColumnX;

          // Label
          doc.setFont('Vazirmatn-Bold', 'bold');
          doc.setTextColor(...colors.secondary);
          doc.text(`${info.label}:`, xPos, yPos, {
            align: isRTL ? 'right' : 'left'
          });

          // Value
          doc.setFont('Vazirmatn-Regular', 'normal');
          doc.setTextColor(...colors.text);
          doc.text(info.value, xPos + (isRTL ? -10 : 120), yPos, {
            align: isRTL ? 'right' : 'left'
          });
        });

        return cardY + cardHeight + 40;
      };

      // Enhanced table styling
      const createStyledTable = (title, columns, data, startY = 40) => {
        if (!data || data.length === 0) {
          // Add "No data" message with styling
          doc.setFillColor(...colors.light);
          doc.rect(margin, startY, pageWidth - margin * 2, 60, 'F');
          doc.setTextColor(...colors.text);
          doc.setFontSize(14);
          doc.text(
            `${title} - ${t('no_data_available') || 'No data available'}`,
            pageWidth / 2,
            startY + 35,
            { align: 'center' }
          );
          return startY + 80;
        }

        // Section title with decorative line
        doc.setFontSize(18);
        doc.setFont('Vazirmatn-Bold', 'bold');
        doc.setTextColor(...colors.primary);

        const titleY = startY + 20;
        doc.text(title, isRTL ? pageWidth - margin : margin, titleY, {
          align: isRTL ? 'right' : 'left'
        });

        // Decorative line under title
        doc.setDrawColor(...colors.accent);
        doc.setLineWidth(3);
        const lineY = titleY + 5;
        if (isRTL) {
          doc.line(pageWidth - margin - 100, lineY, pageWidth - margin, lineY);
        } else {
          doc.line(margin, lineY, margin + 100, lineY);
        }

        // Prepare table data with better formatting
        const tableColumns = columns.map((col) => ({
          header: col.title || col.header,
          dataKey: col.key || col.dataIndex
        }));

        const tableData = data.map((row) => {
          const rowData = {};
          columns.forEach((col) => {
            const key = col.key || col.dataIndex;
            let value = '-';

            try {
              if (col.render && typeof col.render === 'function') {
                value = col.render(row[col.dataIndex], row);
              } else if (Array.isArray(col.dataIndex)) {
                value = row[col.dataIndex[0]]?.[col.dataIndex[1]] ?? '-';
              } else {
                value = row[col.dataIndex] ?? '-';
              }
            } catch (error) {
              console.error('Error processing table data:', error);
              value = '-';
            }

            rowData[key] = String(value);
          });
          return rowData;
        });

        // Create table with enhanced styling
        autoTable(doc, {
          startY: titleY + 20,
          head: [tableColumns.map((c) => c.header)],
          body: tableData.map((row) => tableColumns.map((c) => row[c.dataKey])),
          styles: {
            font: 'Vazirmatn-Regular',
            fontStyle: 'normal',
            fontSize: 9,
            cellPadding: { top: 8, bottom: 8, left: 6, right: 6 },
            overflow: 'linebreak',
            halign: isRTL ? 'right' : 'left',
            valign: 'middle',
            textColor: colors.text,
            lineColor: colors.border,
            lineWidth: 0.5
          },
          headStyles: {
            fillColor: colors.primary,
            textColor: colors.white,
            font: 'Vazirmatn-Bold',
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: colors.light
          },
          columnStyles: {
            0: { cellWidth: 'auto', minCellWidth: 50 }
          },
          theme: 'striped',
          tableWidth: 'auto',
          margin: { left: margin, right: margin },
          showHead: 'everyPage'
        });

        return doc.lastAutoTable.finalY + 30;
      };

      // Generate PDF content
      let currentY = addPageHeader(
        `${t('customer_transactions')} - ${customer?.full_name || t('unknown_customer') || 'Unknown Customer'}`,
        t('detailed_report') || 'Detailed Report'
      );

      currentY = addCustomerInfo(currentY);
      currentY = addSummarySection(currentY);

      const sections = [
        {
          title:
            t('imports_and_transportation') || 'Imports and Transportation',
          columns: importTransportationColumns,
          data:
            activities?.flatMap((b) =>
              (b.importsList || []).map((item) => ({
                ...item,
                batchId: b.batchId,
                batchName: b.batchName,
                batchType: b.batchType,
                createdAt: b.createdAt
              }))
            ) || []
        },
        {
          title: t('registrations') || 'Registrations',
          columns: registrationColumns,
          data:
            activities?.flatMap((b) =>
              (b.registrationsList || []).map((item) => ({
                ...item,
                batchId: b.batchId,
                batchName: b.batchName,
                batchType: b.batchType,
                createdAt: b.createdAt
              }))
            ) || []
        },
        {
          title: t('transactions') || 'Transactions',
          columns: transactionColumns,
          data:
            activities?.flatMap((b) =>
              (b.transactionsList || []).map((item) => ({
                ...item,
                batchId: b.batchId,
                batchName: b.batchName,
                batchType: b.batchType,
                createdAt: b.createdAt
              }))
            ) || []
        }
      ];

      sections.forEach((section) => {
        if (section.data.length > 0) {
          doc.addPage();
          createStyledTable(section.title, section.columns, section.data);
        }
      });

      const addFooter = () => {
        const footerY = pageHeight - 30;
        doc.setFontSize(8);
        doc.setTextColor(...colors.text);
        doc.setFont('Vazirmatn-Regular', 'normal');

        const footerText = `${t('generated_on') || 'Generated on'}: ${new Date().toLocaleString()} | ${t('page') || 'Page'} ${doc.getCurrentPageInfo().pageNumber}`;
        doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
      };

      // Add footer to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter();
      }

      // Save with better filename
      const fileName = `customer_${customer?.id || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      // Success feedback
      console.log('PDF generated successfully:', fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);

      // Fallback: create simple PDF
      try {
        const fallbackDoc = new jsPDF();
        fallbackDoc.setFont('helvetica');
        fallbackDoc.text(
          'Error generating detailed PDF. Please try again.',
          20,
          20
        );
        fallbackDoc.text(`Error: ${error.message}`, 20, 40);
        fallbackDoc.save('error_report.pdf');
      } catch (fallbackError) {
        console.error('Fallback PDF generation also failed:', fallbackError);
      }
    }
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
