import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, Clock, Plus, User, Heart, Brain,
  CheckCircle, AlertCircle, Coffee, Moon, Sun, Activity,
  Edit3, Trash2, Bell, MapPin
} from "lucide-react";

const habitTypes = [
  { id: "mindfulness", name: "Mindfulness", icon: Brain, color: "primary" },
  { id: "exercise", name: "Exercise", icon: Activity, color: "success" },
  { id: "sleep", name: "Sleep", icon: Moon, color: "secondary" },
  { id: "nutrition", name: "Nutrition", icon: Coffee, color: "warning" },
  { id: "selfcare", name: "Self-Care", icon: Heart, color: "accent" },
];

const timeSlots = [
  "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

const mockAppointments = [
  {
    id: 1,
    title: "Therapy Session",
    type: "appointment",
    time: "10:00",
    duration: 60,
    provider: "Dr. Sarah Chen",
    location: "Wellness Center",
    date: "2025-09-22",
    status: "confirmed"
  },
  {
    id: 2,
    title: "Yoga Class",
    type: "activity",
    time: "18:00",
    duration: 90,
    provider: "Mindful Studio",
    location: "Downtown",
    date: "2025-09-22",
    status: "confirmed"
  },
  {
    id: 3,
    title: "Check-in Call",
    type: "appointment",
    time: "15:00",
    duration: 30,
    provider: "Support Coordinator",
    location: "Virtual",
    date: "2025-09-23",
    status: "pending"
  }
];

const mockHabits = [
  {
    id: 1,
    name: "Morning Meditation",
    type: "mindfulness",
    targetTime: "7:00",
    frequency: "daily",
    streak: 5,
    completed: true,
    todayCompleted: true
  },
  {
    id: 2,
    name: "Evening Walk",
    type: "exercise",
    targetTime: "19:00",
    frequency: "daily",
    streak: 3,
    completed: false,
    todayCompleted: false
  },
  {
    id: 3,
    name: "Gratitude Journal",
    type: "selfcare",
    targetTime: "21:00",
    frequency: "daily",
    streak: 7,
    completed: false,
    todayCompleted: false
  },
  {
    id: 4,
    name: "Hydration Check",
    type: "nutrition",
    targetTime: "12:00",
    frequency: "daily",
    streak: 2,
    completed: true,
    todayCompleted: true
  }
];

export const WellnessScheduleView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventType, setNewEventType] = useState("appointment");

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const todaysAppointments = mockAppointments.filter(apt => 
    apt.date === selectedDate.toISOString().split('T')[0]
  );

  const completedHabits = mockHabits.filter(habit => habit.todayCompleted).length;
  const totalHabits = mockHabits.length;

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-caslon text-2xl text-foreground">Wellness Schedule</h1>
          <p className="text-muted-foreground">{formatDate(selectedDate)}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="add">Add</TabsTrigger>
          </TabsList>

          {/* Today's Schedule Tab */}
          <TabsContent value="today" className="space-y-6">
            {/* Progress Overview */}
            <Card className="therapeutic-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">Today's Progress</h3>
                  <Badge variant="outline">{completedHabits}/{totalHabits} habits</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{todaysAppointments.length}</div>
                    <p className="text-xs text-muted-foreground">Appointments</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{completedHabits}</div>
                    <p className="text-xs text-muted-foreground">Habits Done</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Appointments */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                  Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysAppointments.length === 0 ? (
                  <div className="text-center py-6">
                    <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No appointments today</p>
                    <p className="text-sm text-muted-foreground">Enjoy your free time!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaysAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{appointment.title}</h4>
                            <p className="text-sm text-muted-foreground">with {appointment.provider}</p>
                          </div>
                          <Badge 
                            variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{appointment.time} ({appointment.duration}min)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{appointment.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Habits */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                  Quick Check-in
                </CardTitle>
                <CardDescription>Mark off today's wellness habits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {mockHabits.slice(0, 4).map((habit) => {
                    const habitType = habitTypes.find(t => t.id === habit.type)!;
                    const Icon = habitType.icon;
                    return (
                      <button
                        key={habit.id}
                        className={`p-3 rounded-xl transition-all duration-200 text-left ${
                          habit.todayCompleted 
                            ? 'bg-success/20 border-2 border-success' 
                            : 'bg-muted/30 border border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon className={`w-4 h-4 ${habit.todayCompleted ? 'text-success' : 'text-muted-foreground'}`} />
                          <span className="text-sm font-medium text-foreground">{habit.name}</span>
                          {habit.todayCompleted && (
                            <CheckCircle className="w-4 h-4 text-success ml-auto" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{habit.targetTime}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Habits Tab */}
          <TabsContent value="habits" className="space-y-4">
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-primary" />
                    Daily Habits
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHabits.map((habit) => {
                    const habitType = habitTypes.find(t => t.id === habit.type)!;
                    const Icon = habitType.icon;
                    return (
                      <div key={habit.id} className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-primary/20 rounded-full">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{habit.name}</h4>
                              <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{habit.targetTime}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Badge variant="outline" className="text-xs">
                                    {habit.streak} day streak
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {habit.todayCompleted ? (
                              <CheckCircle className="w-5 h-5 text-success" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {habitType.name}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-3 bg-muted/30 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{appointment.title}</h4>
                          <p className="text-sm text-muted-foreground">with {appointment.provider}</p>
                        </div>
                        <Badge 
                          variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{appointment.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Bell className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add New Tab */}
          <TabsContent value="add" className="space-y-4">
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-primary" />
                  Add New
                </CardTitle>
                <CardDescription>Create a new appointment or habit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={newEventType === "appointment" ? "default" : "outline"}
                    onClick={() => setNewEventType("appointment")}
                    className="h-auto p-4 flex-col"
                  >
                    <User className="w-6 h-6 mb-2" />
                    <span className="text-sm">Appointment</span>
                  </Button>
                  <Button
                    variant={newEventType === "habit" ? "default" : "outline"}
                    onClick={() => setNewEventType("habit")}
                    className="h-auto p-4 flex-col"
                  >
                    <Heart className="w-6 h-6 mb-2" />
                    <span className="text-sm">Habit</span>
                  </Button>
                </div>

                {newEventType === "appointment" ? (
                  <div className="space-y-4">
                    <Input placeholder="Appointment title" />
                    <Input placeholder="Provider/Professional" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="date" />
                      <Input type="time" />
                    </div>
                    <Input placeholder="Location" />
                    <Textarea placeholder="Notes (optional)" className="min-h-[80px]" />
                    <Button className="w-full calming-button">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input placeholder="Habit name" />
                    <div className="grid grid-cols-2 gap-3">
                      {habitTypes.slice(0, 4).map((type) => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.id}
                            variant="outline"
                            className="h-auto p-3 flex-col"
                          >
                            <Icon className="w-4 h-4 mb-1" />
                            <span className="text-xs">{type.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select className="p-2 border rounded-md">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Weekdays</option>
                      </select>
                      <Input type="time" placeholder="Target time" />
                    </div>
                    <Button className="w-full calming-button">
                      <Heart className="w-4 h-4 mr-2" />
                      Create Habit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};