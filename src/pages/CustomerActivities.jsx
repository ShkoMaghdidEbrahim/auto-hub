import React, { useEffect, useState } from 'react';
import { getCustomers } from '../database/APIs/CustomersApi.js';
import { Card, Col, Row } from 'antd';

const CustomerActivities = () => {
  const [Customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers()
      .then((data) => {
        setCustomers(data);
        console.log(data);
      })
      .catch((error) => {
        console.error('Error fetching customers:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card
      style={{
        minHeight: '100%',
        borderRadius: 0
      }}
      variant={'borderless'}
      key={'dashboard'}
    >
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Row gutter={[10, 10]}>
          {Customers.map((customer) => (
            <Col
              key={customer.id}
              xs={24}
              sm={12}
              md={12}
              lg={12}
              xl={8}
              style={{ padding: '10px' }}
            >
              <Card title={customer.full_name}>
                <p>Email: {customer.email}</p>
                <p>Phone: {customer.phone}</p>
                <p>Address: {customer.address}</p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};

export default CustomerActivities;
