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

    // Manually join the data
    const enrichedRecords = importTransportationRecords.data.map((record) => {
      const customer = customers.find(
        (customer) => customer.id === record.customer_id
      );
      return {
        ...record,
        customer: customer || null,
        batch: record.batches || null
      };
    });

    return enrichedRecords;
  } catch (error) {
    console.error('Error fetching import transportation records:', error);
    throw error;
  }
};

// Add new record with proper batch and transaction handling
export const addNaqllGumrgRecord = async (recordData, otherData) => {
  try {
    let batchId = null;

    // Handle batch creation/selection
    if (otherData && otherData.old_batch && otherData.batch_id) {
      // Use existing batch
      batchId = otherData.batch_id;
    } else if (otherData && !otherData.old_batch) {
      // Generate batch name if not provided
      let batchName = otherData.batch_name;

      if (!batchName || batchName.trim() === '') {
        // Get existing batches for this customer to count them
        const { data: existingBatches, error: countError } = await supabase
          .from('batches')
          .select('id')
          .eq('customer_id', recordData.customer_id)
          .eq('batch_type', 'import_and_transportation');

        if (countError) {
          console.error('Error counting existing batches:', countError);
          throw countError;
        }

        const batchNumber = (existingBatches?.length || 0) + 1;
        batchName = `Batch ${batchNumber}`;
      }

      // Create new batch
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .insert({
          customer_id: recordData.customer_id,
          batch_type: 'import_and_transportation',
          name: batchName
        })
        .select()
        .single();

      if (batchError) {
        console.error('Error creating batch:', batchError);
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

    // Handle transactions - calculate transaction amount based on debt status
    const transactionAmountUsd = otherData.has_debt
      ? Math.round((otherData.paid_amount_usd || 0) * 100) / 100
      : Math.round((finalRecordData.total_usd || 0) * 100) / 100;

    const transactionAmountIqd = otherData.has_debt
      ? Math.round(otherData.paid_amount_iqd || 0)
      : Math.round(finalRecordData.total_iqd || 0);

    if (transactionAmountUsd > 0 || transactionAmountIqd > 0) {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          batch_id: batchId,
          amount_usd: transactionAmountUsd,
          amount_iqd: transactionAmountIqd,
          context_type: 'import_and_transportation',
          context_id: data.id,
          note: otherData.has_debt
            ? 'Partial payment (with debt) for import and transportation'
            : 'Full payment (no debt) for import and transportation'
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

// Update record with proper batch and transaction handling
export const updateNaqllGumrgRecord = async (
  recordId,
  recordData,
  otherData
) => {
  try {
    // Fetch existing record to check old batch
    const { data: oldRecord, error: fetchError } = await supabase
      .from('import_and_transportation')
      .select('id, batch_id')
      .eq('id', recordId)
      .single();

    if (fetchError) {
      console.error('Error fetching old record:', fetchError);
      throw fetchError;
    }

    const oldBatchId = oldRecord.batch_id;
    let newBatchId = otherData.batch_id || oldBatchId;

    // Handle batch updates if needed
    if (otherData && !otherData.old_batch && otherData.batch_name) {
      // Create new batch if switching to new batch
      let batchName = otherData.batch_name;

      if (!batchName || batchName.trim() === '') {
        // Get existing batches for this customer to count them
        const { data: existingBatches, error: countError } = await supabase
          .from('batches')
          .select('id')
          .eq('customer_id', recordData.customer_id)
          .eq('batch_type', 'import_and_transportation');

        if (countError) {
          console.error('Error counting existing batches:', countError);
          throw countError;
        }

        const batchNumber = (existingBatches?.length || 0) + 1;
        batchName = `Batch ${batchNumber}`;
      }

      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .insert({
          customer_id: recordData.customer_id,
          batch_type: 'import_and_transportation',
          name: batchName
        })
        .select()
        .single();

      if (batchError) {
        console.error('Error creating new batch:', batchError);
        throw batchError;
      }
      newBatchId = batchData.id;
    } else if (otherData && otherData.old_batch && otherData.batch_id) {
      newBatchId = otherData.batch_id;
    }

    const finalRecordData = {
      ...recordData,
      batch_id: newBatchId,
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

    // If batch changed, move transactions
    if (oldBatchId !== newBatchId) {
      const { error: trxUpdateError } = await supabase
        .from('transactions')
        .update({
          batch_id: newBatchId
        })
        .eq('context_type', 'import_and_transportation')
        .eq('context_id', recordId);

      if (trxUpdateError) {
        console.error('Error moving transactions to new batch:', trxUpdateError);
        throw trxUpdateError;
      }
    }

    return data;
  } catch (error) {
    console.error('Error in updateNaqllGumrgRecord:', error);
    throw error;
  }
};

// Delete record (soft delete)
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