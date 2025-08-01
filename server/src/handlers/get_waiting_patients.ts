
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type Patient } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getWaitingPatients(): Promise<Patient[]> {
  try {
    const results = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.status, 'waiting'))
      .orderBy(asc(patientsTable.arrival_time))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch waiting patients:', error);
    throw error;
  }
}
