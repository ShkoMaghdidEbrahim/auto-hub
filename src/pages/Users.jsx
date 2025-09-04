import React, { useEffect, useState } from 'react';
import { Card, Col, Divider, Row, Table, Tag } from 'antd';
import { getPermissions, getRoles, getUsers } from '../database/UsersApi.js';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const usersColumns = [
    {
      title: t('email'),
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: t('role'),
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
      title: t('created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
    }
  ];

  const permissionsColumns = [
    {
      title: t('permission_name'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('permission_description'),
      dataIndex: 'description',
      key: 'description'
    }
  ];

  const rolesColumns = [
    {
      title: t('role_name'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('role_description'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: t('permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => {
        if (!permissions || !Array.isArray(permissions)) return '-';
        return (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px'
            }}
          >
            {permissions.map((permission) => (
              <Tag
                key={permission.id}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  margin: '0 4px 4px 0',
                  display: 'inline-block'
                }}
              >
                {permission.name}
              </Tag>
            ))}
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    getUsers()
      .then((data) => {
        setUsers(data);
        getRoles().then((roles) => {
          setRoles(roles);
          getPermissions().then((permissions) => {
            setPermissions(permissions);
          });
        });
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
      <Row>
        <Divider
          orientation={t('rtl') ? 'right' : 'left'}
          style={{
            fontSize: 24
          }}
        >
          {t('users')}
        </Divider>

        <Col span={24}>
          <Table
            loading={loading}
            columns={usersColumns}
            dataSource={users}
            scroll={{
              x: 'max-content'
            }}
          />
        </Col>

        <Divider
          style={{
            fontSize: 24
          }}
          orientation={t('rtl') ? 'right' : 'left'}
        >
          {t('roles')}
        </Divider>

        <Col span={24}>
          <Table
            loading={loading}
            columns={rolesColumns}
            dataSource={roles}
            scroll={{
              x: 'max-content'
            }}
          />
        </Col>

        <Divider
          style={{
            fontSize: 24
          }}
          orientation={t('rtl') ? 'right' : 'left'}
        >
          {t('permissions')}
        </Divider>

        <Col span={24}>
          <Table
            loading={loading}
            columns={permissionsColumns}
            dataSource={permissions}
            scroll={{
              x: 'max-content'
            }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default Users;
