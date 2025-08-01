
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  addPatientInputSchema, 
  updatePatientStatusInputSchema, 
  getPatientsByRoomInputSchema 
} from './schema';

// Import handlers
import { addPatient } from './handlers/add_patient';
import { getPatientsByRoom } from './handlers/get_patients_by_room';
import { updatePatientStatus } from './handlers/update_patient_status';
import { getWaitingPatients } from './handlers/get_waiting_patients';
import { getPublicDisplay } from './handlers/get_public_display';
import { callNextPatient } from './handlers/call_next_patient';
import { getAllPatients } from './handlers/get_all_patients';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Secretary endpoints
  addPatient: publicProcedure
    .input(addPatientInputSchema)
    .mutation(({ input }) => addPatient(input)),
  
  getAllPatients: publicProcedure
    .query(() => getAllPatients()),
  
  // Doctor endpoints
  getPatientsByRoom: publicProcedure
    .input(getPatientsByRoomInputSchema)
    .query(({ input }) => getPatientsByRoom(input)),
  
  callNextPatient: publicProcedure
    .input(getPatientsByRoomInputSchema)
    .mutation(({ input }) => callNextPatient(input)),
  
  updatePatientStatus: publicProcedure
    .input(updatePatientStatusInputSchema)
    .mutation(({ input }) => updatePatientStatus(input)),
  
  // Public display endpoints
  getPublicDisplay: publicProcedure
    .query(() => getPublicDisplay()),
  
  getWaitingPatients: publicProcedure
    .query(() => getWaitingPatients()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
