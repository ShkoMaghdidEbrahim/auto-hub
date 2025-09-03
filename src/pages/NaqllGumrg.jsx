import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Form,
  DatePicker,
  Table,
  Modal,
  Row,
  Col,
  Typography,
  Space,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  UserAddOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Title, Text } = Typography;

const NaqllGumrg = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Sample data for the table
  const [tableData, setTableData] = useState([
    {
      key: 1,
      id: 1002,
      contactName: 'عومەر',
      phoneNumber: '842684',
      date: '2024-06-01',
      address: 'هەولێر',
      cars: [
        {
          carName: 'تویۆتا',
          model: '2020',
          chassisNumber: 'ABC123456789',
          color: 'سپی',
          customs: '1500000 دینار',
          customsFee: '50000 دینار',
          cocClearance: '2000 دۆلار',
          transport: '1000 دۆلار',
          receivedUSD: '3000 دۆلار',
          receivedIQD: '4500000 دینار',
          expenses: '200000 دینار',
          date: '2024-06-01',
          notes: 'هیچ تێبینێک نییە.'
        }
      ]
    }
  ]);

  const handleSubmit = (values) => {
    console.log('Form values:', values);
    message.success(t('transport_customs_data_added_successfully'));
    form.resetFields();
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailsModal(true);
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'key',
      key: 'index',
      width: 50,
      align: 'center',
    },
    {
      title: t('record_number'),
      dataIndex: 'id',
      key: 'id',
      align: 'center',
    },
    {
      title: t('contact_person_name'),
      dataIndex: 'contactName',
      key: 'contactName',
      align: 'center',
    },
    {
      title: t('mobile_number'),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      align: 'center',
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      align: 'center',
    },
    {
      title: t('details'),
      key: 'details',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="primary" 
          ghost 
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  const carDetailsColumns = [
    {
      title: t('car_name'),
      dataIndex: 'carName',
      key: 'carName',
      align: 'center',
    },
    {
      title: t('model'),
      dataIndex: 'model',
      key: 'model',
      align: 'center',
    },
    {
      title: t('chassis_number'),
      dataIndex: 'chassisNumber',
      key: 'chassisNumber',
      align: 'center',
    },
    {
      title: t('color'),
      dataIndex: 'color',
      key: 'color',
      align: 'center',
    },
    {
      title: t('customs'),
      dataIndex: 'customs',
      key: 'customs',
      align: 'center',
    },
    {
      title: t('customs_fee'),
      dataIndex: 'customsFee',
      key: 'customsFee',
      align: 'center',
    },
    {
      title: t('coc_clearance'),
      dataIndex: 'cocClearance',
      key: 'cocClearance',
      align: 'center',
    },
    {
      title: t('transport'),
      dataIndex: 'transport',
      key: 'transport',
      align: 'center',
    },
    {
      title: t('received_usd'),
      dataIndex: 'receivedUSD',
      key: 'receivedUSD',
      align: 'center',
    },
    {
      title: t('received_iqd'),
      dataIndex: 'receivedIQD',
      key: 'receivedIQD',
      align: 'center',
    },
    {
      title: t('expenses'),
      dataIndex: 'expenses',
      key: 'expenses',
      align: 'center',
    },
    {
      title: t('date'),
      dataIndex: 'date',
      key: 'date',
      align: 'center',
    },
    {
      title: t('notes'),
      dataIndex: 'notes',
      key: 'notes',
      align: 'center',
    },
  ];

  return (
    <div style={{ padding: '24px'}}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>{t('naqll_gumrg')}</Title>
        <Text type="secondary">{t('dashboard')} / {t('naqll_gumrg')}</Text>
      </div>

      {/* Form Section */}
      <Card 
        title={t('entry_form')} 
        style={{ marginBottom: '24px' }}
        extra={
          <Text type="secondary">
            {t('entry_form_description')}
          </Text>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          {/* Contact Person Section */}
          <Row gutter={16} justify="center" style={{ marginBottom: '24px' }}>
            <Col span={6}>
              <Form.Item name="contactName">
                <Input 
                  placeholder={t('contact_person_name')} 
                  style={{ textAlign: 'center' }}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Button 
                type="primary" 
                ghost 
                icon={<UserAddOutlined />}
                style={{ width: '100%' }}
              >
                {t('add')}
              </Button>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label={t('car_name')} name="carName">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('model')} name="carModel">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('chassis_number')} name="carNumber">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('color')} name="carColor">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label={t('customs')} name="gumrg">
                <Input placeholder={t('dinar_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('customs_fee')} name="rasmGumrg">
                <Input placeholder={t('dinar_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('coc_clearance')} name="coc">
                <Input placeholder={t('dollar_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('transport')} name="naql">
                <Input placeholder={t('dollar_placeholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label={t('received_usd')} name="waslUSD">
                <Input placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('received_iqd')} name="waslIQD">
                <Input placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('expenses')} name="expend">
                <Input placeholder={t('dinar_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t('date')} name="dateReg">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={t('notes')} name="notes">
                <TextArea 
                  placeholder={t('notes_placeholder')} 
                  rows={4}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="center">
            <Col>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  size="large"
                  style={{ minWidth: '120px' }}
                >
                  {t('submit')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Table Section */}
      <Card title={t('transport_customs_list')}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              t('pagination_total', { start: range[0], end: range[1], total })
          }}
          bordered
          size="middle"
        />
      </Card>

      {/* Details Modal */}
      <Modal
        title={t('details')}
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        {selectedRecord && (
          <div>
            <Row gutter={16} style={{ marginBottom: '24px', textAlign: 'center' }}>
              <Col span={6}>
                <Text strong>{t('contact_person_name')}: </Text>
                <Text>{selectedRecord.contactName}</Text>
              </Col>
              <Col span={6}>
                <Text strong>{t('record_number')}: </Text>
                <Text>{selectedRecord.id}</Text>
              </Col>
              <Col span={6}>
                <Text strong>{t('mobile_number')}: </Text>
                <Text>{selectedRecord.phoneNumber}</Text>
              </Col>
              <Col span={6}>
                <Text strong>{t('address')}: </Text>
                <Text>{selectedRecord.address}</Text>
              </Col>
            </Row>

            <Title level={4} style={{ marginBottom: '16px' }}>
              {t('transport_customs_list')}
            </Title>

            <Table
              columns={carDetailsColumns}
              dataSource={selectedRecord.cars}
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 1500 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NaqllGumrg;