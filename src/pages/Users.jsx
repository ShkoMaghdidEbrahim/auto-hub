import React, { useEffect, useState } from 'react';
import { Card, Table, Tag } from 'antd';
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
      dataIndex: 'user_role',
      key: 'user_role',
      render: (roles) => {
        if (!roles || !Array.isArray(roles)) return '-';
        return roles
          .map((role) => role?.name || role?.role?.name || '-')
          .join(', ');
      }
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (_, record) => {
        const permissions = record.user_role
          ? record.user_role.flatMap((role) =>
              role?.permissions ? role.permissions.map((perm) => perm.name) : []
            )
          : [];
        const uniquePermissions = [...new Set(permissions)];
        return uniquePermissions.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px'
            }}
          >
            {uniquePermissions.map((permission) => (
              <Tag
                key={permission}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  margin: '0 4px 4px 0',
                  display: 'inline-block'
                }}
              >
                {permission}
              </Tag>
            ))}
          </div>
        ) : (
          '-'
        );
      }
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
      <Table
        loading={loading}
        columns={columns}
        dataSource={users}
        scroll={{
          x: 'max-content'
        }}
      />
    </Card>
  );
};

export default Users;
