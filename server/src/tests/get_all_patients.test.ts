
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type AddPatientInput } from '../schema';
import { getAllPatients } from '../handlers/get_all_patients';

// Test patient data
const testPatients: AddPatientInput[] = [
  {
    full_name: 'John Smith',
    id_number: '1234567890',
    consultation_room: 1,
    arrival_time: new Date('2024-01-01T10:00:00Z')
  },
  {
    full_name: 'Jane Doe',
    id_number: '0987654321',
    consultation_room: 2,
    arrival_time: new Date('2024-01-01T09:30:00Z')
  },
  {
    full_name: 'Bob Johnson',
    id_number: '5555555555',
    consultation_room: 1,
    arrival_time: new Date('2024-01-01T10:15:00Z')
  }
];

describe('getAllPatients', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no patients exist', async () => {
    const result = await getAllPatients();
    expect(result).toEqual([]);
  });

  it('should return all patients ordered by arrival time', async () => {
    // Insert test patients
    for (const patient of testPatients) {
      await db.insert(patientsTable)
        .values({
          full_name: patient.full_name,
          id_number: patient.id_number,
          consultation_room: patient.consultation_room,
          arrival_time: patient.arrival_time!
        })
        .execute();
    }

    const result = await getAllPatients();

    expect(result).toHaveLength(3);
    
    // Verify order by arrival time (earliest first)
    expect(result[0].full_name).toEqual('Jane Doe'); // 09:30
    expect(result[1].full_name).toEqual('John Smith'); // 10:00
    expect(result[2].full_name).toEqual('Bob Johnson'); // 10:15

    // Verify all fields are present
    result.forEach(patient => {
      expect(patient.id).toBeDefined();
      expect(patient.full_name).toBeDefined();
      expect(patient.id_number).toBeDefined();
      expect(patient.consultation_room).toBeGreaterThanOrEqual(1);
      expect(patient.consultation_room).toBeLessThanOrEqual(8);
      expect(patient.arrival_time).toBeInstanceOf(Date);
      expect(patient.status).toBeDefined();
      expect(patient.created_at).toBeInstanceOf(Date);
      expect(patient.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return patients with different statuses', async () => {
    // Insert patients with different statuses
    await db.insert(patientsTable)
      .values({
        full_name: 'Waiting Patient',
        id_number: '1111111111',
        consultation_room: 1,
        arrival_time: new Date('2024-01-01T10:00:00Z'),
        status: 'waiting'
      })
      .execute();

    await db.insert(patientsTable)
      .values({
        full_name: 'In Consultation Patient',
        id_number: '2222222222',
        consultation_room: 2,
        arrival_time: new Date('2024-01-01T09:30:00Z'),
        status: 'in_consultation'
      })
      .execute();

    await db.insert(patientsTable)
      .values({
        full_name: 'Completed Patient',
        id_number: '3333333333',
        consultation_room: 3,
        arrival_time: new Date('2024-01-01T10:15:00Z'),
        status: 'completed'
      })
      .execute();

    const result = await getAllPatients();

    expect(result).toHaveLength(3);
    
    // Should still be ordered by arrival time regardless of status
    expect(result[0].full_name).toEqual('In Consultation Patient');
    expect(result[0].status).toEqual('in_consultation');
    
    expect(result[1].full_name).toEqual('Waiting Patient');
    expect(result[1].status).toEqual('waiting');
    
    expect(result[2].full_name).toEqual('Completed Patient');
    expect(result[2].status).toEqual('completed');
  });
});
