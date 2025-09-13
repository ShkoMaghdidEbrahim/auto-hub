import { Card, Col, Form, InputNumber, Modal, Row, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';

const RepaymentModal = ({ open, onClose, batches }) => {
  const { t } = useTranslation();

  const [selectedBatch, setSelectedBatch] = useState(null);
  const selectedBatchObj =
    batches?.find((b) => b.batchId === selectedBatch) || {};

  const [selectedRecord, setSelectedRecord] = useState(null);

  const [recordDetails, setRecordDetails] = useState([]);
  const selectedRecordObj =
    recordDetails?.find((r) => r.id === selectedRecord) || null;

  const onFinish = (values) => {
    console.log(values);
  };

  const getRecordOptions = () => {
    const records = [
      ...(selectedBatchObj?.importsList || []),
      ...(selectedBatchObj?.registrationsList || [])
    ];
    return records.map((record) => ({
      label: `${record?.car_name} ${record?.car_model}`,
      value: record?.id
    }));
  };

  useEffect(() => {
    const records = [
      ...(selectedBatchObj?.importsList || []),
      ...(selectedBatchObj?.registrationsList || [])
    ];
    setRecordDetails(records);
  }, [selectedBatch]);

  console.log(recordDetails?.find((r) => r.id === selectedRecord));

  return (
    <Modal
      title={t('repayment')}
      open={open}
      onCancel={onClose}
      footer={null}
      width={window.innerWidth > 768 ? '50%' : 800}
    >
      <Form layout="vertical" onFinish={onFinish}>
        <Row gutter={[10, 10]}>
          <Col xs={24} md={12}>
            <Form.Item
              style={{ margin: 0 }}
              label={t('batch')}
              name="batch_id"
              rules={[
                {
                  required: true,
                  message: t('batch_name_required')
                }
              ]}
            >
              <Select
                showSearch
                placeholder={t('select_batch')}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                onChange={(value) => {
                  setSelectedBatch(value);
                }}
                options={batches.map((batch) => ({
                  label: `${batch.batchName} (${t(batch.batchType)})`,
                  value: batch.batchId,
                  disabled:
                    (batch.outstanding?.usd || 0) <= 0 &&
                    (batch.outstanding?.iqd || 0) <= 0
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              style={{ margin: 0 }}
              label={t('batch')}
              name="context_id"
              rules={[
                {
                  required: true,
                  message: t('batch_name_required')
                }
              ]}
            >
              <Select
                showSearch
                placeholder={t('select_batch')}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                onChange={(value) => {
                  setSelectedRecord(value);
                }}
                options={getRecordOptions()}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Card bordered={false}>
              {selectedRecord ? (
                <div>
                  {selectedRecordObj ? (
                    <Row gutter={[16, 8]}>
                      <Col xs={24} md={12}>
                        <div className="detail-item">
                          <strong>{t('car_name')}:</strong>{' '}
                          {selectedRecordObj?.car_name}
                        </div>
                      </Col>

                      <Col xs={24} md={12}>
                        <div className="detail-item">
                          <strong>{t('car_model')}:</strong>{' '}
                          {selectedRecordObj?.car_model}
                        </div>
                      </Col>

                      {selectedRecordObj?.total_usd && (
                        <Col xs={24} md={12}>
                          <div className="detail-item">
                            <strong>{t('total_usd')}:</strong>{' '}
                            <span
                              style={{ color: '#52c41a', fontWeight: 'bold' }}
                            >
                              {selectedRecordObj?.total_usd.toLocaleString()}{' '}
                              USD
                            </span>
                          </div>
                        </Col>
                      )}

                      {selectedRecordObj?.total_iqd && (
                        <Col xs={24} md={12}>
                          <div className="detail-item">
                            <strong>{t('total_iqd')}:</strong>{' '}
                            <span
                              style={{ color: '#52c41a', fontWeight: 'bold' }}
                            >
                              {selectedRecordObj?.total_iqd.toLocaleString()}{' '}
                              IQD
                            </span>
                          </div>
                        </Col>
                      )}
                    </Row>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <p style={{ color: '#ff4d4f' }}>
                        {t('no_details_available')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <p style={{ color: '#8c8c8c' }}>
                    {t('please_select_batch_and_record')}
                  </p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default RepaymentModal;
