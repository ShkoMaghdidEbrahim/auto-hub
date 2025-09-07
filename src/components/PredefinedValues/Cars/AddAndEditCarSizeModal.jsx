import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Typography,
  Table,
  Popconfirm
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import {
  addSize,
  updateSize,
  deleteSize,
  getSizesEnum
} from '../../../database/APIs/CarsApi.js';
import { DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const AddAndEditCarSizeModal = ({ open, onClose, size, onDone }) => {
  const { t } = useTranslation();
  const [carSizes, setCarSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSizesEnum()
      .then((sizes) => {
        setCarSizes(sizes);
      })
      .catch((error) => {
        message.error(t('error_fetching_vehicle_sizes'));
        console.error('Error fetching vehicle sizes:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  });

  const onFinish = (values) => {
    setLoading(true);

    if (size) {
      updateSize(size.id, values)
        .then(() => {
          message.success(t('vehicle_size_updated_successfully'));
          onClose();
          onDone();
        })
        .catch((error) => {
          message.error(t('error_updating_vehicle_size'));
          console.error('Error updating vehicle size:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      addSize(values)
        .then(() => {
          message.success(t('vehicle_size_created_successfully'));
          onDone();
        })
        .catch((error) => {
          message.error(t('error_creating_vehicle_size'));
          console.error('Error adding vehicle size:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: t('vehicle_size_name'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title={t('are_you_sure_delete')}
          onConfirm={async () => {
            deleteSize(record.id)
              .then(() => {
                message.success(t('vehicle_size_deleted_successfully'));
                onDone();
              })
              .catch((error) => {
                message.error(t('error_deleting_vehicle_size'));
                console.error('Error deleting vehicle size:', error);
              });
          }}
          okText={t('yes')}
          cancelText={t('no')}
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ];

  return (
    <Modal
      title={size ? t('update_vehicle_size') : t('create_vehicle_size')}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden={true}
      width={800}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={carSizes}
            rowKey="id"
            className={'ant-table'}
            pagination={false}
            scroll={{ y: 300 }}
          />
        </Col>

        <Col span={24}>
          <Divider />
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
            {t('add_new_vehicle_size')}
          </Text>
          <Form
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              ...size
            }}
          >
            <Row gutter={[10, 10]}>
              <Col span={24}>
                <Space
                  style={{
                    width: '100%'
                  }}
                  direction="vertical"
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 16,
                      marginBottom: 5
                    }}
                  ></Text>
                  <Form.Item
                    style={{ margin: 0 }}
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: t('vehicle_size_name_required')
                      }
                    ]}
                  >
                    <Input
                      styles={{
                        width: '100%'
                      }}
                      type="text"
                      placeholder={t('vehicle_size_name')}
                    />
                  </Form.Item>
                </Space>
              </Col>

              <Col
                span={24}
                style={{
                  marginTop: 16
                }}
              >
                <Row gutter={[10, 10]}>
                  <Col span={8}>
                    <Button
                      onClick={() => {
                        onClose();
                      }}
                      loading={loading}
                      disabled={loading}
                      type="default"
                      block
                    >
                      {t('cancel')}
                    </Button>
                  </Col>

                  <Col span={16}>
                    <Button
                      loading={loading}
                      disabled={loading}
                      type="primary"
                      htmlType="submit"
                      block
                    >
                      {t('create_vehicle_size')}
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

export default AddAndEditCarSizeModal;
