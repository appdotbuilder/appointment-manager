
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecretaryView } from '@/components/SecretaryView';
import { DoctorView } from '@/components/DoctorView';
import { PublicDisplay } from '@/components/PublicDisplay';
import { UserCheck, Stethoscope, Monitor, Building2 } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState<'main' | 'secretary' | 'doctor' | 'public'>('main');

  if (activeView === 'secretary') {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-blue-900">Secretary Dashboard</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setActiveView('main')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              ← Back to Main Menu
            </Button>
          </div>
          <SecretaryView />
        </div>
      </div>
    );
  }

  if (activeView === 'doctor') {
    return (
      <div className="min-h-screen bg-green-50">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-green-900">Doctor Dashboard</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setActiveView('main')}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              ← Back to Main Menu
            </Button>
          </div>
          <DoctorView />
        </div>
      </div>
    );
  }

  if (activeView === 'public') {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Monitor className="h-8 w-8 text-slate-600" />
              <h1 className="text-3xl font-bold text-slate-900">Patient Queue Display</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setActiveView('main')}
              className="border-slate-300 text-slate-700 hover:bg-slate-200"
            >
              ← Back to Main Menu
            </Button>
          </div>
          <PublicDisplay />
        </div>
      </div>
    );
  }

  // Main menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">MediQueue System</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive patient queue management system for medical consultations across 8 consultation rooms
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-blue-200 bg-blue-50/50"
            onClick={() => setActiveView('secretary')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-900">Secretary Dashboard</CardTitle>
              <CardDescription className="text-blue-700">
                Add new patients to the queue and manage patient records
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Register new patients</li>
                <li>• View all patients</li>
                <li>• Monitor queue status</li>
                <li>• Manage patient information</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-green-200 bg-green-50/50"
            onClick={() => setActiveView('doctor')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Stethoscope className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-900">Doctor Dashboard</CardTitle>
              <CardDescription className="text-green-700">
                Call patients and update consultation status
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Call next patient</li>
                <li>• View room queue</li>
                <li>• Update patient status</li>
                <li>• Complete consultations</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-slate-200 bg-slate-50/50"
            onClick={() => setActiveView('public')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-slate-100 rounded-full w-fit">
                <Monitor className="h-8 w-8 text-slate-600" />
              </div>
              <CardTitle className="text-xl text-slate-900">Public Display</CardTitle>
              <CardDescription className="text-slate-700">
                Patient queue information for waiting room display
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Current queue status</li>
                <li>• Patient ID (last 3 digits)</li>
                <li>• Room assignments</li>
                <li>• Real-time updates</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 p-6 bg-white/70 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">System Features</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">🏥 8 Consultation Rooms</span>
              <p>Dedicated queues for each consultation room</p>
            </div>
            <div>
              <span className="font-medium">📋 Status Tracking</span>
              <p>Waiting • In Consultation • Completed • Cancelled</p>
            </div>
            <div>
              <span className="font-medium">🔒 Privacy Compliant</span>
              <p>Public display shows only last 3 digits of ID</p>
            </div>
            <div>
              <span className="font-medium">⏰ Real-time Updates</span>
              <p>Instant queue updates across all interfaces</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
