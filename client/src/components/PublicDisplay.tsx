
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { Monitor, MapPin, Users } from 'lucide-react';
import type { PublicPatientDisplay } from '../../../server/src/schema';

export function PublicDisplay() {
  const [publicPatients, setPublicPatients] = useState<PublicPatientDisplay[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadPublicDisplay = useCallback(async () => {
    try {
      const result = await trpc.getPublicDisplay.query();
      setPublicPatients(result);
    } catch (error) {
      console.error('Failed to load public display:', error);
    }
  }, []);

  useEffect(() => {
    loadPublicDisplay();
    // Refresh every 3 seconds for real-time updates
    const interval = setInterval(loadPublicDisplay, 3000);
    return () => clearInterval(interval);
  }, [loadPublicDisplay]);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_consultation': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return '⏳';
      case 'in_consultation': return '👥';
      default: return '❓';
    }
  };

  const patientsByRoom = publicPatients.reduce((acc, patient) => {
    if (!acc[patient.consultation_room]) {
      acc[patient.consultation_room] = [];
    }
    acc[patient.consultation_room].push(patient);
    return acc;
  }, {} as Record<number, PublicPatientDisplay[]>);

  const roomNumbers = Array.from({ length: 8 }, (_, i) => i + 1);
  const waitingCount = publicPatients.filter(p => p.status === 'waiting').length;
  const inConsultationCount = publicPatients.filter(p => p.status === 'in_consultation').length;

  return (
    <div className="space-y-6">
      {/* Header with current time and stats */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Patient Queue Status</h1>
              <p className="text-slate-300">Please wait for your number to be called</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-slate-300">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Current stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{waitingCount}</div>
            <div className="text-sm text-yellow-700 flex items-center justify-center gap-1">
              <span>⏳</span> Waiting
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{inConsultationCount}</div>
            <div className="text-sm text-blue-700 flex items-center justify-center gap-1">
              <span>👥</span> In Consultation
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-600">{publicPatients.length}</div>
            <div className="text-sm text-slate-700 flex items-center justify-center gap-1">
              <Users className="h-4 w-4" /> Total Active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-600">8</div>
            <div className="text-sm text-slate-700 flex items-center justify-center gap-1">
              <MapPin className="h-4 w-4" /> Rooms Available
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main display grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {roomNumbers.map((roomNumber) => {
          const roomPatients = patientsByRoom[roomNumber] || [];
          const waitingInRoom = roomPatients.filter(p => p.status === 'waiting');
          const inConsultationInRoom = roomPatients.filter(p => p.status === 'in_consultation');
          
          return (
            <Card key={roomNumber} className="h-fit border-2">
              <CardHeader className="pb-3 bg-slate-50">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-slate-600" />
                    Room {roomNumber}
                  </span>
                  <Badge variant="outline" className="text-sm">
                    {roomPatients.length} active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {roomPatients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🏥</div>
                    <div>No patients</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Show in consultation first */}
                    {inConsultationInRoom.map((patient) => (
                      <div key={patient.id_last_three} className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg">***{patient.id_last_three}</div>
                            <div className="font-medium text-blue-800">{patient.full_name}</div>
                          </div>
                          <Badge className={`${getStatusColor(patient.status)} text-sm`}>
                            {getStatusIcon(patient.status)} In Session
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show waiting patients */}
                    {waitingInRoom.map((patient, index) => (
                      <div key={patient.id_last_three} className={`p-3 rounded-lg border-2 ${
                        index === 0 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg">***{patient.id_last_three}</div>
                            <div className={`font-medium ${index === 0 ? 'text-yellow-800' : 'text-gray-700'}`}>
                              {patient.full_name}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusColor(patient.status)} text-sm`}>
                              {getStatusIcon(patient.status)} {index === 0 ? 'Next' : 'Waiting'}
                            </Badge>
                            {index === 0 && (
                              <div className="text-xs text-yellow-600 mt-1 font-medium">
                                YOU'RE NEXT!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer instructions */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-blue-900">Instructions for Patients</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span>Find your ID number (last 3 digits)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🚪</span>
                <span>Check your assigned room number</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⏰</span>
                <span>Wait for your status to change to "Next"</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border border-blue-200">
              <p className="text-blue-700 font-medium">
                🔔 When your number shows "YOU'RE NEXT!" or "In Session", please proceed to your assigned consultation room
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
