import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, User,
  CalendarDays, List, LayoutGrid, Columns,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { PageTransition } from '@/components/shared/PageTransition';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  time: string;
  category: 'interview' | 'deadline' | 'meeting' | 'milestone' | 'reminder';
  candidate?: string;
  description?: string;
  location?: string;
}

// ─── Sample Events ────────────────────────────────────────

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  interview: { bg: 'bg-brand-50 dark:bg-brand-900/20', text: 'text-brand-700 dark:text-brand-300', dot: 'bg-brand-500' },
  deadline: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  meeting: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
  milestone: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  reminder: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
};

const sampleEvents: CalendarEvent[] = [
  { id: 'ev1', title: 'Technical Interview — Emily Zhang', date: new Date(2026, 7, 2), time: '10:00 AM', category: 'interview', candidate: 'Emily Zhang', location: 'Google Meet', description: 'System design + React architecture deep-dive' },
  { id: 'ev2', title: 'Behavioral Interview — Marcus Johnson', date: new Date(2026, 7, 3), time: '2:00 PM', category: 'interview', candidate: 'Marcus Johnson', location: 'Zoom', description: 'Leadership and teamwork assessment' },
  { id: 'ev3', title: 'Coding Assessment — Sofia Rodriguez', date: new Date(2026, 7, 1), time: '11:30 AM', category: 'interview', candidate: 'Sofia Rodriguez', location: 'CoderPad', description: 'Live coding session - algorithms & data structures' },
  { id: 'ev4', title: 'Application Deadline: Senior Frontend', date: new Date(2026, 8, 15), time: 'All day', category: 'deadline', description: 'Close applications for Senior Frontend Engineer role' },
  { id: 'ev5', title: 'Hiring Team Sync', date: new Date(2026, 7, 4), time: '9:00 AM', category: 'meeting', location: 'Conf Room A', description: 'Weekly pipeline review with hiring managers' },
  { id: 'ev6', title: 'Q3 Hiring Goal Review', date: new Date(2026, 7, 15), time: '3:00 PM', category: 'milestone', description: 'Review progress against quarterly hiring targets' },
  { id: 'ev7', title: 'Send offer to James Wilson', date: new Date(2026, 7, 5), time: '10:00 AM', category: 'reminder', candidate: 'James Wilson', description: 'Finalize compensation package and send formal offer' },
  { id: 'ev8', title: 'Design Team Panel — Priya Sharma', date: new Date(2026, 7, 7), time: '1:00 PM', category: 'interview', candidate: 'Priya Sharma', location: 'Zoom', description: 'Portfolio review with design leadership' },
  { id: 'ev9', title: 'ML Engineer Deadline', date: new Date(2026, 7, 30), time: 'All day', category: 'deadline', description: 'Close applications for ML Engineer role' },
  { id: 'ev10', title: 'Onboarding Plan — Aisha Patel', date: new Date(2026, 7, 10), time: '11:00 AM', category: 'milestone', candidate: 'Aisha Patel', description: 'Prepare first-week onboarding schedule' },
];

// ─── Utilities ────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date) {
  return isSameDay(date, new Date(2026, 7, 1)); // Demo "today"
}

