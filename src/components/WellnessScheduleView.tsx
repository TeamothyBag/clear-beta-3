import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/contexts/HabitContext";
import { useNotifications } from "@/contexts/NotificationContext";

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

export const WellnessScheduleView = () => {
  // Context hooks
  const { state: authState } = useAuth();
  const { state: habitState, fetchHabits, createHabit, completeHabit } = useHabits();
  const { addNotification } = useNotifications();

  // Local state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventType, setNewEventType] = useState("appointment");
  
  // Mock appointments data (since AppointmentContext doesn't exist)
  const [mockAppointments] = useState([
    {
      _id: "1",
      title: "Therapy Session",
      provider: "Dr. Sarah Chen",
      date: new Date().toISOString(),
      location: "Wellness Center",
      status: "confirmed",
      duration: 60
    }
  ]);
  
  // Form states
  const [appointmentForm, setAppointmentForm] = useState({
    title: "",
    provider: "",
    date: "",
    time: "",
    location: "",
    notes: ""
  });
  
  const [habitForm, setHabitForm] = useState({
    name: "",
    type: "mindfulness",
    frequency: "daily",
    targetTime: ""
  });

  // Check if data is already available, no need to fetch again as HabitProvider handles this
  // useEffect removed to prevent duplicate API calls

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Filter appointments for selected date
  const getTodaysAppointments = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return mockAppointments.filter(apt => 
      apt.date?.startsWith(dateStr)
    );
  };
  console.log("Habits State:", habitState);

  // Get today's habits and their completion status
  const getTodaysHabits = () => {
    if (!habitState.habits) return [];
    return habitState.habits.filter(habit => {
      if (habit.frequency?.type === 'daily') return true;
      if (habit.frequency?.type === 'weekly') {
        const day = selectedDate.getDay();
        return habit.frequency.days_of_week?.includes(day) || false;
      }
      return true;
    });
  };

  const todaysAppointments = getTodaysAppointments();
  const todaysHabits = getTodaysHabits();
  
  // Calculate completion stats
  const completedHabits = todaysHabits.filter(habit => 
    habit.progress?.some(progress => 
      new Date(progress.date).toDateString() === selectedDate.toDateString() && progress.completed
    )
  ).length;
  
  const totalHabits = todaysHabits.length;

  // Handle habit completion toggle
  const handleHabitToggle = async (habitId: string) => {
    try {
      await completeHabit(habitId, selectedDate);
      addNotification({
        type: 'success',
        title: 'Habit Updated',
        message: 'Habit completion status updated successfully'
      });
      fetchHabits(); // Refresh habits
    } catch (error) {
      console.error('Error updating habit:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update habit. Please try again.'
      });
    }
  };

  // Handle new appointment creation (mock implementation)
  const handleCreateAppointment = async () => {
    try {
      // Mock appointment creation
      addNotification({
        type: 'success',
        title: 'Appointment Scheduled',
        message: `${appointmentForm.title} has been scheduled successfully`
      });

      // Reset form
      setAppointmentForm({
        title: "",
        provider: "",
        date: "",
        time: "",
        location: "",
        notes: ""
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to schedule appointment. Please try again.'
      });
    }
  };

  // Handle new habit creation
  const handleCreateHabit = async () => {
    try {
      const habitData = {
        name: habitForm.name,
        description: `${habitForm.name} habit`,
        category: habitForm.type,
        frequency: {
          type: habitForm.frequency as "daily" | "weekly" | "monthly",
          target_count: 1
        },
        tracking: {
          type: "boolean" as const,
          unit: "completion"
        },
        reminderTime: habitForm.targetTime,
        isActive: true
      };

      await createHabit(habitData);
      
      addNotification({
        type: 'success',
        title: 'Habit Created',
        message: `${habitForm.name} has been added to your routine`
      });

      // Reset form
      setHabitForm({
        name: "",
        type: "mindfulness",
        frequency: "daily",
        targetTime: ""
      });
      
      fetchHabits(); // Refresh habits
    } catch (error) {
      console.error('Error creating habit:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create habit. Please try again.'
      });
    }
  };

  // Check if habit is completed today
  const isHabitCompletedToday = (habit: any) => {
    if (!habit.progress) return false;
    return habit.progress.some((progress: any) => 
      new Date(progress.date).toDateString() === selectedDate.toDateString() && progress.completed
    );
  };

  // Get habit streak
  const getHabitStreak = (habit: any) => {
    return habit.currentStreak || 0;
  };

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
                    {todaysAppointments.map((appointment) => {
                      const appointmentDate = new Date(appointment.date);
                      const timeStr = appointmentDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                      });
                      
                      return (
                        <div key={appointment._id} className="p-3 bg-muted/30 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{appointment.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {appointment.provider ? `with ${appointment.provider}` : 'No provider specified'}
                              </p>
                            </div>
                            <Badge 
                              variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {appointment.status || 'scheduled'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{timeStr} ({appointment.duration || 60}min)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{appointment.location || 'Location TBD'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                {habitState.isLoading ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Loading habits...</p>
                  </div>
                ) : todaysHabits.length === 0 ? (
                  <div className="text-center py-4">
                    <Heart className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No habits set</p>
                    <p className="text-sm text-muted-foreground">Create habits to track your wellness!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {todaysHabits.slice(0, 4).map((habit) => {
                      const habitType = habitTypes.find(t => t.id === habit.category) || habitTypes[0];
                      const Icon = habitType.icon;
                      const isCompleted = isHabitCompletedToday(habit);
                      
                      return (
                        <button
                          key={habit._id}
                          onClick={() => handleHabitToggle(habit._id)}
                          className={`p-3 rounded-xl transition-all duration-200 text-left ${
                            isCompleted 
                              ? 'bg-success/20 border-2 border-success' 
                              : 'bg-muted/30 border border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Icon className={`w-4 h-4 ${isCompleted ? 'text-success' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium text-foreground">{habit.name}</span>
                            {isCompleted && (
                              <CheckCircle className="w-4 h-4 text-success ml-auto" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {(habit as any).reminderTime || 'Anytime'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
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
                  <Button size="sm" variant="outline" onClick={() => setActiveTab("add")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {habitState.isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading habits...</p>
                  </div>
                ) : habitState.habits && habitState.habits.length > 0 ? (
                  <div className="space-y-3">
                    {habitState.habits.map((habit) => {
                      const habitType = habitTypes.find(t => t.id === habit.category) || habitTypes[0];
                      const Icon = habitType.icon;
                      const isCompleted = isHabitCompletedToday(habit);
                      const streak = getHabitStreak(habit);
                      
                      return (
                        <div key={habit._id} className="p-4 bg-muted/30 rounded-xl">
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
                                    <span>{(habit as any).reminderTime || 'Anytime'}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Badge variant="outline" className="text-xs">
                                      {streak} day streak
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleHabitToggle(habit._id)}
                                className="transition-colors"
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-success" />
                                ) : (
                                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full hover:border-primary" />
                                )}
                              </button>
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
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No habits created yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create healthy habits to track your wellness journey
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("add")}
                      className="mt-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Habit
                    </Button>
                  </div>
                )}
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
                {mockAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {mockAppointments
                      .filter(appointment => new Date(appointment.date) >= new Date())
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((appointment) => {
                        const appointmentDate = new Date(appointment.date);
                        const timeStr = appointmentDate.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        });
                        
                        return (
                          <div key={appointment._id} className="p-3 bg-muted/30 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground">{appointment.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.provider ? `with ${appointment.provider}` : 'No provider specified'}
                                </p>
                              </div>
                              <Badge 
                                variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {appointment.status || 'scheduled'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{appointmentDate.toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{timeStr}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{appointment.location || 'Location TBD'}</span>
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
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Schedule appointments to see them here
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("add")}
                      className="mt-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </div>
                )}
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
                    <Input 
                      placeholder="Appointment title" 
                      value={appointmentForm.title}
                      onChange={(e) => setAppointmentForm({...appointmentForm, title: e.target.value})}
                    />
                    <Input 
                      placeholder="Provider/Professional" 
                      value={appointmentForm.provider}
                      onChange={(e) => setAppointmentForm({...appointmentForm, provider: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        type="date" 
                        value={appointmentForm.date}
                        onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                      />
                      <Input 
                        type="time" 
                        value={appointmentForm.time}
                        onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                      />
                    </div>
                    <Input 
                      placeholder="Location" 
                      value={appointmentForm.location}
                      onChange={(e) => setAppointmentForm({...appointmentForm, location: e.target.value})}
                    />
                    <Textarea 
                      placeholder="Notes (optional)" 
                      className="min-h-[80px]" 
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                    />
                    <Button 
                      className="w-full calming-button"
                      onClick={handleCreateAppointment}
                      disabled={!appointmentForm.title || !appointmentForm.date || !appointmentForm.time}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input 
                      placeholder="Habit name" 
                      value={habitForm.name}
                      onChange={(e) => setHabitForm({...habitForm, name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {habitTypes.slice(0, 4).map((type) => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.id}
                            variant={habitForm.type === type.id ? "default" : "outline"}
                            className="h-auto p-3 flex-col"
                            onClick={() => setHabitForm({...habitForm, type: type.id})}
                          >
                            <Icon className="w-4 h-4 mb-1" />
                            <span className="text-xs">{type.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select 
                        className="p-2 border rounded-md"
                        value={habitForm.frequency}
                        onChange={(e) => setHabitForm({...habitForm, frequency: e.target.value})}
                        title="Habit frequency"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="weekdays">Weekdays</option>
                      </select>
                      <Input 
                        type="time" 
                        placeholder="Target time" 
                        value={habitForm.targetTime}
                        onChange={(e) => setHabitForm({...habitForm, targetTime: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full calming-button"
                      onClick={handleCreateHabit}
                      disabled={!habitForm.name || habitState.isLoading}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {habitState.isLoading ? 'Creating...' : 'Create Habit'}
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