// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Statistic, Table, Button, Space, Input,
  Badge, Tag, Skeleton, Progress, Typography
} from 'antd';
import {
  DollarOutlined, CarOutlined, UnorderedListOutlined,
  UserOutlined, SearchOutlined, EyeOutlined,
  CheckCircleOutlined, PlusOutlined, FileExcelOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Search } = Input;

// Modern color palette
const COLORS = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0'];
const STATUS_COLORS = {
  due: '#ff4d4f',
  paid: '#52c41a',
  pending: '#faad14'
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [sizeDistribution, setSizeDistribution] = useState([]);
  const [recentImports, setRecentImports] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, rRes] = await Promise.all([
          fetch('/api/dashboard/summary').then(r => r.ok ? r.json() : Promise.reject('no summary')),
          fetch('/api/dashboard/recent').then(r => r.ok ? r.json() : Promise.reject('no recent'))
        ]);
        setSummary(sRes);
        setTrend(sRes.trend || []);
        setSizeDistribution(sRes.sizeDistribution || []);
        setRecentImports(rRes.recent || []);
        
        // Mock payment status data based on schema
        setPaymentStatus([
          { status: t('paid'), value: 65, color: STATUS_COLORS.paid },
          { status: t('due'), value: 25, color: STATUS_COLORS.due },
          { status: t('pending'), value: 10, color: STATUS_COLORS.pending }
        ]);
      } catch (e) {
        // Fallback mock data if backend not ready
        const mockSummary = {
          total_batches: 12,
          total_customers: 325,
          total_registrations: 240,
          total_iqd: 125000000,
          outstanding_iqd: 4200000,
          paid_iqd: 120800000,
          trend: [
            { month: t('jan'), total_iqd: 800000 },
            { month: t('feb'), total_iqd: 1200000 },
            { month: t('mar'), total_iqd: 600000 },
            { month: t('apr'), total_iqd: 1600000 },
            { month: t('may'), total_iqd: 1100000 },
            { month: t('jun'), total_iqd: 900000 },
            { month: t('jul'), total_iqd: 1500000 }
          ],
          sizeDistribution: [
            { name: t('small'), value: 80 },
            { name: t('medium'), value: 120 },
            { name: t('large'), value: 40 },
            { name: t('suv'), value: 35 },
            { name: t('truck'), value: 25 }
          ]
        };
        const mockRecent = {
          recent: [
            { id: 1, vin_number: 'VIN0001', car_name: 'Toyota Corolla', total_iqd: 35000000, paid_amount_iqd: 20000000, status: 'due', created_at: '2025-09-10' },
            { id: 2, vin_number: 'VIN0002', car_name: 'Hyundai Elantra', total_iqd: 30000000, paid_amount_iqd: 10000000, status: 'due', created_at: '2025-09-08' },
            { id: 3, vin_number: 'VIN0003', car_name: 'Kia Rio', total_iqd: 25000000, paid_amount_iqd: 25000000, status: 'paid', created_at: '2025-09-05' },
            { id: 4, vin_number: 'VIN0004', car_name: 'Ford F-150', total_iqd: 45000000, paid_amount_iqd: 30000000, status: 'pending', created_at: '2025-09-03' },
            { id: 5, vin_number: 'VIN0005', car_name: 'Honda Civic', total_iqd: 28000000, paid_amount_iqd: 28000000, status: 'paid', created_at: '2025-09-01' }
          ]
        };
        setSummary(mockSummary);
        setTrend(mockSummary.trend);
        setSizeDistribution(mockSummary.sizeDistribution);
        setRecentImports(mockRecent.recent);
        
        // Mock payment status data
        setPaymentStatus([
          { status: t('paid'), value: 65, color: STATUS_COLORS.paid },
          { status: t('due'), value: 25, color: STATUS_COLORS.due },
          { status: t('pending'), value: 10, color: STATUS_COLORS.pending }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  const columns = [
    { 
      title: t('vin_number'), 
      dataIndex: 'vin_number', 
      key: 'vin',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: t('car_name'), 
      dataIndex: 'car_name', 
      key: 'car',
      render: (text) => <Text>{text}</Text>
    },
    { 
      title: `${t('total')} (IQD)`, 
      dataIndex: 'total_iqd', 
      key: 'total', 
      render: v => v?.toLocaleString() 
    },
    { 
      title: `${t('paid')} (IQD)`, 
      dataIndex: 'paid_amount_iqd', 
      key: 'paid', 
      render: v => v?.toLocaleString() 
    },
    { 
      title: `${t('due')} (IQD)`, 
      key: 'due', 
      render: (_, row) => ((row.total_iqd - row.paid_amount_iqd) || 0).toLocaleString() 
    },
    { 
      title: t('status'), 
      key: 'status',
      render: (_, row) => {
        const dueAmount = row.total_iqd - row.paid_amount_iqd;
        let status = 'paid';
        let color = STATUS_COLORS.paid;
        
        if (dueAmount > 0 && dueAmount < row.total_iqd) {
          status = 'pending';
          color = STATUS_COLORS.pending;
        } else if (dueAmount >= row.total_iqd) {
          status = 'due';
          color = STATUS_COLORS.due;
        }
        
        return <Badge color={color} text={t(status)} />;
      }
    },
    { 
      title: t('created_at'), 
      dataIndex: 'created_at', 
      key: 'created',
      render: (text) => new Date(text).toLocaleDateString()
    },
    { 
      title: t('actions'), 
      key: 'actions', 
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>{t('view')}</Button>
          {(row.total_iqd - row.paid_amount_iqd) > 0 && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />}>
              {t('mark_paid')}
            </Button>
          )}
        </Space>
      )
    }
  ];

  if (loading || !summary) {
    return (
      <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh', direction: i18n.language === 'ku' ? 'rtl' : 'ltr' }}>
      <Title level={2} style={{ marginBottom: 24, color: '#1a1a1a' }}>
        {t('vehicle_import_dashboard')}
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
            }}
          >
            <Statistic
              title={t('total_batches')}
              value={summary.total_batches}
              prefix={<UnorderedListOutlined style={{ color: COLORS[0] }} />}
              valueStyle={{ color: COLORS[0] }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
            }}
          >
            <Statistic
              title={t('customers')}
              value={summary.total_customers}
              prefix={<UserOutlined style={{ color: COLORS[1] }} />}
              valueStyle={{ color: COLORS[1] }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
            }}
          >
            <Statistic
              title={t('registrations')}
              value={summary.total_registrations}
              prefix={<CarOutlined style={{ color: COLORS[2] }} />}
              valueStyle={{ color: COLORS[2] }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
            }}
          >
            <Statistic
              title={`${t('transactions')} (IQD)`}
              value={summary.total_iqd}
              precision={0}
              prefix={<DollarOutlined style={{ color: COLORS[3] }} />}
              valueStyle={{ color: COLORS[3] }}
              formatter={val => Number(val).toLocaleString()}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">{t('outstanding')}: </Text>
              <Text strong>{Number(summary.outstanding_iqd).toLocaleString()} IQD</Text>
              <Progress 
                percent={Math.round((summary.paid_iqd / summary.total_iqd) * 100)} 
                size="small" 
                status="active"
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title={t('transactions_trend')}
            bordered={false}
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={value => `${value / 1000}k`} />
                <Tooltip 
                  formatter={(value) => Number(value).toLocaleString()} 
                  contentStyle={{ borderRadius: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total_iqd" 
                  stroke={COLORS[0]} 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={6}>
          <Card 
            title={t('vehicle_size_distribution')}
            bordered={false}
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={sizeDistribution} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={60} 
                  outerRadius={80} 
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sizeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} ${t('vehicles')}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={6}>
          <Card 
            title={t('payment_status')}
            bordered={false}
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={80} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Imports and Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} xl={16}>
          <Card 
            title={t('recent_imports')}
            bordered={false}
            style={{ 
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
            extra={
              <Search
                placeholder={t('search_by_vin')}
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
              />
            }
          >
            <Table 
              dataSource={recentImports} 
              columns={columns} 
              rowKey="id" 
              pagination={{ pageSize: 5 }} 
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} xl={8}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card 
                title={t('quick_actions')}
                bordered={false}
                style={{ 
                  borderRadius: 12, 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block type="primary" icon={<PlusOutlined />} size="large">
                    {t('create_batch')}
                  </Button>
                  <Button block icon={<CarOutlined />} size="large">
                    {t('register_vehicle')}
                  </Button>
                  <Button block icon={<UserOutlined />} size="large">
                    {t('add_customer')}
                  </Button>
                  <Button block icon={<FileExcelOutlined />} size="large" danger>
                    {t('export_report')}
                  </Button>
                </Space>
              </Card>
            </Col>
            
            <Col xs={24}>
              <Card 
                title={t('system_status')}
                bordered={false}
                style={{ 
                  borderRadius: 12, 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>{t('database')}</Text>
                    <Badge status="success" text={t('online')} style={{ float: 'right' }} />
                  </div>
                  <div>
                    <Text strong>{t('api_services')}</Text>
                    <Badge status="success" text={t('online')} style={{ float: 'right' }} />
                  </div>
                  <div>
                    <Text strong>{t('storage')}</Text>
                    <Progress percent={75} status="active" size="small" />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;