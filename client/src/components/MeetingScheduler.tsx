import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Loader2, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  User,
  ChevronLeft,
  ChevronRight,
  Video
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { format, addDays, startOfWeek, isSameDay, isAfter, setHours, setMinutes, addHours } from "date-fns";
import { CalendarPlus, Download, ExternalLink } from "lucide-react";

interface MeetingSchedulerProps {
  meetingType: "franchise" | "vending" | "general";
  onSuccess?: () => void;
  onClose?: () => void;
}

// Generate time slots for a day (9 AM to 5 PM, 30-min intervals)
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 9; hour < 17; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Timezone options
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (AZ)" },
  { value: "America/Anchorage", label: "Alaska (AK)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HI)" },
];

export default function MeetingScheduler({ meetingType, onSuccess, onClose }: MeetingSchedulerProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Calendar state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState("America/New_York");
  
  // Form data
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    notes: "",
  });

  // Get booked slots from backend
  const { data: bookedSlots } = trpc.scheduling.getBookedSlots.useQuery({
    startDate: currentWeekStart.toISOString(),
    endDate: addDays(currentWeekStart, 7).toISOString(),
  });

  const scheduleMutation = trpc.scheduling.scheduleMeeting.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Meeting scheduled successfully!", {
        description: "You'll receive a confirmation email shortly.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to schedule meeting", {
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  // Generate week days
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  // Check if a slot is available
  const isSlotBooked = (date: string, time: string) => {
    if (!bookedSlots) return false;
    const [hours, minutes] = time.split(":").map(Number);
    const slotDate = setMinutes(setHours(date, hours), minutes);
    return bookedSlots.some(slot => {
      const bookedDate = new Date(slot.scheduledAt);
      return Math.abs(new Date(bookedDate).getTime() - new Date(slotDate).getTime()) < 30 * 60 * 1000;
    });
  };

  // Check if a date is in the past
  const isDatePast = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };

  // Check if a time slot is in the past for today
  const isTimePast = (date: string, time: string) => {
    if (!isSameDay(date, new Date())) return false;
    const [hours, minutes] = time.split(":").map(Number);
    const slotTime = setMinutes(setHours(new Date(), hours), minutes);
    return slotTime <= new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    setIsSubmitting(true);
    
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);

    scheduleMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      meetingType,
      scheduledAt: scheduledAt.toISOString(),
      timezone: selectedTimezone,
      notes: formData.notes,
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  // Calendar integration helper functions
  const getScheduledDateTime = () => {
    if (!selectedDate || !selectedTime) return null;
    const [hours, minutes] = selectedTime.split(":").map(Number);
    return setMinutes(setHours(selectedDate, hours), minutes);
  };

  const downloadICSFile = () => {
    const startDate = getScheduledDateTime();
    if (!startDate) return;
    
    const endDate = addHours(startDate, 1);
    const title = `NEON Energy - ${meetingTypeLabels[meetingType]}`;
    const description = `Your ${meetingTypeLabels[meetingType]} with NEON Energy team.\n\nContact: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nNotes: ${formData.notes || "None"}`;
    
    const formatICSDate = (date: string) => {
      return new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };
    
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NEON Energy//Meeting Scheduler//EN",
      "BEGIN:VEVENT",
      `DTSTART:${formatICSDate(startDate.toISOString())}`,
      `DTEND:${formatICSDate(endDate.toISOString())}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      "LOCATION:Video Call (link will be sent via email)",
      `UID:${Date.now()}@neonenergy.com`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `neon-meeting-${format(startDate, "yyyy-MM-dd")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Calendar file downloaded!");
  };

  const openGoogleCalendar = () => {
    const startDate = getScheduledDateTime();
    if (!startDate) return;
    
    const endDate = addHours(startDate, 1);
    const title = encodeURIComponent(`NEON Energy - ${meetingTypeLabels[meetingType]}`);
    const details = encodeURIComponent(`Your ${meetingTypeLabels[meetingType]} with NEON Energy team.\n\nContact: ${formData.name}\nEmail: ${formData.email}`);
    const location = encodeURIComponent("Video Call (link will be sent via email)");
    
    const formatGoogleDate = (date: string) => {
      return new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startDate.toISOString())}/${formatGoogleDate(endDate.toISOString())}&details=${details}&location=${location}`;
    window.open(url, "_blank");
  };

  const openOutlookCalendar = () => {
    const startDate = getScheduledDateTime();
    if (!startDate) return;
    
    const endDate = addHours(startDate, 1);
    const title = encodeURIComponent(`NEON Energy - ${meetingTypeLabels[meetingType]}`);
    const body = encodeURIComponent(`Your ${meetingTypeLabels[meetingType]} with NEON Energy team.\n\nContact: ${formData.name}\nEmail: ${formData.email}`);
    const location = encodeURIComponent("Video Call (link will be sent via email)");
    
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${body}&location=${location}`;
    window.open(url, "_blank");
  };

  const meetingTypeLabels: Record<string, string> = {
    franchise: "Franchise Consultation",
    vending: "Vending Machine Consultation",
    general: "General Consultation",
  };

  if (isSubmitted) {
    return (
      <Card className="bg-white/5 border-[#c8ff00]/30">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#c8ff00]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#c8ff00]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Meeting Scheduled!</h3>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            Your {meetingTypeLabels[meetingType]} has been scheduled for:
          </p>
          <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-xl p-4 mb-6 max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-2 text-[#c8ff00] font-bold text-lg mb-2">
              <Calendar className="w-5 h-5" />
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </div>
            <div className="flex items-center justify-center gap-2 text-white">
              <Clock className="w-4 h-4" />
              {selectedTime} ({TIMEZONES.find(tz => tz.value === selectedTimezone)?.label})
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            A confirmation email with meeting details has been sent to {formData.email}
          </p>
          
          {/* Calendar Integration Buttons */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <p className="text-white text-sm font-medium mb-3 flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-[#c8ff00]" />
              Add to your calendar:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadICSFile()}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download .ics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openGoogleCalendar()}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Google Calendar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openOutlookCalendar()}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Outlook
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onClose}
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-[#c8ff00]" />
          Schedule a {meetingTypeLabels[meetingType]}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {step === 1 
            ? "Select a date and time that works for you"
            : "Enter your contact information"
          }
        </CardDescription>
        {/* Progress bar */}
        <div className="flex gap-2 mt-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-[#c8ff00]" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Date & Time Selection */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Timezone selector */}
              <div className="space-y-2">
                <Label className="text-white">Your Timezone</Label>
                <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Week navigation */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousWeek}
                  disabled={isDatePast(addDays(currentWeekStart, 6).toISOString())}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-white font-medium">
                  {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={goToNextWeek}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const isPast = isDatePast(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={isPast || isWeekend}
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedTime(null);
                      }}
                      className={`p-3 rounded-lg text-center transition-all ${
                        isSelected
                          ? "bg-[#c8ff00] text-black"
                          : isPast || isWeekend
                          ? "bg-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {format(day, "EEE")}
                      </div>
                      <div className="text-lg font-bold">
                        {format(day, "d")}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="space-y-3">
                  <Label className="text-white">Available Times for {format(selectedDate, "EEEE, MMM d")}</Label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {TIME_SLOTS.map((time) => {
                      const isBooked = isSlotBooked(selectedDate.toISOString(), time);
                      const isPast = isTimePast(selectedDate.toISOString(), time);
                      const isSelected = selectedTime === time;
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isBooked || isPast}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-[#c8ff00] text-black"
                              : isBooked || isPast
                              ? "bg-white/5 text-gray-600 cursor-not-allowed line-through"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
              >
                Continue to Contact Info
              </Button>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Selected time summary */}
              <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-[#c8ff00] font-medium mb-1">
                  <Calendar className="w-4 h-4" />
                  {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Clock className="w-4 h-4" />
                  {selectedTime} ({TIMEZONES.find(tz => tz.value === selectedTimezone)?.label})
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#c8ff00] text-sm underline mt-2"
                >
                  Change date/time
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                  placeholder="(555) 123-4567"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">
                  What would you like to discuss? (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Tell us about your goals, questions, or specific topics you'd like to cover..."
                  className="bg-white/10 border-white/20 text-white min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                  className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Meeting"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
