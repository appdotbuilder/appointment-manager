
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type UpdatePatientStatusInput } from '../schema';
import { updatePatientStatus } from '../handlers/update_patient_status';
import { eq } from 'drizzle-orm';

// Test input for creating a patient
const testPatientData = {
  full_name: 'John Doe',
  id_number: '1234567890',
  consultation_room: 3,
  arrival_time: new Date(),
  status: 'waiting' as const
};

describe('updatePatientStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update patient status successfully', async () => {
    // Create a test patient first
    const createResult = await db.insert(patientsTable)
      .values(testPatientData)
      .returning()
      .execute();

    const createdPatient = createResult[0];
    const originalUpdatedAt = createdPatient.updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update patient status
    const updateInput: UpdatePatientStatusInput = {
      patient_id: createdPatient.id,
      status: 'in_consultation'
    };

    const result = await updatePatientStatus(updateInput);

    // Verify the update
    expect(result.id).toEqual(createdPatient.id);
    expect(result.full_name).toEqual(testPatientData.full_name);
    expect(result.id_number).toEqual(testPatientData.id_number);
    expect(result.consultation_room).toEqual(testPatientData.consultation_room);
    expect(result.status).toEqual('in_consultation');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > originalUpdatedAt).toBe(true);
  });

  it('should save updated status to database', async () => {
    // Create a test patient first
    const createResult = await db.insert(patientsTable)
      .values(testPatientData)
      .returning()
      .execute();

    const createdPatient = createResult[0];

    // Update patient status to completed
    const updateInput: UpdatePatientStatusInput = {
      patient_id: createdPatient.id,
      status: 'completed'
    };

    await updatePatientStatus(updateInput);

    // Verify in database
    const patients = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, createdPatient.id))
      .execute();

    expect(patients).toHaveLength(1);
    expect(patients[0].status).toEqual('completed');
    expect(patients[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle all valid status transitions', async () => {
    // Create a test patient
    const createResult = await db.insert(patientsTable)
      .values(testPatientData)
      .returning()
      .execute();

    const createdPatient = createResult[0];

    // Test each status transition
    const statuses = ['in_consultation', 'completed', 'cancelled'] as const;

    for (const status of statuses) {
      const updateInput: UpdatePatientStatusInput = {
        patient_id: createdPatient.id,
        status: status
      };

      const result = await updatePatientStatus(updateInput);
      expect(result.status).toEqual(status);
      expect(result.updated_at).toBeInstanceOf(Date);
    }
  });

  it('should throw error for non-existent patient', async () => {
    const updateInput: UpdatePatientStatusInput = {
      patient_id: 99999, // Non-existent ID
      status: 'in_consultation'
    };

    await expect(updatePatientStatus(updateInput)).rejects.toThrow(/Patient with ID 99999 not found/i);
  });
});
