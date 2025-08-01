
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type GetPatientsByRoomInput, type Patient } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getPatientsByRoom = async (input: GetPatientsByRoomInput): Promise<Patient[]> => {
  try {
    // Query patients for specific consultation room, ordered by arrival time
    const results = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.consultation_room, input.consultation_room))
      .orderBy(asc(patientsTable.arrival_time))
      .execute();

    // Return results (no numeric conversions needed for this table)
    return results;
  } catch (error) {
    console.error('Failed to get patients by room:', error);
    throw error;
  }
};
