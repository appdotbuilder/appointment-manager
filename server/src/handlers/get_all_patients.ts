
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type Patient } from '../schema';
import { asc } from 'drizzle-orm';

export async function getAllPatients(): Promise<Patient[]> {
  try {
    const results = await db.select()
      .from(patientsTable)
      .orderBy(asc(patientsTable.arrival_time))
      .execute();

    // Return results directly - no numeric conversions needed for this table
    return results;
  } catch (error) {
    console.error('Failed to get all patients:', error);
    throw error;
  }
}
