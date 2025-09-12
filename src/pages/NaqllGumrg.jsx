import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Button,
  Divider,
  Row,
  Col,
  Table,
  Popconfirm,
  Space,
  Input,
  Select,
  DatePicker,
  message
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ClearOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import pdfFontManager, {
  getCurrentLanguage,
  isRTLLanguage
} from '../helpers/pdfFonts';
import AddAndUpdateNaqllGumrgDrawer from '../components/NaqllGumrg/AddAndUpdateNaqllGumrgDrawer';
import {
  getImportTransportationRecords,
  deleteImportTransportationRecord
} from '../database/APIs/NaqllGumrgApi';
import { formatIQD, formatUSD } from '../helpers/formatMoney';
import { supabase } from '../database/supabase';

const NaqllGumrg = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [importTransportationInfo, setImportTransportationInfo] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    customer: null,
    batch: null,
    dateRange: null
  });
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);

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

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = importTransportationInfo;

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (typeof item.vin_number === 'string' &&
            item.vin_number.toLowerCase().includes(searchLower)) ||
          (typeof item.customer?.full_name === 'string' && // Fixed: customer instead of customers
            item.customer.full_name.toLowerCase().includes(searchLower)) ||
          (typeof item.batch?.name === 'string' &&
            item.batch.name.toLowerCase().includes(searchLower)) ||
          (typeof item.car_name === 'string' &&
            item.car_name.toLowerCase().includes(searchLower)) ||
          (typeof item.car_model === 'string' &&
            item.car_model.toString().toLowerCase().includes(searchLower)) ||
          (typeof item.car_color === 'string' &&
            item.car_color.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters
    if (filters.customer) {
      filtered = filtered.filter(
        (item) => item.customer?.id === filters.customer // Fixed: customer instead of customers
      );
    }
    if (filters.batch) {
      filtered = filtered.filter((item) => item.batch?.id === filters.batch);
    }
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return filtered;
  }, [importTransportationInfo, searchTerm, filters]);

  // Get unique values for filter options
  const uniqueCustomers = useMemo(() => {
    const customers = importTransportationInfo
      .map((item) => item.customer) // Fixed: customer instead of customers
      .filter((customer) => customer)
      .reduce((acc, customer) => {
        if (!acc.find((c) => c.id === customer.id)) {
          acc.push(customer);
        }
        return acc;
      }, []);
    return customers;
  }, [importTransportationInfo]);

  const uniqueBatches = useMemo(() => {
    // If no customer is selected, return empty array
    if (!filters.customer) {
      return [];
    }

    const batches = importTransportationInfo
      .filter((item) => item.customer?.id === filters.customer) // Filter by selected customer
      .map((item) => item.batch)
      .filter((batch) => batch)
      .reduce((acc, batch) => {
        if (!acc.find((b) => b.id === batch.id)) {
          acc.push(batch);
        }
        return acc;
      }, []);
    return batches;
  }, [importTransportationInfo, filters.customer]);

  // Search customers function
  const searchCustomers = async (searchValue) => {
    if (!searchValue || searchValue.length < 2) {
      setCustomerSearchResults([]);
      return;
    }

    setCustomerSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, phone, email')
        .or(
          `full_name.ilike.%${searchValue}%,phone.ilike.%${searchValue}%,email.ilike.%${searchValue}%`
        )
        .eq('is_deleted', false)
        .limit(20);

      if (error) {
        console.error('Error searching customers:', error);
        return;
      }

      setCustomerSearchResults(data || []);
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setCustomerSearchLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      customer: null,
      batch: null,
      dateRange: null
    });
    setCustomerSearchResults([]);
  };

  // Export to PDF function
  const exportToPDF = async () => {
    const currentLanguage = getCurrentLanguage();
    const isRTL = isRTLLanguage(currentLanguage);

    // Create document with font support
    const { doc, font, boldFont } = await pdfFontManager.createDocument(
      'l',
      'mm',
      'a3',
      currentLanguage
    );
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFont(boldFont, 'bold');
    doc.setFontSize(20);
    doc.setTextColor('#1890ff');

    doc.text(t('import_transportation_report'), pageWidth / 2, yPosition, {
      align: 'center'
    });
    yPosition += 15;

    // Export date
    doc.setFont(font);
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    const exportDate = new Date().toLocaleDateString();
    const dateAlign = isRTL ? 'left' : 'right';
    const dateX = isRTL ? 20 : pageWidth - 20;
    doc.text(`${t('export_date')}: ${exportDate}`, dateX, yPosition, {
      align: dateAlign
    });
    yPosition += 10;

    // Check if any filters are applied
    const hasFilters =
      searchTerm || filters.customer || filters.batch || filters.dateRange;

    if (hasFilters) {
      // Applied filters section
      doc.setFont(boldFont);
      doc.setFontSize(12);
      doc.setTextColor('#000');
      const filterX = isRTL ? pageWidth - 20 : 20;
      doc.text(t('applied_filters'), filterX, yPosition, {
        align: isRTL ? 'right' : 'left'
      });
      yPosition += 8;

      doc.setFont(font);
      doc.setFontSize(10);
      doc.setTextColor('#666666');

      if (searchTerm) {
        doc.text(`${t('search')}: ${searchTerm}`, filterX, yPosition, {
          align: isRTL ? 'right' : 'left'
        });
        yPosition += 5;
      }

      if (filters.customer) {
        const customer = uniqueCustomers.find((c) => c.id === filters.customer);
        doc.text(
          `${t('customer_name')}: ${customer?.full_name || ''}`,
          filterX,
          yPosition,
          {
            align: isRTL ? 'right' : 'left'
          }
        );
        yPosition += 5;
      }

      if (filters.batch) {
        const batch = uniqueBatches.find((b) => b.id === filters.batch);
        doc.text(
          `${t('batch_name')}: ${batch?.name || ''}`,
          filterX,
          yPosition,
          {
            align: isRTL ? 'right' : 'left'
          }
        );
        yPosition += 5;
      }

      if (filters.dateRange && filters.dateRange.length === 2) {
        const startDate = dayjs(filters.dateRange[0]).format('DD/MM/YYYY');
        const endDate = dayjs(filters.dateRange[1]).format('DD/MM/YYYY');
        doc.text(
          `${t('date_range')}: ${startDate} - ${endDate}`,
          filterX,
          yPosition,
          {
            align: isRTL ? 'right' : 'left'
          }
        );
        yPosition += 5;
      }

      yPosition += 10;
    }

    // Data to export
    const dataToExport = hasFilters ? filteredData : importTransportationInfo;

    // Prepare table data
    const tableData = dataToExport.map((item) => [
      item.vin_number || '',
      item.customer?.full_name || t('no_customer'), // Fixed: customer instead of customers
      item.batch?.name || t('no_batch'),
      item.car_name || '',
      item.car_model || '',
      item.car_color || '',
      formatIQD(item.import_fee),
      formatIQD(item.import_system_fee),
      formatUSD(item.car_coc_fee),
      formatUSD(item.transportation_fee),
      formatUSD(item.total_usd),
      formatIQD(item.total_iqd),
      formatUSD(item.paid_amount_usd),
      formatIQD(item.paid_amount_iqd),
      new Date(item.created_at).toLocaleDateString()
    ]);

    // Table headers
    const headers = [
      t('vin_number'),
      t('customer_name'),
      t('batch_name'),
      t('car_name'),
      t('car_model'),
      t('car_color'),
      t('import_fee'),
      t('import_system_fee'),
      t('car_coc_fee'),
      t('transportation_fee'),
      t('total_usd'),
      t('total_iqd'),
      t('paid_amount_usd'),
      t('paid_amount_iqd'),
      t('created_at')
    ];

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: isRTL ? 'right' : 'left',
        font: font
      },
      headStyles: {
        fillColor: '#1890ff',
        textColor: '#fff',
        fontStyle: 'bold',
        fontSize: 8,
        font: boldFont,
        halign: isRTL ? 'right' : 'left'
      },
      alternateRowStyles: {
        fillColor: '#f5f5f5',
        font: font
      },
      margin: { left: 20, right: 20 }
    });

    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${t('import_transportation_report')}_${currentDate}.pdf`;

    // Save the PDF
    doc.save(filename);
  };

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
      dataIndex: 'customer', // Fixed: customer instead of customers
      key: 'full_name',
      width: 120,
      render: (customer) => customer?.full_name || t('no_customer')
    },
    {
      title: t('batch_name'),
      dataIndex: 'batch',
      key: 'batch',
      width: 120,
      render: (batch) => batch?.name || t('no_batch')
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
            {/* Search and Filter Section */}
            <Card
              size="small"
              style={{
                marginBottom: 16,
                borderRadius: 8
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6} lg={5}>
                  <Input
                    placeholder={t('search')}
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={5}>
                  <Select
                    placeholder={t('customer_name')}
                    value={filters.customer}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        customer: value,
                        batch: null // Clear batch filter when customer changes
                      }))
                    }
                    allowClear
                    showSearch
                    loading={customerSearchLoading}
                    onSearch={searchCustomers}
                    filterOption={false}
                    notFoundContent={
                      customerSearchLoading ? 'جاري البحث...' : 'لا توجد نتائج'
                    }
                    style={{ width: '100%' }}
                    optionLabelProp="label"
                  >
                    {(customerSearchResults.length > 0
                      ? customerSearchResults
                      : uniqueCustomers.slice(0, 10)
                    ).map((customer) => (
                      <Select.Option
                        key={customer.id}
                        value={customer.id}
                        label={customer.full_name}
                      >
                        <div>
                          <div>{customer.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {customer.phone}{' '}
                            {customer.email && `• ${customer.email}`}
                          </div>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6} lg={5}>
                  <Select
                    placeholder={
                      filters.customer
                        ? t('batch_name')
                        : `${t('batch_name')} (${t('customer_name')})`
                    }
                    value={filters.batch}
                    onChange={(value) =>
                      setFilters((prev) => ({ ...prev, batch: value }))
                    }
                    allowClear
                    showSearch
                    disabled={!filters.customer}
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ width: '100%' }}
                  >
                    {uniqueBatches.slice(0, 10).map((batch) => (
                      <Select.Option key={batch.id} value={batch.id}>
                        {batch.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6} lg={5}>
                  <DatePicker.RangePicker
                    placeholder={[t('start_date'), t('end_date')]}
                    value={filters.dateRange}
                    onChange={(dates) =>
                      setFilters((prev) => ({ ...prev, dateRange: dates }))
                    }
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                  <Row justify="end" gutter={[8, 8]}>
                    <Col>
                      <Button
                        type="default"
                        icon={<ClearOutlined />}
                        onClick={clearFilters}
                        size="middle"
                      >
                        {t('clear_filters')}
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        onClick={exportToPDF}
                        size="middle"
                      >
                        {t('export_pdf')}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Table
              loading={loading}
              columns={importTransportationColumns}
              dataSource={filteredData}
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
