import React from 'react';
import {
  Card,
  Button,
  Input
} from 'antd';
import Icon from '@ant-design/icons';
const TarqimMrur = () => {
  
  return (
    <Card
      style={{
        minHeight: '100%',
        borderRadius: 0
      }}
      variant={'borderless'}
      key={'tarqim_mrur'}
    >
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative'
        }}
      >
        <h1>تەرقیم مرور</h1>
        <p>زیادکردنی زانیاری بۆ تەرقیم مرور.</p>
        <div style={{ display: 'inline-block', marginRight: 8 }}>
          <Input placeholder="زانیاری نوێ" />
        </div>
        <Button type="primary">زیادکردن
            <Icon type="plus" />
        </Button>

      </div>
    </Card>
  );
};

export default TarqimMrur;
