import { supabase } from '../supabase.js';

export const getCustomerActivities = async (customerId) => {
  try {
    const { data: batches, error } = await supabase
      .from('batches')
      .select(
        `
        id,
        name,
        batch_type,
        created_at,
        transactions (
          id,
          amount_iqd,
          amount_usd,
          note,
          created_at
        ),
        import_and_transportation (
          id,
          total_usd,
          total_iqd
        ),
        vehicle_registrations (
          id,
          total
        )
      `
      )
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const num = (val) => (val ? Number(val) : 0);

    const activities = batches.map((batch) => {
      const paidUsd = batch.transactions.reduce(
        (sum, t) => sum + num(t.amount_usd),
        0
      );
      const paidIqd = batch.transactions.reduce(
        (sum, t) => sum + num(t.amount_iqd),
        0
      );

      const totalImportUsd = batch.import_and_transportation.reduce(
        (sum, r) => sum + num(r.total_usd),
        0
      );
      const totalImportIqd = batch.import_and_transportation.reduce(
        (sum, r) => sum + num(r.total_iqd),
        0
      );

      const totalVehicleRegs = batch.vehicle_registrations.reduce(
        (sum, v) => sum + num(v.total),
        0
      );

      const totalUsd = totalImportUsd;
      const totalIqd = totalImportIqd + totalVehicleRegs;

      const outstandingUsd = totalUsd - paidUsd;
      const outstandingIqd = totalIqd - paidIqd;

      return {
        batchId: batch.id,
        batchName: batch.name,
        batchType: batch.batch_type,
        createdAt: batch.created_at,
        totals: { usd: totalUsd, iqd: totalIqd },
        paid: { usd: paidUsd, iqd: paidIqd },
        outstanding: { usd: outstandingUsd, iqd: outstandingIqd },
        isPaid: outstandingUsd <= 0 && outstandingIqd <= 0,
        transactionsList: batch.transactions,
        importsList: batch.import_and_transportation,
        registrationsList: batch.vehicle_registrations
      };
    });

    return activities;
  } catch (err) {
    console.error('Error fetching customer activities:', err);
    return [];
  }
};
