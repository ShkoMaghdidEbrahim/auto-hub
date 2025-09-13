import React, { useEffect, useState } from 'react';
import { getCustomers } from '../database/APIs/CustomersApi.js';
import { Card, Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import CustomerProfileDrawer from '../components/CustomerActivities/CustomerProfileDrawer.jsx';

const CustomerActivities = ({ color }) => {
  const { t } = useTranslation();
  const [Customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerProfileDrawer, setCustomerProfileDrawer] = useState({
    open: false,
    customer: null
  });

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
    <>
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
          <Row gutter={[16, 16]}>
            {Customers.map((customer) => (
              <Col key={customer.id} xs={24} sm={12} md={12} lg={12} xl={8}>
                <Card
                  onClick={() =>
                    setCustomerProfileDrawer({
                      open: true,
                      customer: customer
                    })
                  }
                  style={{
                    cursor: 'pointer',
                    height: '100%',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    borderColor: color
                  }}
                  styles={{
                    header: {
                      borderColor: color
                    }
                  }}
                  title={customer.full_name}
                >
                  <p>
                    {t('email')}: {customer.email}
                  </p>
                  <p>
                    {t('phone')}: {customer.phone}
                  </p>
                  <p>
                    {t('address')}: {customer.address}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {customerProfileDrawer.open ? (
        <CustomerProfileDrawer
          open={customerProfileDrawer.open}
          onClose={() =>
            setCustomerProfileDrawer({ open: false, customer: null })
          }
          customer={customerProfileDrawer.customer}
        />
      ) : null}
    </>
  );
};

export default CustomerActivities;
