const DynamicReceiptPage = ({
  type = 'import', // "import" | "vehicle"
  receiptNo,
  pNo,
  date,
  customerName,
  reference,
  city,
  beforeUsd,
  beforeIqd,
  receivedUsd,
  receivedIqd,
  afterUsd,
  afterIqd,
  beforeIqdOnly,
  receivedIqdOnly,
  afterIqdOnly
}) => {
  return (
    <div
      style={{
        width: '800px',
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #000',
        fontFamily: 'Arial, sans-serif',
        direction: 'rtl'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>شركة نور البصرة</h2>
        <p style={{ margin: 0 }}>NOOR AL BASRAA</p>
        <p style={{ margin: 0 }}>Authorize Manager: Sabah Faros</p>
        <p style={{ margin: 0 }}>Iraq - Erbil - 100m Street, Second Branch</p>
        <p style={{ margin: 0 }}>Phone: 0750 4621507</p>
      </div>

      {/* Receipt title */}
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>وصل قبض</h3>

      {/* Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px'
        }}
      >
        <tbody>
          <tr>
            <td style={cellStyle}>NO</td>
            <td style={cellStyle}>{receiptNo}</td>
            <td style={cellStyle}>P_NO</td>
            <td style={cellStyle}>{pNo}</td>
          </tr>
          <tr>
            <td style={cellStyle}>التاريخ</td>
            <td style={cellStyle}>{date}</td>
            <td style={cellStyle}>استلمنا من السيد</td>
            <td style={cellStyle}>{customerName}</td>
          </tr>
          <tr>
            <td style={cellStyle}>مبلغا و قدره</td>
            <td style={cellStyle}>{reference}</td>
            <td style={cellStyle}>و ذلك عن</td>
            <td style={cellStyle}>{city}</td>
          </tr>

          {/* Before Amount */}
          <tr>
            <td style={cellStyle}>المبلغ السابق</td>
            <td style={cellStyle} colSpan={3}>
              {type === 'import'
                ? `USD: ${beforeUsd} | IQD: ${beforeIqd}`
                : `IQD: ${beforeIqdOnly}`}
            </td>
          </tr>

          {/* Received Amount */}
          <tr>
            <td style={cellStyle}>المبلغ المستلم</td>
            <td style={cellStyle} colSpan={3}>
              {type === 'import'
                ? `USD: ${receivedUsd} | IQD: ${receivedIqd}`
                : `IQD: ${receivedIqdOnly}`}
            </td>
          </tr>

          {/* After Amount */}
          <tr>
            <td style={cellStyle}>المبلغ الحالي</td>
            <td style={cellStyle} colSpan={3}>
              {type === 'import'
                ? `USD: ${afterUsd} | IQD: ${afterIqd}`
                : `IQD: ${afterIqdOnly}`}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <p>ختم الشركة</p>
        <p>Nur Al-Basra Co.</p>
        <p>العنوان: اربيل شارع 100م مدينة معارض</p>
        <p>Phone: 0750 667 7788</p>
      </div>
    </div>
  );
};

const cellStyle = {
  border: '1px solid #000',
  padding: '8px',
  textAlign: 'center'
};

export default DynamicReceiptPage;
