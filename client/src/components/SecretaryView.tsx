
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { Plus, Users, Clock, MapPin, User, IdCard } from 'lucide-react';
import type { Patient, AddPatientInput } from '../../../server/src/schema';

export function SecretaryView() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddPatientInput>({
    full_name: '',
    id_number: '',
    consultation_room: 1,
    arrival_time: new Date()
  });

  const loadPatients = useCallback(async () => {
    try {
      const result = await trpc.getAllPatients.query();
      setPatients(result);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  }, []);

  useEffect(() => {
    loadPatients();
    // Refresh every 10 seconds
    const interval = setInterval(loadPatients, 10000);
    return () => clearInterval(interval);
  }, [loadPatients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.id_number.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await trpc.addPatient.mutate(formData);
      setPatients((prev: Patient[]) => [...prev, response]);
      // Reset form
      setFormData({
        full_name: '',
        id_number: '',
        consultation_room: 1,
        arrival_time: new Date()
      });
    } catch (error) {
      console.error('Failed to add patient:', error);
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

  const patientsByRoom = patients.reduce((acc, patient) => {
    if (!acc[patient.consultation_room]) {
      acc[patient.consultation_room] = [];
    }
    acc[patient.consultation_room].push(patient);
    return acc;
  }, {} as Record<number, Patient[]>);

  const roomNumbers = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="add-patient" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add-patient" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Patient
          </TabsTrigger>
          <TabsTrigger value="view-patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            View All Patients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-patient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Plus className="h-5 w-5" />
                Register New Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      placeholder="Enter patient's full name"
                      value={formData.full_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: AddPatientInput) => ({ ...prev, full_name: e.target.value }))
                      }
                      required
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="id_number" className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      ID Number
                    </Label>
                    <Input
                      id="id_number"
                      placeholder="Enter ID number"
                      value={formData.id_number}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: AddPatientInput) => ({ ...prev, id_number: e.target.value }))
                      }
                      required
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Consultation Room
                    </Label>
                    <Select
                      value={formData.consultation_room.toString()}
                      onValueChange={(value: string) =>
                        setFormData((prev: AddPatientInput) => ({ ...prev, consultation_room: parseInt(value) }))
                      }
                    >
                      <SelectTrigger className="border-blue-200 focus:border-blue-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roomNumbers.map((room) => (
                          <SelectItem key={room} value={room.toString()}>
                            Room {room}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrival_time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Arrival Time
                    </Label>
                    <Input
                      id="arrival_time"
                      type="datetime-local"
                      value={(formData.arrival_time || new Date()).toISOString().slice(0, 16)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: AddPatientInput) => ({ ...prev, arrival_time: new Date(e.target.value) }))
                      }
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Adding Patient...' : 'Add Patient to Queue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view-patients">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['waiting', 'in_consultation', 'completed', 'cancelled'].map((status) => {
                const count = patients.filter(p => p.status === status).length;
                return (
                  <Card key={status} className="text-center">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-gray-800">{count}</div>
                      <div className="text-sm text-gray-600 capitalize flex items-center justify-center gap-1">
                        <span>{getStatusIcon(status)}</span>
                        {status.replace('_', ' ')}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {roomNumbers.map((roomNumber) => {
                const roomPatients = patientsByRoom[roomNumber] || [];
                const waitingCount = roomPatients.filter(p => p.status === 'waiting').length;
                const inConsultationCount = roomPatients.filter(p => p.status === 'in_consultation').length;
                
                return (
                  <Card key={roomNumber} className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Room {roomNumber}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {roomPatients.length} patients
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-600">⏳ Waiting: {waitingCount}</span>
                        <span className="text-blue-600">👨‍⚕️ In consultation: {inConsultationCount}</span>
                      </div>
                      
                      {roomPatients.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">No patients</p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {roomPatients
                            .sort((a, b) => new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime())
                            .map((patient) => (
                              <div key={patient.id} className="p-2 border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{patient.full_name}</div>
                                    <div className="text-xs text-gray-500">
                                      ID: ***{patient.id_number.slice(-3)} • {new Date(patient.arrival_time).toLocaleTimeString()}
                                    </div>
                                  </div>
                                  <Badge className={`text-xs ${getStatusColor(patient.status)}`}>
                                    {getStatusIcon(patient.status)} {patient.status.replace('_', ' ')}
                                  </Badge>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
