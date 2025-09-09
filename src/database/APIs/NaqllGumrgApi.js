import { supabase } from '../supabase';
import { getCustomers } from './CustomersApi';

// Fixed function name to match what's used in NaqllGumrg.jsx
export const getImportTransportationRecords = async () => {
  try {
    // Fetch all data in parallel
    const [importTransportationRecords, customers] = await Promise.all([
      supabase
        .from('import_and_transportation')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false }),
      getCustomers()
    ]);
    
    if (importTransportationRecords.error) {
      console.error('Error fetching import transportation records:', importTransportationRecords.error);
      throw importTransportationRecords.error;
    }
    
    // Manually join the data
    const enrichedRecords = importTransportationRecords.data.map((record) => {
      const customer = customers.find(
        (customer) => customer.id === record.customer_id
      );
      return {
        ...record,
        customers: customer || null
      };
    });
    
    return enrichedRecords;
  } catch (error) {
    console.error('Error fetching import transportation records:', error);
    throw error;
  }
};

// Fixed function name to match what's used in AddAndUpdateNaqllGumrgDrawer.jsx
export const addNaqllGumrgRecord = async (recordData) => {
  const { data, error } = await supabase
    .from('import_and_transportation')
    .insert([recordData])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating import transportation record:', error);
    throw error;
  }
  
  return data;
};

// Fixed function name to match what's used in AddAndUpdateNaqllGumrgDrawer.jsx
export const updateNaqllGumrgRecord = async (recordId, recordData) => {
  const { data, error } = await supabase
    .from('import_and_transportation')
    .update(recordData)
    .eq('id', recordId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating import transportation record:', error);
    throw error;
  }
  
  return data;
};

// Fixed function name to match what's used in ImportTransportation.jsx
export const deleteImportTransportationRecord = async (recordId) => {
  const { error } = await supabase
    .from('import_and_transportation')
    .update({ is_deleted: true })
    .eq('id', recordId);
    
  if (error) {
    console.error('Error deleting import transportation record:', error);
    throw error;
  }
};

// Keep the original function names as aliases for backward compatibility
export const getNaqllGumrgRecords = getImportTransportationRecords;
export const addImportTransportationRecord = addNaqllGumrgRecord;
export const updateImportTransportationRecord = updateNaqllGumrgRecord;
export const deleteNaqllGumrgRecord = deleteImportTransportationRecord;