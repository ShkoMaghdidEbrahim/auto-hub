import { supabase } from '../supabase.js';

export const getUsers = async () => {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  const users = data?.users || [];

  const userIds = users.map((user) => user.id);

  if (userIds.length === 0) return [];

  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select(
      `
      user_id,
      role_id (
        id,
        name,
        description
      )
    `
    )
    .in('user_id', userIds);

  if (rolesError) {
    console.error('Error fetching user roles:', rolesError);
    throw rolesError;
  }

  const uniqueRoleIds = [...new Set(userRoles.map((role) => role.role_id.id))];

  const { data: permissionsData, error: permissionsError } = await supabase
    .from('role_permissions')
    .select(
      `
    role_id,
    permission_id (
      id,
      name,
      description
    )
  `
    )
    .in('role_id', uniqueRoleIds);

  if (permissionsError) {
    console.error('Error fetching permissions:', permissionsError);
    throw permissionsError;
  }

  const rolesMap = {};
  userRoles.forEach(({ user_id, role_id }) => {
    if (!rolesMap[user_id]) {
      rolesMap[user_id] = [];
    }
    rolesMap[user_id].push(role_id);
  });

  const permissionsMap = {};
  permissionsData.forEach(({ role_id, permission_id }) => {
    if (!permissionsMap[role_id]) {
      permissionsMap[role_id] = [];
    }
    permissionsMap[role_id].push(permission_id);
  });

  return users.map((user) => {
    const roles = rolesMap[user.id] || [];
    const rolesWithPermissions = roles.map((role) => ({
      ...role,
      permissions: permissionsMap[role.id] || []
    }));
    return {
      ...user,
      user_role: rolesWithPermissions
    };
  });
};

export const getPermissions = async () => {
  const { data, error } = await supabase.from('permissions').select('*');
  if (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
  return data;
};

export const getRoles = async () => {
  const { data: roles, error } = await supabase.from('roles').select('*');

  if (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }

  const roleIds = roles.map((role) => role.id);

  if (roleIds.length === 0) return [];

  const { data: rolePermissions, error: permissionsError } = await supabase
    .from('role_permissions')
    .select(
      `
      role_id,
      permission_id (
        id,
        name,
        description
      )
    `
    )
    .in('role_id', roleIds);

  if (permissionsError) {
    console.error('Error fetching role permissions:', permissionsError);
    throw permissionsError;
  }

  const permissionsByRole = {};
  rolePermissions.forEach(({ role_id, permission_id }) => {
    if (!permissionsByRole[role_id]) {
      permissionsByRole[role_id] = [];
    }
    permissionsByRole[role_id].push(permission_id);
  });

  return roles.map((role) => ({
    ...role,
    permissions: permissionsByRole[role.id] || []
  }));
};

export const addUser = async (email, password, roleId) => {
  const { data: user, error: signUpError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

  if (signUpError) {
    console.error('Error creating user:', signUpError);
    throw signUpError;
  }

  const { error: roleError } = await supabase.from('user_roles').insert([
    {
      user_id: user.user.id,
      role_id: roleId
    }
  ]);

  if (roleError) {
    console.error('Error assigning role to user:', roleError);
    throw roleError;
  }

  return user;
};

export const updateUser = async (userId, email, password, roleId) => {
  const updates = { id: userId, email };
  if (password && password?.trim() !== '') {
    updates.password = password;
  }

  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    updates
  );

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  const { error: roleError } = await supabase.from('user_roles').upsert([
    {
      user_id: userId,
      role_id: roleId
    }
  ]);

  if (roleError) {
    console.error('Error updating user role:', roleError);
    throw roleError;
  }

  return data;
};

export const deleteUser = async (userId) => {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const createRole = async (name, description, permissionIds) => {
  console.log({
    name,
    description,
    permissionIds
  });
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .insert([{ name, description }])
    .select()
    .single();

  if (roleError) {
    console.error('Error creating role:', roleError);
    throw roleError;
  }

  if (permissionIds && permissionIds.length > 0) {
    const rolePermissions = permissionIds.map((pid) => ({
      role_id: role.id,
      permission_id: pid
    }));

    const { error: permissionsError } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);

    if (permissionsError) {
      console.error('Error assigning permissions to role:', permissionsError);
      throw permissionsError;
    }
  }

  return role;
};

export const updateRole = async (roleId, name, description, permissionIds) => {
  const { error: roleError } = await supabase
    .from('roles')
    .update({ name, description })
    .eq('id', roleId);

  if (roleError) {
    console.error('Error updating role:', roleError);
    throw roleError;
  }

  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);

  if (deleteError) {
    console.error('Error clearing existing permissions:', deleteError);
    throw deleteError;
  }

  if (permissionIds && permissionIds.length > 0) {
    const rolePermissions = permissionIds.map((pid) => ({
      role_id: roleId,
      permission_id: pid
    }));

    const { error: permissionsError } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);

    if (permissionsError) {
      console.error('Error assigning permissions to role:', permissionsError);
      throw permissionsError;
    }
  }

  return true;
};

export const deleteRole = async (roleId) => {
  const { error: deletePermissionsError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);

  if (deletePermissionsError) {
    console.error('Error deleting role permissions:', deletePermissionsError);
    throw deletePermissionsError;
  }

  const { error: deleteRoleError } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId);

  if (deleteRoleError) {
    console.error('Error deleting role:', deleteRoleError);
    throw deleteRoleError;
  }

  return true;
};

export const createPermission = async (name, description) => {
  const { data: permission, error } = await supabase
    .from('permissions')
    .insert([{ name, description }])
    .select()
    .single();

  if (error) {
    console.error('Error creating permission:', error);
    throw error;
  }

  return permission;
};

export const updatePermission = async (permissionId, name, description) => {
  const { error } = await supabase
    .from('permissions')
    .update({ name, description })
    .eq('id', permissionId);

  if (error) {
    console.error('Error updating permission:', error);
    throw error;
  }

  return true;
};

export const deletePermission = async (permissionId) => {
  const { error: deleteRolePermissionsError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('permission_id', permissionId);

  if (deleteRolePermissionsError) {
    console.error(
      'Error deleting role permissions:',
      deleteRolePermissionsError
    );
    throw deleteRolePermissionsError;
  }

  const { error: deletePermissionError } = await supabase
    .from('permissions')
    .delete()
    .eq('id', permissionId);

  if (deletePermissionError) {
    console.error('Error deleting permission:', deletePermissionError);
    throw deletePermissionError;
  }

  return true;
};
