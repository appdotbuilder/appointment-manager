
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { Phone, Users, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { Patient } from '../../../server/src/schema';

export function DoctorView() {
  const [selectedRoom, setSelectedRoom] = useState<number>(1);
  const [roomPatients, setRoomPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [lastCalledPatient, setLastCalledPatient] = useState<Patient | null>(null);

  const loadRoomPatients = useCallback(async () => {
    try {
      const result = await trpc.getPatientsByRoom.query({ consultation_room: selectedRoom });
      setRoomPatients(result);
    } catch (error) {
      console.error('Failed to load room patients:', error);
    }
  }, [selectedRoom]);

  useEffect(() => {
    loadRoomPatients();
    // Refresh every 5 seconds
    const interval = setInterval(loadRoomPatients, 5000);
    return () => clearInterval(interval);
  }, [loadRoomPatients]);

  const handleCallNextPatient = async () => {
    setIsCallLoading(true);
    try {
      const result = await trpc.callNextPatient.mutate({ consultation_room: selectedRoom });
      if (result) {
        setLastCalledPatient(result);
        await loadRoomPatients(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to call next patient:', error);
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleUpdateStatus = async (patientId: number, status: 'completed' | 'cancelled') => {
    setIsLoading(true);
    try {
      await trpc.updatePatientStatus.mutate({ patient_id: patientId, status });
      await loadRoomPatients(); // Refresh the list
      if (lastCalledPatient && lastCalledPatient.id === patientId) {
        setLastCalledPatient(null);
      }
    } catch (error) {
      console.error('Failed to update patient status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_consultation': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return '⏳';
      case 'in_consultation': return '👨‍⚕️';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const waitingPatients = roomPatients.filter(p => p.status === 'waiting');
  const currentPatient = roomPatients.find(p => p.status === 'in_consultation');
  const roomNumbers = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MapPin className="h-5 w-5" />
            Room Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Select Your Consultation Room</Label>
            <Select
              value={selectedRoom.toString()}
              onValueChange={(value: string) => setSelectedRoom(parseInt(value))}
            >
              <SelectTrigger className="w-full border-green-200 focus:border-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roomNumbers.map((room) => (
                  <SelectItem key={room} value={room.toString()}>
                    Consultation Room {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Phone className="h-5 w-5" />
              Call Next Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {waitingPatients.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No patients waiting in Room {selectedRoom}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">Next Patient:</h3>
                  <div className="space-y-1">
                    <div className="font-medium">{waitingPatients[0].full_name}</div>
                    <div className="text-sm text-green-600">
                      ID: ***{waitingPatients[0].id_number.slice(-3)} • 
                      Arrived: {new Date(waitingPatients[0].arrival_time).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleCallNextPatient}
                  disabled={isCallLoading || currentPatient !== undefined}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isCallLoading ? 'Calling...' : 'Call Next Patient'}
                </Button>
                
                {currentPatient && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Complete current consultation before calling next patient
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="text-sm text-gray-600">
              <span className="font-medium">{waitingPatients.length}</span> patients waiting in Room {selectedRoom}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Users className="h-5 w-5" />
              Current Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPatient ? (
              <>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-blue-800">In Consultation:</h3>
                    <Badge className={getStatusColor(currentPatient.status)}>
                      {getStatusIcon(currentPatient.status)} In Consultation
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">{currentPatient.full_name}</div>
                    <div className="text-sm text-blue-600">
                      ID: ***{currentPatient.id_number.slice(-3)} • 
                      Arrived: {new Date(currentPatient.arrival_time).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleUpdateStatus(currentPatient.id, 'completed')}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(currentPatient.id, 'cancelled')}
                    disabled={isLoading}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No patient currently in consultation in Room {selectedRoom}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Clock className="h-5 w-5" />
            Room {selectedRoom} Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roomPatients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No patients in Room {selectedRoom}</p>
          ) : (
            <div className="space-y-3">
              
              {roomPatients
                .sort((a, b) => new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime())
                .map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{patient.full_name}</div>
                      <div className="text-sm text-gray-500">
                        ID: ***{patient.id_number.slice(-3)} • 
                        Arrived: {new Date(patient.arrival_time).toLocaleTimeString()} • 
                        Room {patient.consultation_room}
                      </div>
                    </div>
                    <Badge className={getStatusColor(patient.status)}>
                      {getStatusIcon(patient.status)} {patient.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
