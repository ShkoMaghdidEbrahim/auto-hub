import { supabase } from '../supabase';
import { getCustomers } from './CustomersApi';
import { getSizesEnum } from './CarsApi';

export const getRegistrations = async () => {
  try {
    // Fetch all data in parallel
    const [registrations, customers, vehicleSizes] = await Promise.all([
      supabase
        .from('vehicle_registrations')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false }),
      getCustomers(),
      getSizesEnum()
    ]);

    if (registrations.error) {
      console.error('Error fetching registrations:', registrations.error);
      throw registrations.error;
    }

    // Manually join the data
    const enrichedRegistrations = registrations.data.map((registration) => {
      const customer = customers.find(
        (customer) => customer.id === registration.customer_id
      );
      const vehicleSize = vehicleSizes.find(
        (size) => size.id === registration.vehicle_size
      );

      return {
        ...registration,
        customers: customer || null,
        vehicle_size_types: vehicleSize || null
      };
    });

    return enrichedRegistrations;
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
};

export const addRegistration = async (registrationData) => {
  const { data, error } = await supabase
    .from('vehicle_registrations')
    .insert([registrationData])
    .select()
    .single();

  if (error) {
    console.error('Error creating registration:', error);
    throw error;
  }

  return data;
};

export const updateRegistration = async (registrationId, registrationData) => {
  const { data, error } = await supabase
    .from('vehicle_registrations')
    .update(registrationData)
    .eq('id', registrationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating registration:', error);
    throw error;
  }

  return data;
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
