import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock3,
  IndianRupee,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/features/auth/store';
import { type ChatRoomListItem, useChatRoomsQuery } from '@/features/chat';
import type { InstructorAnalyticsData, InstructorAnalyticsRange } from '@/features/instructor/api';
import {
  useInstructorAnalyticsQuery,
  useOnboardingWorkspaceQuery,
} from '@/features/instructor/hooks';
import { cn, formatDate, formatPrice, formatTime } from '@/lib/utils';

type TrendMetric = 'earnings' | 'bookings';

const RANGE_OPTIONS: Array<{ value: InstructorAnalyticsRange; label: string }> = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
];

const OFFERING_COLORS = ['#c2410c', '#d97706', '#ea580c', '#059669', '#2563eb', '#7c3aed'];

const statusVariant = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'error';
  if (status === 'PENDING' || status === 'CHANGES_REQUESTED') return 'warning';
  return 'default';
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-stone-200 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-stone-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-56 bg-stone-200 rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 bg-white border border-stone-200 rounded-2xl animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 h-72 bg-white border border-stone-200 rounded-2xl animate-pulse" />
        <div className="lg:col-span-5 h-72 bg-white border border-stone-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

export function InstructorDashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [range, setRange] = useState<InstructorAnalyticsRange>('30d');
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('earnings');

  const {
    data: workspace,
    isLoading: workspaceLoading,
    isError: workspaceError,
  } = useOnboardingWorkspaceQuery();

  const {
    data: rawAnalytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch,
    isFetching,
  } = useInstructorAnalyticsQuery(range);

  const analytics = rawAnalytics as InstructorAnalyticsData | undefined;

  const { data: chatRoomsRaw } = useChatRoomsQuery('INSTRUCTOR', Boolean(user));
  const chatRooms = (chatRoomsRaw ?? []) as ChatRoomListItem[];

  const unreadMessagesCount = useMemo(
    () => chatRooms.reduce((sum, room) => sum + (room.unreadCount ?? 0), 0),
    [chatRooms],
  );

  const offerings = workspace?.offerings ?? [];
  const approvedOfferings = offerings.filter(
    (offering: { status: string }) => offering.status === 'APPROVED',
  );
  const pendingOfferings = offerings.filter(
    (offering: { status: string }) => offering.status === 'PENDING',
  );
  const returnedOfferings = offerings.filter(
    (offering: { status: string }) =>
      offering.status === 'REJECTED' || offering.status === 'CHANGES_REQUESTED',
  );

  if (workspaceLoading || (analyticsLoading && !analytics)) {
    return <DashboardSkeleton />;
  }

  if (workspaceError && analyticsError) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-10 text-center space-y-3">
          <div className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle size={22} />
          </div>
          <h2 className="text-lg font-semibold text-stone-800">
            Could not load instructor dashboard
          </h2>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const hasTrendData = analytics?.dailySeries.some((point) => point[trendMetric] > 0) ?? false;
  const needsSlotsPrompt =
    approvedOfferings.length > 0 && (analytics?.capacity.openUpcomingSlots ?? 0) === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header & Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Instructor Studio &amp; Analytics</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            Welcome back, {user?.name ?? 'Instructor'}. Track your earnings, upcoming sessions, and
            skill performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-white border border-stone-200 rounded-xl p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                  range === opt.value
                    ? 'bg-kala-brown text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 bg-white"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <Link to="/instructor/slots">
            <Button size="sm" className="gap-1.5">
              <CalendarDays size={14} /> Manage Slots
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Actionable Alerts ── */}
      {returnedOfferings.length > 0 && (
        <Card className="p-4 border-amber-200 bg-amber-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {returnedOfferings.length} offering
                {returnedOfferings.length === 1 ? '' : 's'} need your attention
              </p>
              <p className="text-xs text-amber-800/80 mt-0.5">
                An admin requested changes or returned an offering. Update and resubmit to go live.
              </p>
            </div>
          </div>
          <Link to="/instructor/offerings" className="shrink-0">
            <Button size="sm" variant="outline" className="bg-white">
              Review Offerings
            </Button>
          </Link>
        </Card>
      )}

      {needsSlotsPrompt && (
        <Card className="p-4 border-orange-200 bg-orange-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CalendarDays size={20} className="text-kala-terracotta shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-stone-800">
                No upcoming open slots published
              </p>
              <p className="text-xs text-stone-600 mt-0.5">
                Your skill offerings are approved, but students need open time slots to book
                sessions with you.
              </p>
            </div>
          </div>
          <Link to="/instructor/slots" className="shrink-0">
            <Button size="sm">Add Availability</Button>
          </Link>
        </Card>
      )}

      {/* ── Primary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Earnings */}
        <Link to="/instructor/payments" className="block group">
          <Card hover className="p-5 h-full border-stone-200/80">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl text-emerald-700 bg-emerald-50">
                <IndianRupee size={20} />
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {formatPrice(analytics?.earnings.thisMonthEarned ?? 0)} this mo
              </span>
            </div>
            <div className="text-2xl font-extrabold text-stone-800 group-hover:text-kala-terracotta transition-colors">
              {formatPrice(analytics?.earnings.totalEarned ?? 0)}
            </div>
            <div className="text-sm font-medium text-stone-600 mt-0.5">Total Earnings</div>
            <p className="text-xs text-stone-400 mt-2">
              Avg {formatPrice(analytics?.earnings.avgSessionValue ?? 0)} / session
              {(analytics?.earnings.pendingEarnings ?? 0) > 0
                ? ` · ${formatPrice(analytics?.earnings.pendingEarnings ?? 0)} pending`
                : ''}
            </p>
          </Card>
        </Link>

        {/* Sessions */}
        <Link to="/instructor/sessions" className="block group">
          <Card hover className="p-5 h-full border-stone-200/80">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl text-blue-700 bg-blue-50">
                <CalendarCheck size={20} />
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {analytics?.sessions.completionRate ?? 100}% completion
              </span>
            </div>
            <div className="text-2xl font-extrabold text-stone-800 group-hover:text-kala-terracotta transition-colors">
              {analytics?.sessions.upcomingConfirmed ?? 0}
            </div>
            <div className="text-sm font-medium text-stone-600 mt-0.5">Upcoming Sessions</div>
            <p className="text-xs text-stone-400 mt-2">
              {analytics?.sessions.completed ?? 0} completed ·{' '}
              {analytics?.sessions.uniqueStudents ?? 0} unique students
            </p>
          </Card>
        </Link>

        {/* Availability */}
        <Link to="/instructor/slots" className="block group">
          <Card hover className="p-5 h-full border-stone-200/80">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl text-kala-terracotta bg-amber-50">
                <CalendarDays size={20} />
              </div>
              <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                {analytics?.capacity.activeWeeklyRules ?? 0} weekly rules
              </span>
            </div>
            <div className="text-2xl font-extrabold text-stone-800 group-hover:text-kala-terracotta transition-colors">
              {analytics?.capacity.openUpcomingSlots ?? 0}
            </div>
            <div className="text-sm font-medium text-stone-600 mt-0.5">Open Bookable Slots</div>
            <p className="text-xs text-stone-400 mt-2">Available for students right now</p>
          </Card>
        </Link>

        {/* Offerings & Unread Messages */}
        <Link to="/instructor/messages" className="block group">
          <Card hover className="p-5 h-full border-stone-200/80">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl text-purple-700 bg-purple-50">
                <MessageSquare size={20} />
              </div>
              {unreadMessagesCount > 0 ? (
                <span className="text-xs font-semibold text-white bg-kala-amber px-2 py-0.5 rounded-full">
                  {unreadMessagesCount} unread
                </span>
              ) : (
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                  Inbox clear
                </span>
              )}
            </div>
            <div className="text-2xl font-extrabold text-stone-800 group-hover:text-kala-terracotta transition-colors">
              {approvedOfferings.length}
            </div>
            <div className="text-sm font-medium text-stone-600 mt-0.5">Live Offerings</div>
            <p className="text-xs text-stone-400 mt-2">
              {pendingOfferings.length} under review · {returnedOfferings.length} returned
            </p>
          </Card>
        </Link>
      </div>

      {/* ── Analytics Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Earnings & Bookings Trend */}
        <Card className="lg:col-span-7 p-5 border-stone-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-stone-800">
                Earnings &amp; Booking Activity
              </h2>
              <p className="text-xs text-stone-500">
                {trendMetric === 'earnings'
                  ? `${formatPrice(analytics?.earnings.inRangeEarned ?? 0)} earned in the last ${range}`
                  : `Daily session bookings over the last ${range}`}
              </p>
            </div>
            <div className="inline-flex bg-stone-100 rounded-xl p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTrendMetric('earnings')}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                  trendMetric === 'earnings'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800',
                )}
              >
                Earnings (INR)
              </button>
              <button
                type="button"
                onClick={() => setTrendMetric('bookings')}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                  trendMetric === 'bookings'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800',
                )}
              >
                Bookings
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            {hasTrendData && analytics ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.dailySeries}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="instructorTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={trendMetric === 'earnings' ? '#c2410c' : '#d97706'}
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor={trendMetric === 'earnings' ? '#c2410c' : '#d97706'}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={20}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    axisLine={false}
                    tickLine={false}
                    width={trendMetric === 'earnings' ? 54 : 32}
                    allowDecimals={false}
                    tickFormatter={(val: number) =>
                      trendMetric === 'earnings'
                        ? val >= 1000
                          ? `₹${(val / 1000).toFixed(0)}k`
                          : `₹${val}`
                        : String(val)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e7e5e4',
                      fontSize: '12px',
                    }}
                    formatter={(value) => {
                      const num = Number(value ?? 0);
                      return trendMetric === 'earnings'
                        ? [formatPrice(num), 'Earned']
                        : [num, 'Bookings'];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={trendMetric}
                    stroke={trendMetric === 'earnings' ? '#c2410c' : '#d97706'}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#instructorTrendGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-sm">
                <TrendingUp size={28} className="mb-2 opacity-35" />
                No {trendMetric} recorded in the last {range}.
              </div>
            )}
          </div>
        </Card>

        {/* Offering Performance BarChart */}
        <Card className="lg:col-span-5 p-5 border-stone-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-800">Revenue by Offering</h2>
              <p className="text-xs text-stone-500">Which skills students book the most</p>
            </div>
            <Link
              to="/instructor/payments"
              className="text-xs font-semibold text-kala-terracotta hover:underline flex items-center gap-0.5"
            >
              Earnings <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="h-64 w-full flex-1">
            {analytics && analytics.offeringPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.offeringPerformance}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 6, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={110}
                    tick={{ fontSize: 11, fill: '#44403c', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e7e5e4',
                      fontSize: '12px',
                    }}
                    formatter={(value, _name, item) => [
                      `${formatPrice(Number(value ?? 0))} (${item.payload.bookingsCount} sessions)`,
                      'Revenue',
                    ]}
                  />
                  <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={20}>
                    {analytics.offeringPerformance.map((off, idx) => (
                      <Cell key={off.id} fill={OFFERING_COLORS[idx % OFFERING_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-sm text-center">
                <Users size={28} className="mb-2 opacity-35" />
                Revenue per skill will appear once students complete bookings.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Upcoming Live Sessions & Offerings Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Confirmed Sessions */}
        <Card className="lg:col-span-6 p-5 border-stone-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-800">Next Upcoming Sessions</h2>
              <p className="text-xs text-stone-500">Confirmed sessions ordered by start time</p>
            </div>
            <Link
              to="/instructor/sessions"
              className="text-xs font-semibold text-kala-terracotta hover:underline flex items-center gap-1"
            >
              All Sessions <ChevronRight size={14} />
            </Link>
          </div>

          {analytics && analytics.upcomingSessions.length > 0 ? (
            <div className="space-y-3 flex-1">
              {analytics.upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl border border-stone-200/70 hover:border-kala-amber/50 bg-stone-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={session.studentName}
                      src={session.studentImageUrl ?? undefined}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-stone-900 truncate">
                        {session.studentName}
                      </p>
                      <p className="text-xs text-stone-600 truncate">{session.offeringTitle}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {formatDate(session.startTime)} · {formatTime(session.startTime)} –{' '}
                        {formatTime(session.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link to={`/instructor/sessions/${session.id}/chat`}>
                      <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1">
                        <MessageSquare size={13} /> Chat
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => navigate(`/instructor/sessions/${session.id}`)}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-2">
              <CalendarCheck className="text-stone-300" size={30} />
              <p className="text-sm font-semibold text-stone-700">No upcoming confirmed sessions</p>
              <p className="text-xs text-stone-500 max-w-xs">
                Open availability slots so students can book your classes.
              </p>
              <Link to="/instructor/slots" className="pt-1">
                <Button size="sm" variant="outline">
                  Manage Slots
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Approved Offerings + Quick Add */}
        <Card className="lg:col-span-6 p-5 border-stone-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-800">
                Your Offerings ({offerings.length})
              </h2>
              <p className="text-xs text-stone-500">
                {approvedOfferings.length} live · {pendingOfferings.length} pending review
              </p>
            </div>
            <Link to="/instructor/offerings">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Plus size={14} /> Manage Offerings
              </Button>
            </Link>
          </div>

          {offerings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-2">
              <Sparkles className="text-stone-300" size={30} />
              <p className="text-sm font-semibold text-stone-700">No skill offerings created yet</p>
              <p className="text-xs text-stone-500 max-w-xs">
                Create an offering and submit it for review to start teaching.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {offerings.slice(0, 4).map(
                (offering: {
                  id: string;
                  title: string | null;
                  status: string;
                  hourlyRate: string | number;
                  subcategory: {
                    name: string;
                    category: { name: string };
                  };
                }) => (
                  <div
                    key={offering.id}
                    className="p-3.5 rounded-xl border border-stone-200/70 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-stone-800 truncate">
                          {offering.title || offering.subcategory.name}
                        </p>
                        <Badge variant={statusVariant(offering.status)}>{offering.status}</Badge>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 truncate">
                        {offering.subcategory.category.name} · {offering.subcategory.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-kala-terracotta">
                        {formatPrice(Number(offering.hourlyRate))}
                      </p>
                      <p className="text-[11px] text-stone-400">per hour</p>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Offering status footer summary */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-600" />
              {approvedOfferings.length} Approved
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} className="text-amber-600" />
              {pendingOfferings.length} Under Review
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-red-500" />
              {returnedOfferings.length} Needs Attention
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
