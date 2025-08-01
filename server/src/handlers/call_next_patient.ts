
import { type GetPatientsByRoomInput, type Patient } from '../schema';

export async function callNextPatient(input: GetPatientsByRoomInput): Promise<Patient | null> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is for doctors to call the next waiting patient from their room.
    // It should find the oldest waiting patient for the specified room and update their status to 'in_consultation'.
    // Returns null if no waiting patients are found for the room.
    // Note: Should not call patients with 'cancelled' status.
    return Promise.resolve(null);
}
