import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import VehicleRegistrationDrawer from '../components/TarqimMrur/VehicleRegistrationDrawer';

const { Title } = Typography;

const TarqimMrur = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const showDrawer = () => {
    setDrawerOpen(true);
  };

  const onDrawerClose = () => {
    setDrawerOpen(false);
  };

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
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <CarOutlined style={{ marginRight: '8px' }} />
          {t('tarqim_mrur')}
        </Title>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            {t('entry_form_description')}
          </p>

          <Button
            type="primary"
            size="large"
            icon={<CarOutlined />}
            onClick={showDrawer}
            style={{
              minWidth: '200px',
              height: '50px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {t('entry_form')}
          </Button>
        </div>
      </Card>

      {drawerOpen ? (
        <VehicleRegistrationDrawer open={drawerOpen} onClose={onDrawerClose} />
      ) : null}
    </>
  );
};

export default TarqimMrur;
