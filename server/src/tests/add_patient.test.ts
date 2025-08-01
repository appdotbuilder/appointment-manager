
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type AddPatientInput } from '../schema';
import { addPatient } from '../handlers/add_patient';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: AddPatientInput = {
  full_name: 'John Doe',
  id_number: '1234567890',
  consultation_room: 5,
  arrival_time: new Date('2024-01-15T10:30:00Z')
};

describe('addPatient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a patient with provided arrival time', async () => {
    const result = await addPatient(testInput);

    // Basic field validation
    expect(result.full_name).toEqual('John Doe');
    expect(result.id_number).toEqual('1234567890');
    expect(result.consultation_room).toEqual(5);
    expect(result.arrival_time).toEqual(testInput.arrival_time!);
    expect(result.status).toEqual('waiting');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a patient with current time when arrival_time not provided', async () => {
    const inputWithoutTime: AddPatientInput = {
      full_name: 'Jane Smith',
      id_number: '0987654321',
      consultation_room: 3
    };

    const beforeCreate = new Date();
    const result = await addPatient(inputWithoutTime);
    const afterCreate = new Date();

    expect(result.full_name).toEqual('Jane Smith');
    expect(result.id_number).toEqual('0987654321');
    expect(result.consultation_room).toEqual(3);
    expect(result.status).toEqual('waiting');
    expect(result.arrival_time).toBeInstanceOf(Date);
    expect(result.arrival_time.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.arrival_time.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });

  it('should save patient to database', async () => {
    const result = await addPatient(testInput);

    // Query using proper drizzle syntax
    const patients = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, result.id))
      .execute();

    expect(patients).toHaveLength(1);
    expect(patients[0].full_name).toEqual('John Doe');
    expect(patients[0].id_number).toEqual('1234567890');
    expect(patients[0].consultation_room).toEqual(5);
    expect(patients[0].status).toEqual('waiting');
    expect(patients[0].arrival_time).toEqual(testInput.arrival_time!);
    expect(patients[0].created_at).toBeInstanceOf(Date);
    expect(patients[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle different consultation rooms correctly', async () => {
    const roomTestInputs: AddPatientInput[] = [
      { ...testInput, consultation_room: 1 },
      { ...testInput, consultation_room: 8 }
    ];

    for (const input of roomTestInputs) {
      const result = await addPatient(input);
      expect(result.consultation_room).toEqual(input.consultation_room);
      expect(result.status).toEqual('waiting');
    }

    // Verify both patients are saved
    const allPatients = await db.select()
      .from(patientsTable)
      .execute();

    expect(allPatients).toHaveLength(2);
    expect(allPatients.map(p => p.consultation_room).sort()).toEqual([1, 8]);
  });
});
