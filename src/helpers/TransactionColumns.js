// ---- columns from your snippet ----
import { useTranslation } from 'react-i18next';

export const useTransactionColumns = () => {
  const { t } = useTranslation();

  return [
    {
      title: t('transaction_id'),
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: t('batch_id'),
      dataIndex: 'batchName',
      key: 'batchName'
    },
    {
      title: t('amount_iqd'),
      dataIndex: 'amount_iqd',
      key: 'amount_iqd'
    },
    {
      title: t('amount_usd'),
      dataIndex: 'amount_usd',
      key: 'amount_usd'
    },
    {
      title: t('note'),
      dataIndex: 'note',
      key: 'note'
    },
    {
      title: t('created_at'),
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: t('context_type'),
      dataIndex: 'context_type',
      key: 'context_type'
    }
  ];
};

export const useImportTransportationColumns = () => {
  const { t } = useTranslation();

  return [
    { title: t('vin_number'), dataIndex: 'vin_number', key: 'vin_number' },
    { title: t('batch'), dataIndex: 'batchName', key: 'batchName' },
    { title: t('car_name'), dataIndex: 'car_name', key: 'car_name' },
    { title: t('car_model'), dataIndex: 'car_model', key: 'car_model' },
    { title: t('car_color'), dataIndex: 'car_color', key: 'car_color' },
    { title: t('import_fee'), dataIndex: 'import_fee', key: 'import_fee' },
    {
      title: t('import_system_fee'),
      dataIndex: 'import_system_fee',
      key: 'import_system_fee'
    },
    { title: t('car_coc_fee'), dataIndex: 'car_coc_fee', key: 'car_coc_fee' },
    {
      title: t('transportation_fee'),
      dataIndex: 'transportation_fee',
      key: 'transportation_fee'
    },
    { title: t('total_usd'), dataIndex: 'total_usd', key: 'total_usd' },
    { title: t('total_iqd'), dataIndex: 'total_iqd', key: 'total_iqd' },
    {
      title: t('usd_to_iqd_rate'),
      dataIndex: 'usd_to_iqd_rate',
      key: 'usd_to_iqd_rate'
    },
    { title: t('note'), dataIndex: 'note', key: 'note' },
    { title: t('created_at'), dataIndex: 'created_at', key: 'created_at' }
  ];
};

export const useRegistrationColumns = () => {
  const { t } = useTranslation();

  return [
    { title: t('vin_number'), dataIndex: 'vin_number', key: 'vin_number' },
    { title: t('batch'), dataIndex: 'batchName', key: 'batchName' },
    { title: t('car_name'), dataIndex: 'car_name', key: 'car_name' },
    { title: t('car_model'), dataIndex: 'car_model', key: 'car_model' },
    {
      title: t('vehicle_size'),
      dataIndex: ['vehicle_size_types', 'name'],
      key: 'vehicle_size'
    },
    {
      title: t('number_of_cylinders'),
      dataIndex: 'number_of_cylinders',
      key: 'number_of_cylinders'
    },
    { title: t('car_color'), dataIndex: 'car_color', key: 'car_color' },
    {
      title: t('plate_number'),
      dataIndex: 'temporary_plate_number',
      key: 'temporary_plate_number'
    },
    { title: t('size_fee'), dataIndex: 'size_fee', key: 'size_fee' },
    {
      title: t('plate_number_cost'),
      dataIndex: 'plate_number_cost',
      key: 'plate_number_cost'
    },
    { title: t('legal_cost'), dataIndex: 'legal_cost', key: 'legal_cost' },
    {
      title: t('inspection_cost'),
      dataIndex: 'inspection_cost',
      key: 'inspection_cost'
    },
    {
      title: t('contract_price'),
      dataIndex: 'electronic_contract_cost',
      key: 'electronic_contract_cost'
    },
    {
      title: t('window_check_cost'),
      dataIndex: 'window_check_cost',
      key: 'window_check_cost'
    },
    { title: t('expenses'), dataIndex: 'expenses', key: 'expenses' },
    { title: t('labor_fees'), dataIndex: 'labor_fees', key: 'labor_fees' },
    { title: t('total'), dataIndex: 'total', key: 'total' },
    { title: t('created_at'), dataIndex: 'created_at', key: 'created_at' }
  ];
};
