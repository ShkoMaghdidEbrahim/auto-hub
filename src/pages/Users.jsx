import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Divider, Row, Space, Table, Tag } from 'antd';
import { getPermissions, getRoles, getUsers } from '../database/UsersApi.js';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import AddAndUpdateUsersModal from '../components/Users/AddAndUpdateUsersModal.jsx';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [addAndUpdateUserModal, setAddAndUpdateUserModal] = useState({
    open: false,
    user: null
  });

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
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 250,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            shape={'round'}
            type="default"
            icon={<EditOutlined />}
            onClick={() =>
              setAddAndUpdateUserModal({ open: true, user: record })
            }
          >
            {t('edit')}
          </Button>

          <Button
            shape={'round'}
            type="default"
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              setAddAndUpdateUserModal({ open: true, user: record })
            }
          >
            {t('delete')}
          </Button>
        </Space>
      )
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
      <Row gutter={[10, 16]}>
        <Col span={24}>
          <Row gutter={[10, 10]}>
            <Col span={18}>
              <Divider
                orientation={t('rtl') ? 'right' : 'left'}
                style={{
                  fontSize: 24,
                  margin: 0
                }}
                dashed={true}
              >
                {t('users')}
              </Divider>
            </Col>
            <Col span={6}>
              <Button
                block
                type="primary"
                onClick={() =>
                  setAddAndUpdateUserModal({ open: true, user: null })
                }
              >
                {t('add_user')}
              </Button>
            </Col>
          </Row>
        </Col>

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

        <Col span={24}>
          <Row gutter={[10, 10]}>
            <Col span={18}>
              <Divider
                orientation={t('rtl') ? 'right' : 'left'}
                style={{
                  fontSize: 24,
                  margin: 0
                }}
                dashed={true}
              >
                {t('roles')}
              </Divider>
            </Col>
            <Col span={6}>
              <Button
                block
                type="primary"
                onClick={() =>
                  setAddAndUpdateUserModal({ open: true, user: null })
                }
              >
                {t('add_role')}
              </Button>
            </Col>
          </Row>
        </Col>

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

        <Col span={24}>
          <Row gutter={[10, 10]}>
            <Col span={18}>
              <Divider
                orientation={t('rtl') ? 'right' : 'left'}
                style={{
                  fontSize: 24,
                  margin: 0
                }}
                dashed={true}
              >
                {t('permissions')}
              </Divider>
            </Col>
            <Col span={6}>
              <Button
                block
                type="primary"
                onClick={() =>
                  setAddAndUpdateUserModal({ open: true, user: null })
                }
              >
                {t('add_permission')}
              </Button>
            </Col>
          </Row>
        </Col>

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

      {addAndUpdateUserModal?.open ? (
        <AddAndUpdateUsersModal
          open={addAndUpdateUserModal.open}
          onClose={() => setAddAndUpdateUserModal({ open: false, user: null })}
          onDone={() => {
            setLoading(true);
            getUsers()
              .then((data) => setUsers(data))
              .catch((error) => console.error('Error fetching users:', error))
              .finally(() => setLoading(false));
          }}
          user={addAndUpdateUserModal.user}
          roles={roles}
        />
      ) : null}
    </Card>
  );
};

export default Users;
