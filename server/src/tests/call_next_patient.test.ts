
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type GetPatientsByRoomInput, type AddPatientInput } from '../schema';
import { callNextPatient } from '../handlers/call_next_patient';
import { eq, and } from 'drizzle-orm';

// Helper function to create test patient
const createTestPatient = async (patientData: Partial<AddPatientInput> & { status?: 'waiting' | 'in_consultation' | 'completed' | 'cancelled' }) => {
  const defaultPatient = {
    full_name: 'Test Patient',
    id_number: '1234567890',
    consultation_room: 1,
    arrival_time: new Date(),
    status: 'waiting' as const,
    ...patientData
  };

  const result = await db.insert(patientsTable)
    .values({
      full_name: defaultPatient.full_name,
      id_number: defaultPatient.id_number,
      consultation_room: defaultPatient.consultation_room,
      arrival_time: defaultPatient.arrival_time,
      status: defaultPatient.status
    })
    .returning()
    .execute();

  return result[0];
};

describe('callNextPatient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should call the next waiting patient for the specified room', async () => {
    // Create a waiting patient in room 1
    const testPatient = await createTestPatient({
      full_name: 'John Doe',
      id_number: '1234567890',
      consultation_room: 1
    });

    const input: GetPatientsByRoomInput = {
      consultation_room: 1
    };

    const result = await callNextPatient(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testPatient.id);
    expect(result!.full_name).toEqual('John Doe');
    expect(result!.status).toEqual('in_consultation');
    expect(result!.consultation_room).toEqual(1);
  });

  it('should return null when no waiting patients exist for the room', async () => {
    const input: GetPatientsByRoomInput = {
      consultation_room: 1
    };

    const result = await callNextPatient(input);

    expect(result).toBeNull();
  });

  it('should call the oldest waiting patient first based on arrival time', async () => {
    // Create two patients with different arrival times
    const earlierTime = new Date('2024-01-01T09:00:00Z');
    const laterTime = new Date('2024-01-01T10:00:00Z');

    const olderPatient = await createTestPatient({
      full_name: 'Older Patient',
      id_number: '1111111111',
      consultation_room: 1,
      arrival_time: earlierTime
    });

    const newerPatient = await createTestPatient({
      full_name: 'Newer Patient',
      id_number: '2222222222',
      consultation_room: 1,
      arrival_time: laterTime
    });

    const input: GetPatientsByRoomInput = {
      consultation_room: 1
    };

    const result = await callNextPatient(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(olderPatient.id);
    expect(result!.full_name).toEqual('Older Patient');
    expect(result!.status).toEqual('in_consultation');
  });

  it('should only call patients from the specified consultation room', async () => {
    // Create patients in different rooms
    await createTestPatient({
      full_name: 'Patient Room 1',
      id_number: '1111111111',
      consultation_room: 1
    });

    await createTestPatient({
      full_name: 'Patient Room 2',
      id_number: '2222222222',
      consultation_room: 2
    });

    const input: GetPatientsByRoomInput = {
      consultation_room: 2
    };

    const result = await callNextPatient(input);

    expect(result).not.toBeNull();
    expect(result!.full_name).toEqual('Patient Room 2');
    expect(result!.consultation_room).toEqual(2);
  });

  it('should not call patients with cancelled status', async () => {
    // Create a cancelled patient
    await createTestPatient({
      full_name: 'Cancelled Patient',
      id_number: '1111111111',
      consultation_room: 1,
      status: 'cancelled'
    });

    const input: GetPatientsByRoomInput = {
      consultation_room: 1
    };

    const result = await callNextPatient(input);

    expect(result).toBeNull();
  });

  it('should not call patients already in consultation or completed', async () => {
    // Create patients with different statuses
    await createTestPatient({
      full_name: 'In Consultation Patient',
      id_number: '1111111111',
      consultation_room: 1,
      status: 'in_consultation'
    });

    await createTestPatient({
      full_name: 'Completed Patient',
      id_number: '2222222222',
      consultation_room: 1,
      status: 'completed'
    });

    const input: GetPatientsByRoomInput = {
      consultation_room: 1
    };

    const result = await callNextPatient(input);

    expect(result).toBeNull();
  });

  it('should update the patient status in the database', async () => {
    const testPatient = await createTestPatient({
      full_name: 'John Doe',
      id_number: '1234567890',
      consultation_room: 1
    });

    const input: GetPatientsByRoomInput = {
      consultation_room: 1
    };

    await callNextPatient(input);

    // Verify the patient status was updated in the database
    const updatedPatients = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, testPatient.id))
      .execute();

    expect(updatedPatients).toHaveLength(1);
    expect(updatedPatients[0].status).toEqual('in_consultation');
    expect(updatedPatients[0].updated_at).toBeInstanceOf(Date);
  });

  it('should skip waiting patients from other rooms', async () => {
    const earlierTime = new Date('2024-01-01T09:00:00Z');
    const laterTime = new Date('2024-01-01T10:00:00Z');

    // Create older patient in room 2
    await createTestPatient({
      full_name: 'Older Patient Room 2',
      id_number: '1111111111',
      consultation_room: 2,
      arrival_time: earlierTime
    });

    // Create newer patient in room 1
    const room1Patient = await createTestPatient({
      full_name: 'Newer Patient Room 1',
      id_number: '2222222222',
      consultation_room: 1,
      arrival_time: laterTime
    });

    const input: GetPatientsByRoomInput = {
      consultation_room: 1
    };

    const result = await callNextPatient(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(room1Patient.id);
    expect(result!.full_name).toEqual('Newer Patient Room 1');
    expect(result!.consultation_room).toEqual(1);
  });
});
