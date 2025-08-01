
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type GetPatientsByRoomInput, type Patient } from '../schema';
import { eq, and, asc } from 'drizzle-orm';

export async function callNextPatient(input: GetPatientsByRoomInput): Promise<Patient | null> {
  try {
    // Find the oldest waiting patient for the specified room
    const waitingPatients = await db.select()
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.consultation_room, input.consultation_room),
          eq(patientsTable.status, 'waiting')
        )
      )
      .orderBy(asc(patientsTable.arrival_time))
      .limit(1)
      .execute();

    // Return null if no waiting patients found
    if (waitingPatients.length === 0) {
      return null;
    }

    const nextPatient = waitingPatients[0];

    // Update the patient's status to 'in_consultation'
    const updatedPatients = await db.update(patientsTable)
      .set({ 
        status: 'in_consultation',
        updated_at: new Date()
      })
      .where(eq(patientsTable.id, nextPatient.id))
      .returning()
      .execute();

    return updatedPatients[0];
  } catch (error) {
    console.error('Call next patient failed:', error);
    throw error;
  }
}
