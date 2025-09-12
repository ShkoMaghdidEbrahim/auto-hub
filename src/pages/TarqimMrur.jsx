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
  DatePicker
} from 'antd';
import dayjs from 'dayjs';
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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    customer: null,
    batch: null,
    vehicleSize: null,
    dateRange: null
  });

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

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = registrationInfo;

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (typeof item.vin_number === 'string' &&
            item.vin_number.toLowerCase().includes(searchLower)) ||
          (typeof item.customer?.full_name === 'string' &&
            item.customer.full_name.toLowerCase().includes(searchLower)) ||
          (typeof item.batch?.name === 'string' &&
            item.batch.name.toLowerCase().includes(searchLower)) ||
          (typeof item.car_name === 'string' &&
            item.car_name.toLowerCase().includes(searchLower)) ||
          (typeof item.car_model === 'string' &&
            item.car_model.toLowerCase().includes(searchLower)) ||
          (typeof item.vehicle_size_type?.name === 'string' &&
            item.vehicle_size_type.name.toLowerCase().includes(searchLower)) ||
          (typeof item.temporary_plate_number === 'string' &&
            item.temporary_plate_number.toLowerCase().includes(searchLower)) ||
          (typeof item.car_color === 'string' &&
            item.car_color.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters
    if (filters.customer) {
      filtered = filtered.filter(
        (item) => item.customer?.id === filters.customer
      );
    }
    if (filters.batch) {
      filtered = filtered.filter((item) => item.batch?.id === filters.batch);
    }
    if (filters.vehicleSize) {
      filtered = filtered.filter(
        (item) => item.vehicle_size_type?.id === filters.vehicleSize
      );
    }
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return filtered;
  }, [registrationInfo, searchTerm, filters]);

  // Get unique values for filter options
  const uniqueCustomers = useMemo(() => {
    const customers = registrationInfo
      .map((item) => item.customer)
      .filter((customer) => customer)
      .reduce((acc, customer) => {
        if (!acc.find((c) => c.id === customer.id)) {
          acc.push(customer);
        }
        return acc;
      }, []);
    return customers;
  }, [registrationInfo]);

  const uniqueBatches = useMemo(() => {
    // If no customer is selected, return empty array
    if (!filters.customer) {
      return [];
    }

    const batches = registrationInfo
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
  }, [registrationInfo, filters.customer]);

  const uniqueVehicleSizes = useMemo(() => {
    const sizes = registrationInfo
      .map((item) => item.vehicle_size_type)
      .filter((size) => size)
      .reduce((acc, size) => {
        if (!acc.find((s) => s.id === size.id)) {
          acc.push(size);
        }
        return acc;
      }, []);
    return sizes;
  }, [registrationInfo]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      customer: null,
      batch: null,
      vehicleSize: null,
      dateRange: null
    });
  };

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a3'); // A3 landscape for wider table display
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const primaryColor = '#1890ff';
    const lightGray = '#f5f5f5';
    const darkGray = '#666666';

    let yPosition = 20;

    // Add logo (if available)
    try {
      const logoImg = new Image();
      logoImg.src = '/logo.png';
      doc.addImage(logoImg, 'PNG', 20, 10, 30, 20);
    } catch (error) {
      console.log('Logo not found, continuing without logo');
    }

    // Title
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.text(t('vehicle_registration_report'), pageWidth / 2, yPosition, {
      align: 'center'
    });
    yPosition += 15;

    // Export date
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    const exportDate = new Date().toLocaleDateString();
    doc.text(`${t('export_date')}: ${exportDate}`, pageWidth - 20, yPosition, {
      align: 'right'
    });
    yPosition += 10;

    // Check if any filters are applied
    const hasFilters =
      searchTerm ||
      filters.customer ||
      filters.batch ||
      filters.vehicleSize ||
      filters.dateRange;

    if (hasFilters) {
      // Applied filters section
      doc.setFontSize(12);
      doc.setTextColor('#000');
      doc.text(t('applied_filters'), 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(darkGray);

      if (searchTerm) {
        doc.text(`${t('search')}: ${searchTerm}`, 20, yPosition);
        yPosition += 5;
      }

      if (filters.customer) {
        const customer = uniqueCustomers.find((c) => c.id === filters.customer);
        doc.text(
          `${t('customer_name')}: ${customer?.full_name || ''}`,
          20,
          yPosition
        );
        yPosition += 5;
      }

      if (filters.batch) {
        const batch = uniqueBatches.find((b) => b.id === filters.batch);
        doc.text(`${t('batch_name')}: ${batch?.name || ''}`, 20, yPosition);
        yPosition += 5;
      }

      if (filters.vehicleSize) {
        const size = uniqueVehicleSizes.find(
          (s) => s.id === filters.vehicleSize
        );
        doc.text(`${t('vehicle_size')}: ${size?.name || ''}`, 20, yPosition);
        yPosition += 5;
      }

      if (filters.dateRange && filters.dateRange.length === 2) {
        const startDate = dayjs(filters.dateRange[0]).format('DD/MM/YYYY');
        const endDate = dayjs(filters.dateRange[1]).format('DD/MM/YYYY');
        doc.text(
          `${t('date_range')}: ${startDate} - ${endDate}`,
          20,
          yPosition
        );
        yPosition += 5;
      }

      yPosition += 10;
    }

    // Data to export (use filtered data if filters applied, otherwise all data)
    const dataToExport = hasFilters ? filteredData : registrationInfo;

    // Prepare table data
    const tableData = dataToExport.map((item) => [
      item.vin_number || '',
      item.customer?.full_name || t('no_customer'),
      item.batch?.name || t('no_batch'),
      item.car_name || '',
      item.car_model || '',
      item.vehicle_size_type?.name || t('no_size'),
      item.number_of_cylinders || '',
      item.car_color || '',
      item.temporary_plate_number || '',
      formatIQD(item.size_fee),
      formatIQD(item.plate_number_cost),
      formatIQD(item.legal_cost),
      formatIQD(item.inspection_cost),
      formatIQD(item.electronic_contract_cost),
      formatIQD(item.window_check_cost),
      formatIQD(item.expenses),
      formatIQD(item.labor_fees),
      formatIQD(item.total),
      new Date(item.created_at).toLocaleDateString()
    ]);

    // Table headers
    const headers = [
      t('vin_number'),
      t('customer_name'),
      t('batch_name'),
      t('car_name'),
      t('car_model'),
      t('vehicle_size'),
      t('number_of_cylinders'),
      t('car_color'),
      t('plate_number'),
      t('size_fee'),
      t('plate_number_cost'),
      t('legal_cost'),
      t('inspection_cost'),
      t('electronic_contract_cost'),
      t('window_check_cost'),
      t('expenses'),
      t('labor_fees'),
      t('total')
    ];

    // Debug: Log column count
    console.log('PDF Export - Headers count:', headers.length);
    console.log('PDF Export - Sample data columns:', tableData[0]?.length || 0);

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: '#fff',
        fontStyle: 'bold',
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
      showHead: 'everyPage',
      columnStyles: {
        0: { cellWidth: 25 }, // VIN
        1: { cellWidth: 30 }, // Customer
        2: { cellWidth: 25 }, // Batch
        3: { cellWidth: 25 }, // Car name
        4: { cellWidth: 20 }, // Model
        5: { cellWidth: 25 }, // Size
        6: { cellWidth: 20 }, // Cylinders
        7: { cellWidth: 20 }, // Color
        8: { cellWidth: 25 }, // Plate
        9: { cellWidth: 20 }, // Size fee
        10: { cellWidth: 20 }, // Plate cost
        11: { cellWidth: 20 }, // Legal cost
        12: { cellWidth: 20 }, // Inspection cost
        13: { cellWidth: 20 }, // Electronic cost
        14: { cellWidth: 20 }, // Window cost
        15: { cellWidth: 20 }, // Expenses
        16: { cellWidth: 20 }, // Labor fees
        17: { cellWidth: 20 }, // Total
        18: { cellWidth: 25 } // Created at
      }
    });

    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${t('vehicle_registration_report')}_${currentDate}.pdf`;

    // Save the PDF
    doc.save(filename);
  };

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
                  {t('tarqim_mrur')}
                </Divider>
              </Col>
              <Col span={6}>
                <Button
                  block
                  type="primary"
                  onClick={() =>
                    setAddAndUpdateVehicleRegistrationModal({
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
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Input
                    placeholder={t('search')}
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
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
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ width: '100%' }}
                    dropdownMatchSelectWidth={false}
                    maxTagCount={1}
                    listHeight={400}
                  >
                    {uniqueCustomers.slice(0, 10).map((customer) => (
                      <Select.Option key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
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
                    dropdownMatchSelectWidth={false}
                    maxTagCount={1}
                    listHeight={400}
                  >
                    {uniqueBatches.slice(0, 10).map((batch) => (
                      <Select.Option key={batch.id} value={batch.id}>
                        {batch.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Select
                    placeholder={t('vehicle_size')}
                    value={filters.vehicleSize}
                    onChange={(value) =>
                      setFilters((prev) => ({ ...prev, vehicleSize: value }))
                    }
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {uniqueVehicleSizes.map((size) => (
                      <Select.Option key={size.id} value={size.id}>
                        {size.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <DatePicker.RangePicker
                    placeholder={[t('start_date'), t('end_date')]}
                    value={filters.dateRange}
                    onChange={(dates) =>
                      setFilters((prev) => ({ ...prev, dateRange: dates }))
                    }
                    style={{ width: '100%' }}
                  />
                </Col>

                <Col span={6} offset={0} style={{ textAlign: 'right' }}>
                  <Button
                    type="default"
                    icon={<ClearOutlined />}
                    onClick={clearFilters}
                  >
                    {t('clear_filters')}
                  </Button>
                </Col>
                <Col span={6} offset={6} style={{ textAlign: 'left' }}>
                  <Button
                    type="default"
                    icon={<FilePdfOutlined />}
                    onClick={exportToPDF}
                  >
                    {t('export_pdf')}
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Table
              loading={loading}
              columns={registrationColumns}
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
