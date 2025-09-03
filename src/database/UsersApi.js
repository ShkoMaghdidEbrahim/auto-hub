import { supabase } from './supabase';

export const getUsers = async () => {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  const users = data?.users || [];

  const userIds = users.map((user) => user.id);

  if (userIds.length === 0) return [];

  const { data: rolesData, error: rolesError } = await supabase
    .from('user_roles')
    .select(
      `
    user_id,
    roles:role_id (
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

  const rolesMap = {};
  rolesData.forEach(({ user_id, roles }) => {
    if (!rolesMap[user_id]) {
      rolesMap[user_id] = [];
    }
    rolesMap[user_id].push({ roles });
  });
  return users.map((user) => ({
    ...user,
    user_roles: rolesMap[user.id] || []
  }));
};
