
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type PublicPatientDisplay } from '../schema';
import { or, eq } from 'drizzle-orm';

export async function getPublicDisplay(): Promise<PublicPatientDisplay[]> {
  try {
    // Query patients with status 'waiting' or 'in_consultation'
    const patients = await db.select()
      .from(patientsTable)
      .where(
        or(
          eq(patientsTable.status, 'waiting'),
          eq(patientsTable.status, 'in_consultation')
        )
      )
      .execute();

    // Transform to public display format
    return patients.map(patient => ({
      id_last_three: patient.id_number.slice(-3),
      full_name: patient.full_name,
      consultation_room: patient.consultation_room,
      status: patient.status
    }));
  } catch (error) {
    console.error('Failed to fetch public display data:', error);
    throw error;
  }
}
