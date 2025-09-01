import React from 'react';
import {
  Card,

} from 'antd';
const Dashboard = () => {
  
  return (
    <Card
      style={{
        minHeight: '100%',
        borderRadius: 0
      }}
      variant={'borderless'}
      key={'dashboard'}
    >
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative'
        }}
      >
        hi
      </div>
    </Card>
  );
};

export default Dashboard;
