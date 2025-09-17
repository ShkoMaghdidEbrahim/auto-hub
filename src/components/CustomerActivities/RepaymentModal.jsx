import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Input,
  message
} from 'antd';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { addTransaction } from '../../database/APIs/CustomerActivities';

const RepaymentModal = ({ open, onClose, batches }) => {
  const { t } = useTranslation();

  const [selectedBatch, setSelectedBatch] = useState(null);
  const selectedBatchObj =
    batches?.find((b) => b.batchId === selectedBatch) || {};

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paidAmounts, setPaidAmounts] = useState({ usd: 0, iqd: 0 });

  const [recordDetails, setRecordDetails] = useState([]);
  const selectedRecordObj =
    recordDetails?.find((r) => r.id === selectedRecord) || null;

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const transactionData = {
      batch_id: values.batch_id,
      context_id: selectedRecord,
      amount_usd: values.amount_usd,
      amount_iqd: values.amount_iqd,
      note: values.note
    };

    const result = await addTransaction(transactionData);
    if (result) {
      message.success(t('transaction_added_successfully'));
      form.resetFields();
      onClose();
    } else {
      message.error(t('failed_to_add_transaction'));
    }
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

  useEffect(() => {
    if (selectedRecord && selectedBatchObj) {
      const recordTransactions = selectedBatchObj.transactionsList.filter(
        (t) => {
          if (t.context_id === null) {
            const firstRecord =
              selectedBatchObj.importsList?.[0] ||
              selectedBatchObj.registrationsList?.[0];
            return firstRecord?.id === selectedRecord;
          }
          return t.context_id === selectedRecord;
        }
      );

      const paidUsd = recordTransactions.reduce(
        (sum, t) => sum + (t.amount_usd || 0),
        0
      );
      const paidIqd = recordTransactions.reduce(
        (sum, t) => sum + (t.amount_iqd || 0),
        0
      );

      setPaidAmounts({ usd: paidUsd, iqd: paidIqd });
    } else {
      setPaidAmounts({ usd: 0, iqd: 0 });
    }
  }, [selectedRecord, selectedBatchObj]);

  return (
    <Modal
      title={t('repayment')}
      open={open}
      onCancel={onClose}
      footer={null}
      width={window.innerWidth > 768 ? '50%' : 800}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[10, 16]}>
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
                  form.resetFields([
                    'context_id',
                    'amount_usd',
                    'amount_iqd',
                    'note'
                  ]);
                  setSelectedRecord(null);
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
              label={t('record')}
              name="context_id"
              rules={[
                {
                  required: true,
                  message: t('record_is_required')
                }
              ]}
            >
              <Select
                showSearch
                placeholder={t('select_record')}
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
            <Card variant={'borderless'}>
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

                      {selectedRecordObj?.total_usd > 0 && (
                        <Col xs={24} md={12}>
                          <div className="detail-item">
                            <strong>{t('outstanding_usd')}:</strong>{' '}
                            <span
                              style={{ color: '#faad14', fontWeight: 'bold' }}
                            >
                              {(
                                selectedRecordObj?.total_usd - paidAmounts.usd
                              ).toLocaleString()}{' '}
                              USD
                            </span>
                          </div>
                        </Col>
                      )}

                      {selectedRecordObj?.total_iqd > 0 && (
                        <Col xs={24} md={12}>
                          <div className="detail-item">
                            <strong>{t('outstanding_iqd')}:</strong>{' '}
                            <span
                              style={{ color: '#faad14', fontWeight: 'bold' }}
                            >
                              {(
                                selectedRecordObj?.total_iqd - paidAmounts.iqd
                              ).toLocaleString()}{' '}
                              IQD
                            </span>
                          </div>
                        </Col>
                      )}

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

          {selectedRecord && (
            <>
              {selectedRecordObj?.total_usd > 0 && (
                <Col xs={24} md={12}>
                  <Form.Item
                    style={{ margin: 0 }}
                    label={t('amount_usd')}
                    name="amount_usd"
                    rules={[
                      {
                        validator(_, value) {
                          const outstandingUsd =
                            (selectedRecordObj?.total_usd || 0) -
                            paidAmounts.usd;
                          if (!value || value <= outstandingUsd) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(t('amount_exceeds_outstanding'))
                          );
                        }
                      }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder={t('amount')}
                      min={0}
                      step={0.01}
                      precision={2}
                      parser={(value) => value.replace(/[^\d.]/g, '')}
                      formatter={(value) =>
                        value
                          ? `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                          : ''
                      }
                      addonBefore={'USD'}
                    />
                  </Form.Item>
                </Col>
              )}

              {selectedRecordObj?.total_iqd > 0 && (
                <Col xs={24} md={12}>
                  <Form.Item
                    style={{ margin: 0 }}
                    label={t('amount_iqd')}
                    name="amount_iqd"
                    rules={[
                      {
                        validator(_, value) {
                          const outstandingIqd =
                            (selectedRecordObj?.total_iqd || 0) -
                            paidAmounts.iqd;
                          if (!value || value <= outstandingIqd) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(t('amount_exceeds_outstanding'))
                          );
                        }
                      }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder={t('amount')}
                      min={0}
                      step={250}
                      parser={(value) => value.replace(/\D/g, '')}
                      formatter={(value) => `${Number(value).toLocaleString()}`}
                      addonBefore={'IQD'}
                    />
                  </Form.Item>
                </Col>
              )}

              <Col span={24}>
                <Form.Item style={{ margin: 0 }} label={t('note')} name="note">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
            </>
          )}
          <Col span={24}>
            <Button type="primary" block htmlType="submit">
              {t('submit')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default RepaymentModal;
