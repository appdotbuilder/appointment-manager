
import { z } from 'zod';

// Patient status enum
export const patientStatusSchema = z.enum(['waiting', 'in_consultation', 'completed', 'cancelled']);
export type PatientStatus = z.infer<typeof patientStatusSchema>;

// Consultation room validation (1-8)
export const consultationRoomSchema = z.number().int().min(1).max(8);

// Patient schema
export const patientSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  id_number: z.string(),
  consultation_room: consultationRoomSchema,
  arrival_time: z.coerce.date(),
  status: patientStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Patient = z.infer<typeof patientSchema>;

// Input schema for adding new patients to queue
export const addPatientInputSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  id_number: z.string().min(1, "ID number is required"),
  consultation_room: consultationRoomSchema,
  arrival_time: z.coerce.date().optional() // Defaults to current time if not provided
});

export type AddPatientInput = z.infer<typeof addPatientInputSchema>;

// Input schema for updating patient status
export const updatePatientStatusInputSchema = z.object({
  patient_id: z.number(),
  status: patientStatusSchema
});

export type UpdatePatientStatusInput = z.infer<typeof updatePatientStatusInputSchema>;

// Schema for getting patients by room
export const getPatientsByRoomInputSchema = z.object({
  consultation_room: consultationRoomSchema
});

export type GetPatientsByRoomInput = z.infer<typeof getPatientsByRoomInputSchema>;

// Schema for public display patient info
export const publicPatientDisplaySchema = z.object({
  id_last_three: z.string(),
  full_name: z.string(),
  consultation_room: consultationRoomSchema,
  status: patientStatusSchema
});

export type PublicPatientDisplay = z.infer<typeof publicPatientDisplaySchema>;
