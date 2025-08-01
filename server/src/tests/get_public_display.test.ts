
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { getPublicDisplay } from '../handlers/get_public_display';

describe('getPublicDisplay', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return patients with waiting and in_consultation status', async () => {
    // Create test patients with different statuses
    await db.insert(patientsTable).values([
      {
        full_name: 'John Doe',
        id_number: '1234567890',
        consultation_room: 1,
        arrival_time: new Date(),
        status: 'waiting'
      },
      {
        full_name: 'Jane Smith',
        id_number: '0987654321',
        consultation_room: 2,
        arrival_time: new Date(),
        status: 'in_consultation'
      },
      {
        full_name: 'Bob Johnson',
        id_number: '1122334455',
        consultation_room: 3,
        arrival_time: new Date(),
        status: 'completed'
      },
      {
        full_name: 'Alice Brown',
        id_number: '5566778899',
        consultation_room: 4,
        arrival_time: new Date(),
        status: 'cancelled'
      }
    ]).execute();

    const result = await getPublicDisplay();

    // Should only return patients with 'waiting' or 'in_consultation' status
    expect(result).toHaveLength(2);
    
    // Check first patient (waiting)
    const waitingPatient = result.find(p => p.full_name === 'John Doe');
    expect(waitingPatient).toBeDefined();
    expect(waitingPatient!.id_last_three).toEqual('890');
    expect(waitingPatient!.full_name).toEqual('John Doe');
    expect(waitingPatient!.consultation_room).toEqual(1);
    expect(waitingPatient!.status).toEqual('waiting');

    // Check second patient (in_consultation)
    const consultationPatient = result.find(p => p.full_name === 'Jane Smith');
    expect(consultationPatient).toBeDefined();
    expect(consultationPatient!.id_last_three).toEqual('321');
    expect(consultationPatient!.full_name).toEqual('Jane Smith');
    expect(consultationPatient!.consultation_room).toEqual(2);
    expect(consultationPatient!.status).toEqual('in_consultation');
  });

  it('should return empty array when no patients have waiting or in_consultation status', async () => {
    // Create test patients with only completed and cancelled statuses
    await db.insert(patientsTable).values([
      {
        full_name: 'Completed Patient',
        id_number: '1111111111',
        consultation_room: 1,
        arrival_time: new Date(),
        status: 'completed'
      },
      {
        full_name: 'Cancelled Patient',
        id_number: '2222222222',
        consultation_room: 2,
        arrival_time: new Date(),
        status: 'cancelled'
      }
    ]).execute();

    const result = await getPublicDisplay();

    expect(result).toHaveLength(0);
  });

  it('should handle ID numbers with less than 3 digits correctly', async () => {
    // Create patient with short ID number
    await db.insert(patientsTable).values({
      full_name: 'Short ID Patient',
      id_number: '12',
      consultation_room: 1,
      arrival_time: new Date(),
      status: 'waiting'
    }).execute();

    const result = await getPublicDisplay();

    expect(result).toHaveLength(1);
    expect(result[0].id_last_three).toEqual('12'); // Should return the whole number if less than 3 digits
  });

  it('should return empty array when no patients exist', async () => {
    const result = await getPublicDisplay();

    expect(result).toHaveLength(0);
  });
});