// ─── Component ────────────────────────────────────────────

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const navigateMonth = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const getEventsForDate = (date: Date) => sampleEvents.filter((e) => isSameDay(e.date, date));

  // Week view dates
  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  // Upcoming events sorted
  const upcomingEvents = useMemo(() => {
    return [...sampleEvents]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Calendar</h1>
            <p className="text-surface-500 mt-1">Manage interviews, deadlines, and hiring events</p>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
            Add Event
          </Button>
        </div>

        {/* Controls */}
        <Card padding="sm" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4">
          {/* Month navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white min-w-[180px] text-center">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 7, 1))}
              className="ml-2 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            >
              Today
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            {([
              { id: 'month' as ViewMode, icon: LayoutGrid, label: 'Month' },
              { id: 'week' as ViewMode, icon: Columns, label: 'Week' },
              { id: 'day' as ViewMode, icon: CalendarDays, label: 'Day' },
              { id: 'agenda' as ViewMode, icon: List, label: 'Agenda' },
            ]).map((view) => (
              <button
                key={view.id}
                onClick={() => setViewMode(view.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
                  viewMode === view.id
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                )}
              >
                <view.icon size={14} />
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Calendar content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main calendar area */}
          <div className="xl:col-span-3">
            <AnimatePresence mode="wait">
              {viewMode === 'month' && (
                <motion.div key="month" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <MonthView
                    year={year}
                    month={month}
                    getEventsForDate={getEventsForDate}
                    onEventClick={setSelectedEvent}
                    onDayClick={setSelectedDay}
                  />
                </motion.div>
              )}
              {viewMode === 'week' && (
                <motion.div key="week" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <WeekView
                    dates={weekDates}
                    getEventsForDate={getEventsForDate}
                    onEventClick={setSelectedEvent}
                  />
                </motion.div>
              )}
              {viewMode === 'day' && (
                <motion.div key="day" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <DayView
                    date={currentDate}
                    events={getEventsForDate(currentDate)}
                    onEventClick={setSelectedEvent}
                  />
                </motion.div>
              )}
              {viewMode === 'agenda' && (
                <motion.div key="agenda" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <AgendaView events={sampleEvents} onEventClick={setSelectedEvent} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar — Upcoming */}
          <div className="space-y-4">
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const colors = categoryColors[event.category];
                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', colors.dot)} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-surface-400 mt-0.5">
                            {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {event.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Category legend */}
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Categories</h3>
              <div className="space-y-2">
                {Object.entries(categoryColors).map(([key, colors]) => (
                  <div key={key} className="flex items-center gap-2.5">
                    <div className={cn('w-3 h-3 rounded-full', colors.dot)} />
                    <span className="text-sm text-surface-600 dark:text-surface-400 capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Event Detail Modal */}
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent?.title}
          size="md"
        >
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={selectedEvent.category === 'interview' ? 'brand' : selectedEvent.category === 'deadline' ? 'danger' : selectedEvent.category === 'milestone' ? 'success' : 'warning'}>
                  {selectedEvent.category}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
                  <CalendarDays size={16} className="text-surface-400 shrink-0" />
                  <span>{selectedEvent.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
                  <Clock size={16} className="text-surface-400 shrink-0" />
                  <span>{selectedEvent.time}</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
                    <MapPin size={16} className="text-surface-400 shrink-0" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.candidate && (
                  <div className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
                    <User size={16} className="text-surface-400 shrink-0" />
                    <div className="flex items-center gap-2">
                      <Avatar name={selectedEvent.candidate} size="sm" />
                      <span>{selectedEvent.candidate}</span>
                    </div>
                  </div>
                )}
              </div>
              {selectedEvent.description && (
                <div className="pt-3 border-t border-surface-100 dark:border-surface-800">
                  <p className="text-sm text-surface-600 dark:text-surface-400">{selectedEvent.description}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="primary" size="sm">Edit Event</Button>
                <Button variant="ghost" size="sm">Delete</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Add Event Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Event" size="md">
          <div className="space-y-4">
            <Input label="Event title" placeholder="e.g. Technical Interview — Jane Doe" id="event-title" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" id="event-date" />
              <Input label="Time" type="time" id="event-time" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Category</label>
              <select className="w-full h-11 px-4 rounded-xl text-sm bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                <option value="interview">Interview</option>
                <option value="deadline">Deadline</option>
                <option value="meeting">Meeting</option>
                <option value="milestone">Milestone</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
            <Input label="Location (optional)" placeholder="Zoom, Google Meet, Room A..." id="event-location" />
            <Input label="Description (optional)" placeholder="Brief details about this event" id="event-desc" />
            <div className="flex gap-2 pt-2">
              <Button variant="primary" onClick={() => setShowAddModal(false)}>Create Event</Button>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
}


// ─── Month View ───────────────────────────────────────────

function MonthView({
  year,
  month,
  getEventsForDate,
  onEventClick,
  onDayClick,
}: {
  year: number;
  month: number;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
  onDayClick: (d: Date) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-surface-200 dark:border-surface-800">
        {DAYS.map((day) => (
          <div key={day} className="px-2 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - firstDay + 1;
          const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
          const date = new Date(year, month, dayNum);
          const events = isCurrentMonth ? getEventsForDate(date) : [];
          const today = isToday(date) && isCurrentMonth;

          return (
            <div
              key={i}
              onClick={() => isCurrentMonth && onDayClick(date)}
              className={cn(
                'min-h-[90px] p-1.5 border-b border-r border-surface-100 dark:border-surface-800/50 cursor-pointer transition-colors',
                'hover:bg-surface-50 dark:hover:bg-surface-800/30',
                !isCurrentMonth && 'opacity-30'
              )}
            >
              <span className={cn(
                'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium',
                today ? 'bg-brand-600 text-white' : 'text-surface-700 dark:text-surface-300'
              )}>
                {isCurrentMonth ? dayNum : ''}
              </span>
              {/* Events */}
              <div className="mt-0.5 space-y-0.5">
                {events.slice(0, 2).map((event) => {
                  const colors = categoryColors[event.category];
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={cn(
                        'w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate transition-opacity hover:opacity-80',
                        colors.bg, colors.text
                      )}
                    >
                      {event.title.length > 18 ? event.title.slice(0, 18) + '…' : event.title}
                    </button>
                  );
                })}
                {events.length > 2 && (
                  <span className="text-[10px] text-surface-400 pl-1">+{events.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}


// ─── Week View ────────────────────────────────────────────

function WeekView({
  dates,
  getEventsForDate,
  onEventClick,
}: {
  dates: Date[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="grid grid-cols-7 divide-x divide-surface-100 dark:divide-surface-800">
        {dates.map((date) => {
          const events = getEventsForDate(date);
          const today = isToday(date);
          return (
            <div key={date.toISOString()} className="min-h-[320px]">
              {/* Header */}
              <div className={cn(
                'p-3 text-center border-b border-surface-100 dark:border-surface-800',
                today && 'bg-brand-50/50 dark:bg-brand-900/10'
              )}>
                <p className="text-xs text-surface-400 uppercase">{DAYS[date.getDay()]}</p>
                <p className={cn(
                  'text-lg font-bold mt-0.5',
                  today ? 'text-brand-600 dark:text-brand-400' : 'text-surface-800 dark:text-surface-200'
                )}>
                  {date.getDate()}
                </p>
              </div>
              {/* Events */}
              <div className="p-2 space-y-1.5">
                {events.map((event) => {
                  const colors = categoryColors[event.category];
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        'w-full text-left p-2 rounded-lg transition-all hover:shadow-sm',
                        colors.bg
                      )}
                    >
                      <p className={cn('text-xs font-medium truncate', colors.text)}>{event.title}</p>
                      <p className="text-[10px] text-surface-400 mt-0.5">{event.time}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}


// ─── Day View ─────────────────────────────────────────────

function DayView({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4 border-b border-surface-100 dark:border-surface-800">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        <p className="text-sm text-surface-500 mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''} scheduled</p>
      </div>
      <div className="divide-y divide-surface-100 dark:divide-surface-800">
        {hours.map((hour) => {
          const timeLabel = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
          const hourEvents = events.filter((e) => {
            const eventHour = parseInt(e.time);
            const isPM = e.time.includes('PM');
            const h24 = isPM && eventHour !== 12 ? eventHour + 12 : !isPM && eventHour === 12 ? 0 : eventHour;
            return h24 === hour;
          });

          return (
            <div key={hour} className="flex min-h-[60px]">
              <div className="w-20 shrink-0 p-2 text-right">
                <span className="text-xs text-surface-400">{timeLabel}</span>
              </div>
              <div className="flex-1 p-2 border-l border-surface-100 dark:border-surface-800">
                {hourEvents.map((event) => {
                  const colors = categoryColors[event.category];
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        'w-full text-left p-3 rounded-xl mb-1 transition-all hover:shadow-sm',
                        colors.bg
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
                        <p className={cn('text-sm font-medium', colors.text)}>{event.title}</p>
                      </div>
                      {event.location && (
                        <p className="text-xs text-surface-400 mt-1 ml-4">{event.location}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}


// ─── Agenda View ──────────────────────────────────────────

function AgendaView({
  events,
  onEventClick,
}: {
  events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}) {
  const sorted = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by date
  const grouped = sorted.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = event.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([dateLabel, dayEvents]) => (
        <Card key={dateLabel} padding="none" className="overflow-hidden">
          <div className="px-5 py-3 bg-surface-50 dark:bg-surface-800/30 border-b border-surface-100 dark:border-surface-800">
            <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300">{dateLabel}</h4>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {dayEvents.map((event, i) => {
              const colors = categoryColors[event.category];
              return (
                <motion.button
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onEventClick(event)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors"
                >
                  <div className={cn('w-3 h-3 rounded-full shrink-0', colors.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-surface-400 mt-0.5 truncate">{event.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-surface-600 dark:text-surface-300">{event.time}</p>
                    {event.location && (
                      <p className="text-[10px] text-surface-400 mt-0.5">{event.location}</p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
