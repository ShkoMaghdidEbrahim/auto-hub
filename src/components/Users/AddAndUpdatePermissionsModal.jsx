import { Col, Form, Modal, Row } from 'antd';

const AddAndUpdatePermissionsModal = ({ open, onClose }) => {
  const onFinish = (values) => {
    console.log(values);
  };

  return (
    <Modal title={'title'} open={open} onCancel={onClose} footer={null}>
      <Form layout="vertical" onFinish={onFinish} initialValues={{}}>
        <Row gutter={[10, 10]}>
          <Col span={24}>
            <Form.Item
              style={{ margin: 0 }}
              label="label"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'message'
                }
              ]}
            ></Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAndUpdatePermissionsModal;
