import { supabase } from '../supabase';
import { getCustomers } from './CustomersApi';

// Get customer batches for import/transportation
export const getCustomerBatches = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('customer_id', customerId)
      .eq('batch_type', 'import_and_transportation')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customer batches:', error);
    throw error;
  }
};

// Fixed function name to match what's used in NaqllGumrg.jsx
// ... existing code ...

export const getImportTransportationRecords = async () => {
  try {
    // Fetch all data in parallel
    const [importTransportationRecords, customers] = await Promise.all([
      supabase
        .from('import_and_transportation')
        .select(
          `
          *,
          batches (
            id,
            name,
            batch_type,
            created_at
          )
        `
        )
        .eq('is_deleted', false)
        .order('created_at', { ascending: false }),
      getCustomers()
    ]);

    if (importTransportationRecords.error) {
      console.error(
        'Error fetching import transportation records:',
        importTransportationRecords.error
      );
      throw importTransportationRecords.error;
    }

    // Manually join the data - FIXED: use "customer" instead of "customers"
    const enrichedRecords = importTransportationRecords.data.map((record) => {
      const customer = customers.find(
        (customer) => customer.id === record.customer_id
      );
      return {
        ...record,
        customer: customer || null, // Changed from customers to customer
        batch: record.batches || null
      };
    });

    return enrichedRecords;
  } catch (error) {
    console.error('Error fetching import transportation records:', error);
    throw error;
  }
};

// ... rest of the file ...

// Fixed function name to match what's used in AddAndUpdateNaqllGumrgDrawer.jsx
export const addNaqllGumrgRecord = async (recordData, otherData) => {
  try {
    let batchId = null;

    // Handle batch creation/selection
    if (otherData && otherData.old_batch && otherData.batch_id) {
      // Use existing batch
      batchId = otherData.batch_id;
    } else if (otherData && !otherData.old_batch && otherData.batch_name) {
      // Create new batch
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .insert({
          customer_id: recordData.customer_id,
          batch_type: 'import_and_transportation',
          name: otherData.batch_name
        })
        .select()
        .single();

      if (batchError) {
        console.error('Error creating batch:', batchError);
        throw batchError;
      }
      batchId = batchData.id;
    } else {
      // Create default batch if none specified
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .insert({
          customer_id: recordData.customer_id,
          batch_type: 'import_and_transportation',
          name: `Import Batch ${new Date().toISOString().split('T')[0]}`
        })
        .select()
        .single();

      if (batchError) {
        console.error('Error creating default batch:', batchError);
        throw batchError;
      }
      batchId = batchData.id;
    }

    // Add batch_id to record data
    const finalRecordData = {
      ...recordData,
      batch_id: batchId
    };

    const { data, error } = await supabase
      .from('import_and_transportation')
      .insert([finalRecordData])
      .select()
      .single();

    if (error) {
      console.error('Error creating import transportation record:', error);
      throw error;
    }

    // Handle transactions if there are payments
    if (
      finalRecordData.paid_amount_usd > 0 ||
      finalRecordData.paid_amount_iqd > 0
    ) {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          batch_id: batchId,
          amount_usd: finalRecordData.paid_amount_usd || 0,
          amount_iqd: finalRecordData.paid_amount_iqd || 0,
          context_type: 'import_and_transportation',
          context_id: data.id,
          note: 'Payment for import and transportation'
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        // Don't throw here, just log the error as the main record was created successfully
      }
    }

    return data;
  } catch (error) {
    console.error('Error in addNaqllGumrgRecord:', error);
    throw error;
  }
};

// Fixed function name to match what's used in AddAndUpdateNaqllGumrgDrawer.jsx
export const updateNaqllGumrgRecord = async (
  recordId,
  recordData,
  otherData
) => {
  try {
    // Handle batch updates if needed
    let batchId = recordData.batch_id;

    if (otherData && !otherData.old_batch && otherData.batch_name) {
      // Create new batch if switching to new batch
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .insert({
          customer_id: recordData.customer_id,
          batch_type: 'import_and_transportation',
          name: otherData.batch_name
        })
        .select()
        .single();

      if (batchError) {
        console.error('Error creating new batch:', batchError);
        throw batchError;
      }
      batchId = batchData.id;
    } else if (otherData && otherData.old_batch && otherData.batch_id) {
      batchId = otherData.batch_id;
    }

    const finalRecordData = {
      ...recordData,
      batch_id: batchId,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('import_and_transportation')
      .update(finalRecordData)
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      console.error('Error updating import transportation record:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateNaqllGumrgRecord:', error);
    throw error;
  }
};

// Fixed function name to match what's used in ImportTransportation.jsx
export const deleteImportTransportationRecord = async (recordId) => {
  try {
    const { error } = await supabase
      .from('import_and_transportation')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId);

    if (error) {
      console.error('Error deleting import transportation record:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteImportTransportationRecord:', error);
    throw error;
  }
};

// Get single record by ID (useful for editing)
export const getImportTransportationRecord = async (recordId) => {
  try {
    const { data, error } = await supabase
      .from('import_and_transportation')
      .select(
        `
        *,
        batches (
          id,
          name,
          batch_type,
          created_at
        ),
        customers (
          id,
          full_name,
          phone,
          email
        )
      `
      )
      .eq('id', recordId)
      .eq('is_deleted', false)
      .single();

    if (error) {
      console.error('Error fetching import transportation record:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getImportTransportationRecord:', error);
    throw error;
  }
};

// Keep the original function names as aliases for backward compatibility
export const getNaqllGumrgRecords = getImportTransportationRecords;
export const addImportTransportationRecord = addNaqllGumrgRecord;
export const updateImportTransportationRecord = updateNaqllGumrgRecord;
export const deleteNaqllGumrgRecord = deleteImportTransportationRecord;
