import React from 'react';
import {
  Card,
  Button,
  Input
} from 'antd';
import Icon from '@ant-design/icons';
const NaqllGumrg = () => {
  
  return (
    <Card
      style={{
        minHeight: '100%',
        borderRadius: 0
      }}
      variant={'borderless'}
      key={'naqll_gumrg'}
    >
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative'
        }}
      >
        <h1>نەقڵ و گومرگ</h1>
        <p>زیادکردنی زانیاری بۆ ناو نەقڵ و گومرگ.</p>
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

export default NaqllGumrg;
