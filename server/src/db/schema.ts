
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// Define patient status enum for PostgreSQL
export const patientStatusEnum = pgEnum('patient_status', ['waiting', 'in_consultation', 'completed', 'cancelled']);

export const patientsTable = pgTable('patients', {
  id: serial('id').primaryKey(),
  full_name: text('full_name').notNull(),
  id_number: text('id_number').notNull(),
  consultation_room: integer('consultation_room').notNull(), // 1-8 consultation rooms
  arrival_time: timestamp('arrival_time').notNull(),
  status: patientStatusEnum('status').notNull().default('waiting'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Patient = typeof patientsTable.$inferSelect; // For SELECT operations
export type NewPatient = typeof patientsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { patients: patientsTable };
