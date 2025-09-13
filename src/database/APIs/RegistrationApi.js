import { supabase } from '../supabase';
import { getCustomers } from './CustomersApi';
import { getSizesEnum } from './CarsApi';

export const getRegistrations = async () => {
  try {
    const [registrations, customers, vehicleSizes, batches] = await Promise.all(
      [
        supabase
          .from('vehicle_registrations')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false }),
        getCustomers(),
        getSizesEnum(),
        supabase.from('batches').select('*')
      ]
    );

    if (registrations.error) {
      console.error('Error fetching registrations:', registrations.error);
      throw registrations.error;
    }

    if (batches.error) {
      console.error('Error fetching batches:', batches.error);
      throw batches.error;
    }

    const enrichedRegistrations = registrations.data.map((registration) => {
      const customer = customers.find(
        (customer) => customer.id === registration.customer_id
      );
      const vehicleSize = vehicleSizes.find(
        (size) => size.id === registration.vehicle_size
      );
      const batch = batches.data.find((b) => b.id === registration.batch_id);

      return {
        ...registration,
        customer: customer || null,
        vehicle_size_type: vehicleSize || null,
        batch: batch || null
      };
    });

    console.log(enrichedRegistrations);
    return enrichedRegistrations;
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
};

export const addRegistration = async (registrationData, otherData) => {
  let batchId = otherData.batch_id;

  if (!otherData.old_batch) {
    // Generate batch name if not provided
    let batchName = otherData.batch_name;

    if (!batchName || batchName.trim() === '') {
      // Get existing batches for this customer to count them
      const { data: existingBatches, error: countError } = await supabase
        .from('batches')
        .select('id')
        .eq('customer_id', registrationData.customer_id || null)
        .eq('batch_type', 'vehicle_registration');

      if (countError) {
        console.error('Error counting existing batches:', countError);
        throw countError;
      }

      const batchNumber = (existingBatches?.length || 0) + 1;
      batchName = `Batch ${batchNumber}`;
    }

    const { data: newBatch, error: batchError } = await supabase
      .from('batches')
      .insert([
        {
          name: batchName,
          batch_type: 'vehicle_registration',
          customer_id: registrationData.customer_id || null
        }
      ])
      .select()
      .single();

    if (batchError) {
      console.error('Error creating batch:', batchError);
      throw batchError;
    }

    batchId = newBatch.id;
  }

  const { data: registration, error: regError } = await supabase
    .from('vehicle_registrations')
    .insert([
      {
        ...registrationData,
        batch_id: batchId
      }
    ])
    .select()
    .single();

  if (regError) {
    console.error('Error creating registration:', regError);
    throw regError;
  }

  let transactionAmount = otherData.has_debt
    ? Math.round(otherData.paid_amount || 0)
    : Math.round(registration.total || 0);

  if (transactionAmount > 0) {
    const { error: trxError } = await supabase.from('transactions').insert([
      {
        batch_id: batchId,
        context_type: 'vehicle_registration',
        context_id: registration.id,
        amount_iqd: transactionAmount,
        note: otherData.has_debt
          ? 'Partial payment (loan) on new registration'
          : 'Full payment (no debt) on new registration'
      }
    ]);

    if (trxError) {
      console.error('Error creating transaction:', trxError);
      throw trxError;
    }
  }

  return registration;
};

export const updateRegistration = async (
  registrationId,
  registrationData,
  otherData
) => {
  // 1️⃣ Fetch existing registration (to check old batch)
  const { data: oldRegistration, error: fetchError } = await supabase
    .from('vehicle_registrations')
    .select('id, batch_id')
    .eq('id', registrationId)
    .single();

  if (fetchError) {
    console.error('Error fetching old registration:', fetchError);
    throw fetchError;
  }

  const oldBatchId = oldRegistration.batch_id;
  let newBatchId = otherData.batch_id || oldBatchId;

  // 2️⃣ If user wants a new batch, create it
  if (otherData.batch_name || !otherData.old_batch) {
    let batchName = otherData.batch_name;

    if (!batchName || batchName.trim() === '') {
      // Get existing batches for this customer to count them
      const { data: existingBatches, error: countError } = await supabase
        .from('batches')
        .select('id')
        .eq('customer_id', registrationData.customer_id || null)
        .eq('batch_type', 'vehicle_registration');

      if (countError) {
        console.error('Error counting existing batches:', countError);
        throw countError;
      }

      const batchNumber = (existingBatches?.length || 0) + 1;
      batchName = `Batch ${batchNumber}`;
    }
    const { data: newBatch, error: batchError } = await supabase
      .from('batches')
      .insert([
        {
          name: otherData.batch_name || batchName,
          batch_type: 'vehicle_registration',
          customer_id: registrationData.customer_id || null
        }
      ])
      .select()
      .single();

    if (batchError) {
      console.error('Error creating new batch:', batchError);
      throw batchError;
    }

    newBatchId = newBatch.id;
  }

  // 3️⃣ Update registration with possibly new batch_id
  const { data: updatedRegistration, error: updateError } = await supabase
    .from('vehicle_registrations')
    .update({
      ...registrationData,
      batch_id: newBatchId
    })
    .eq('id', registrationId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating registration:', updateError);
    throw updateError;
  }

  // 4️⃣ If batch changed → move transactions
  if (oldBatchId !== newBatchId) {
    const { error: trxUpdateError } = await supabase
      .from('transactions')
      .update({
        batch_id: newBatchId
      })
      .eq('context_type', 'vehicle_registration')
      .eq('context_id', registrationId);

    if (trxUpdateError) {
      console.error('Error moving transactions to new batch:', trxUpdateError);
      throw trxUpdateError;
    }
  }

  return updatedRegistration;
};

export const deleteRegistration = async (registrationId) => {
  const { error } = await supabase
    .from('vehicle_registrations')
    .update({ is_deleted: true })
    .eq('id', registrationId);

  if (error) {
    console.error('Error deleting registration:', error);
    throw error;
  }
};

export const getCustomerBatches = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('customer_id', customerId)
      .eq('batch_type', 'vehicle_registration')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer batches:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching customer batches:', error);
    throw error;
  }
};
