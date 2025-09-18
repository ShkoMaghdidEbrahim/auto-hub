// ---- columns from your snippet ----
export const transactionColumns = [
  {
    title: 'Transaction ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: 'Batch ID',
    dataIndex: 'batch_id',
    key: 'batch_id'
  },
  {
    title: 'Amount IQD',
    dataIndex: 'amount_iqd',
    key: 'amount_iqd'
  },
  {
    title: 'Amount USD',
    dataIndex: 'amount_usd',
    key: 'amount_usd'
  },
  {
    title: 'Note',
    dataIndex: 'note',
    key: 'note'
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: 'Updated At',
    dataIndex: 'updated_at',
    key: 'updated_at'
  },
  {
    title: 'Context Type',
    dataIndex: 'context_type',
    key: 'context_type'
  },
  {
    title: 'Context ID',
    dataIndex: 'context_id',
    key: 'context_id'
  }
];

export const importTransportationColumns = [
  { title: 'VIN', dataIndex: 'vin_number', key: 'vin_number' },
  { title: 'Customer', dataIndex: 'customer', key: 'full_name' },
  { title: 'Batch', dataIndex: 'batch', key: 'batch' },
  { title: 'Car Name', dataIndex: 'car_name', key: 'car_name' },
  { title: 'Car Model', dataIndex: 'car_model', key: 'car_model' },
  { title: 'Car Color', dataIndex: 'car_color', key: 'car_color' },
  { title: 'Import Fee', dataIndex: 'import_fee', key: 'import_fee' },
  {
    title: 'System Fee',
    dataIndex: 'import_system_fee',
    key: 'import_system_fee'
  },
  { title: 'COC Fee', dataIndex: 'car_coc_fee', key: 'car_coc_fee' },
  {
    title: 'Transport Fee',
    dataIndex: 'transportation_fee',
    key: 'transportation_fee'
  },
  { title: 'Total USD', dataIndex: 'total_usd', key: 'total_usd' },
  { title: 'Total IQD', dataIndex: 'total_iqd', key: 'total_iqd' },
  { title: 'Note', dataIndex: 'note', key: 'note' },
  { title: 'Created At', dataIndex: 'created_at', key: 'created_at' }
];

export const registrationColumns = [
  { title: 'VIN', dataIndex: 'vin_number', key: 'vin_number' },
  { title: 'Customer', dataIndex: 'customer', key: 'full_name' },
  { title: 'Batch', dataIndex: 'batch', key: 'batch' },
  { title: 'Car Name', dataIndex: 'car_name', key: 'car_name' },
  { title: 'Car Model', dataIndex: 'car_model', key: 'car_model' },
  {
    title: 'Vehicle Size',
    dataIndex: 'vehicle_size_type',
    key: 'vehicle_size'
  },
  {
    title: 'Cylinders',
    dataIndex: 'number_of_cylinders',
    key: 'number_of_cylinders'
  },
  { title: 'Car Color', dataIndex: 'car_color', key: 'car_color' },
  {
    title: 'Plate',
    dataIndex: 'temporary_plate_number',
    key: 'temporary_plate_number'
  },
  { title: 'Size Fee', dataIndex: 'size_fee', key: 'size_fee' },
  {
    title: 'Plate Cost',
    dataIndex: 'plate_number_cost',
    key: 'plate_number_cost'
  },
  { title: 'Legal Cost', dataIndex: 'legal_cost', key: 'legal_cost' },
  { title: 'Inspection', dataIndex: 'inspection_cost', key: 'inspection_cost' },
  {
    title: 'Contract Cost',
    dataIndex: 'electronic_contract_cost',
    key: 'electronic_contract_cost'
  },
  {
    title: 'Window Check',
    dataIndex: 'window_check_cost',
    key: 'window_check_cost'
  },
  { title: 'Expenses', dataIndex: 'expenses', key: 'expenses' },
  { title: 'Labor Fees', dataIndex: 'labor_fees', key: 'labor_fees' },
  { title: 'Total', dataIndex: 'total', key: 'total' },
  { title: 'Created At', dataIndex: 'created_at', key: 'created_at' }
];
