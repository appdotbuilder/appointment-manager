
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type AddPatientInput } from '../schema';
import { getWaitingPatients } from '../handlers/get_waiting_patients';

describe('getWaitingPatients', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no waiting patients exist', async () => {
    const result = await getWaitingPatients();
    expect(result).toEqual([]);
  });

  it('should return only patients with waiting status', async () => {
    // Create test patients with different statuses
    const baseTime = new Date('2024-01-01T10:00:00Z');
    
    await db.insert(patientsTable).values([
      {
        full_name: 'John Doe',
        id_number: '12345',
        consultation_room: 1,
        arrival_time: baseTime,
        status: 'waiting'
      },
      {
        full_name: 'Jane Smith',
        id_number: '67890',
        consultation_room: 2,
        arrival_time: new Date(baseTime.getTime() + 60000), // 1 minute later
        status: 'in_consultation'
      },
      {
        full_name: 'Bob Johnson',
        id_number: '11111',
        consultation_room: 3,
        arrival_time: new Date(baseTime.getTime() + 120000), // 2 minutes later
        status: 'waiting'
      }
    ]).execute();

    const result = await getWaitingPatients();

    expect(result).toHaveLength(2);
    expect(result.every(patient => patient.status === 'waiting')).toBe(true);
    expect(result.map(p => p.full_name)).toContain('John Doe');
    expect(result.map(p => p.full_name)).toContain('Bob Johnson');
    expect(result.map(p => p.full_name)).not.toContain('Jane Smith');
  });

  it('should return patients ordered by arrival time', async () => {
    // Create patients with different arrival times
    const baseTime = new Date('2024-01-01T10:00:00Z');
    
    await db.insert(patientsTable).values([
      {
        full_name: 'Third Patient',
        id_number: '33333',
        consultation_room: 1,
        arrival_time: new Date(baseTime.getTime() + 120000), // Latest arrival
        status: 'waiting'
      },
      {
        full_name: 'First Patient',
        id_number: '11111',
        consultation_room: 2,
        arrival_time: baseTime, // Earliest arrival
        status: 'waiting'
      },
      {
        full_name: 'Second Patient',
        id_number: '22222',
        consultation_room: 3,
        arrival_time: new Date(baseTime.getTime() + 60000), // Middle arrival
        status: 'waiting'
      }
    ]).execute();

    const result = await getWaitingPatients();

    expect(result).toHaveLength(3);
    expect(result[0].full_name).toBe('First Patient');
    expect(result[1].full_name).toBe('Second Patient');
    expect(result[2].full_name).toBe('Third Patient');
    
    // Verify chronological order
    expect(result[0].arrival_time.getTime()).toBeLessThan(result[1].arrival_time.getTime());
    expect(result[1].arrival_time.getTime()).toBeLessThan(result[2].arrival_time.getTime());
  });

  it('should return correct patient data structure', async () => {
    await db.insert(patientsTable).values({
      full_name: 'Test Patient',
      id_number: '54321',
      consultation_room: 5,
      arrival_time: new Date('2024-01-01T10:00:00Z'),
      status: 'waiting'
    }).execute();

    const result = await getWaitingPatients();

    expect(result).toHaveLength(1);
    const patient = result[0];
    
    expect(patient.id).toBeDefined();
    expect(patient.full_name).toBe('Test Patient');
    expect(patient.id_number).toBe('54321');
    expect(patient.consultation_room).toBe(5);
    expect(patient.arrival_time).toBeInstanceOf(Date);
    expect(patient.status).toBe('waiting');
    expect(patient.created_at).toBeInstanceOf(Date);
    expect(patient.updated_at).toBeInstanceOf(Date);
  });
});
