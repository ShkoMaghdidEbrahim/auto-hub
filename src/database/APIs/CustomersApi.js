import { supabase } from '../supabase';

export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

  return data || [];
};

export const addCustomer = async (customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }

  return data;
};

export const updateCustomer = async (customerId, customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .update(customerData)
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }

  return data;
};

export const deleteCustomer = async (customerId) => {
  const { error } = await supabase
    .from('customers')
    .update({ is_deleted: true })
    .eq('id', customerId);

  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};
