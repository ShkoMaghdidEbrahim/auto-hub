import { supabase } from '../supabase';

export const getSizes = async () => {
  const { data, error } = await supabase
    .from('vehicle_size_types')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching vehicle sizes:', error);
    throw error;
  }
  return data;
};

export const addSize = async (sizeData) => {
  const { data, error } = await supabase
    .from('vehicle_size_types')
    .insert([sizeData]);

  if (error) {
    console.error('Error adding vehicle size:', error);
    throw error;
  }
  return data;
};

export const updateSize = async (id, sizeData) => {
  const { data, error } = await supabase
    .from('vehicle_size_types')
    .update(sizeData)
    .eq('id', id);

  if (error) {
    console.error('Error updating vehicle size:', error);
    throw error;
  }
  return data;
};

export const deleteSize = async (sizeId) => {
  const { error } = await supabase
    .from('vehicle_size_types')
    .delete()
    .eq('id', sizeId);

  if (error) {
    console.error('Error deleting vehicle size:', error);
    throw error;
  }
  return true;
};
