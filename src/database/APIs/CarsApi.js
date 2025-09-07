import { supabase } from '../supabase.js';

export const getCars = async () => {
  const { data, error } = await supabase
    .from('cars')
    .select('*, vehicle_size_types(name)')
    .eq('is_deleted', false);

  if (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
  return data;
};

export const addCar = async (values) => {
  const { data, error } = await supabase.from('cars').insert([values]);
  if (error) {
    console.error('Error adding car:', error);
    throw error;
  }
  return data;
};

export const updateCar = async (id, values) => {
  const { data, error } = await supabase
    .from('cars')
    .update(values)
    .eq('id', id);
  if (error) {
    console.error('Error updating car:', error);
    throw error;
  }
  return data;
};

export const deleteCar = async (id) => {
  const { error } = await supabase
    .from('cars')
    .update({ is_deleted: true })
    .eq('id', id);
  if (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
  return true;
};

export const getSizesEnum = async () => {
  const { data, error } = await supabase
    .from('vehicle_size_types')
    .select('*')
    .eq('is_deleted', false)
    .order('id', { ascending: true });
  if (error) {
    console.error('Error fetching sizes enum:', error);
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
    .update({ deleted: true })
    .eq('id', sizeId);

  if (error) {
    console.error('Error deleting vehicle size:', error);
    throw error;
  }
  return true;
};
