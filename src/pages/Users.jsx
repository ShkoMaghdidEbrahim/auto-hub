import React, { useEffect, useState } from 'react';
import { Card, Table } from 'antd';
import { getUsers } from '../database/UsersApi.js';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'user_roles',
      key: 'user_roles',
      render: (roles) => roles.map((r) => r?.roles['name']).join(', ')
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleDateString()
    }
  ];

  useEffect(() => {
    getUsers()
      .then((data) => {
        console.log(data);
        setUsers(data);
      })
      .catch((error) => console.error('Error fetching users:', error))
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
      <Table loading={loading} columns={columns} dataSource={users} />
    </Card>
  );
};

export default Users;
