
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type UpdatePatientStatusInput, type Patient } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePatientStatus = async (input: UpdatePatientStatusInput): Promise<Patient> => {
  try {
    // Update patient status and updated_at timestamp
    const result = await db.update(patientsTable)
      .set({
        status: input.status,
        updated_at: new Date()
      })
      .where(eq(patientsTable.id, input.patient_id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Patient with ID ${input.patient_id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Patient status update failed:', error);
    throw error;
  }
};
