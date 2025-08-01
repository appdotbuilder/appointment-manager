
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type AddPatientInput, type Patient } from '../schema';

export const addPatient = async (input: AddPatientInput): Promise<Patient> => {
  try {
    // Use current time if arrival_time is not provided
    const arrivalTime = input.arrival_time || new Date();

    // Insert patient record with 'waiting' status as default
    const result = await db.insert(patientsTable)
      .values({
        full_name: input.full_name,
        id_number: input.id_number,
        consultation_room: input.consultation_room,
        arrival_time: arrivalTime,
        status: 'waiting' // Default status for new patients
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Patient creation failed:', error);
    throw error;
  }
};
