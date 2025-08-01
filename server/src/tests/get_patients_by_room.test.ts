
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type GetPatientsByRoomInput, type AddPatientInput } from '../schema';
import { getPatientsByRoom } from '../handlers/get_patients_by_room';

// Test input for room query
const testInput: GetPatientsByRoomInput = {
  consultation_room: 1
};

// Helper function to create test patients
const createTestPatient = async (patientData: AddPatientInput) => {
  const result = await db.insert(patientsTable)
    .values({
      full_name: patientData.full_name,
      id_number: patientData.id_number,
      consultation_room: patientData.consultation_room,
      arrival_time: patientData.arrival_time || new Date(),
      status: 'waiting'
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('getPatientsByRoom', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return patients for specific room', async () => {
    // Create patients in different rooms
    await createTestPatient({
      full_name: 'John Doe',
      id_number: '123456789',
      consultation_room: 1
    });

    await createTestPatient({
      full_name: 'Jane Smith', 
      id_number: '987654321',
      consultation_room: 2
    });

    await createTestPatient({
      full_name: 'Bob Wilson',
      id_number: '555666777',
      consultation_room: 1
    });

    const result = await getPatientsByRoom(testInput);

    // Should return only patients from room 1
    expect(result).toHaveLength(2);
    expect(result[0].full_name).toEqual('John Doe');
    expect(result[0].consultation_room).toEqual(1);
    expect(result[1].full_name).toEqual('Bob Wilson');
    expect(result[1].consultation_room).toEqual(1);
  });

  it('should return empty array for room with no patients', async () => {
    // Create patients in room 2 only
    await createTestPatient({
      full_name: 'Test Patient',
      id_number: '111222333',
      consultation_room: 2
    });

    const result = await getPatientsByRoom(testInput);

    expect(result).toHaveLength(0);
  });

  it('should order patients by arrival time', async () => {
    const earlierTime = new Date('2024-01-01T09:00:00Z');
    const laterTime = new Date('2024-01-01T10:00:00Z');

    // Create patients with specific arrival times (out of order)
    await createTestPatient({
      full_name: 'Second Patient',
      id_number: '222333444',
      consultation_room: 1,
      arrival_time: laterTime
    });

    await createTestPatient({
      full_name: 'First Patient',
      id_number: '111222333',
      consultation_room: 1,
      arrival_time: earlierTime
    });

    const result = await getPatientsByRoom(testInput);

    expect(result).toHaveLength(2);
    // Should be ordered by arrival time (earliest first)
    expect(result[0].full_name).toEqual('First Patient');
    expect(result[0].arrival_time).toEqual(earlierTime);
    expect(result[1].full_name).toEqual('Second Patient');
    expect(result[1].arrival_time).toEqual(laterTime);
  });

  it('should include all patient fields', async () => {
    await createTestPatient({
      full_name: 'Complete Patient',
      id_number: '999888777',
      consultation_room: 1
    });

    const result = await getPatientsByRoom(testInput);

    expect(result).toHaveLength(1);
    const patient = result[0];
    
    expect(patient.id).toBeDefined();
    expect(patient.full_name).toEqual('Complete Patient');
    expect(patient.id_number).toEqual('999888777');
    expect(patient.consultation_room).toEqual(1);
    expect(patient.arrival_time).toBeInstanceOf(Date);
    expect(patient.status).toEqual('waiting');
    expect(patient.created_at).toBeInstanceOf(Date);
    expect(patient.updated_at).toBeInstanceOf(Date);
  });
});
