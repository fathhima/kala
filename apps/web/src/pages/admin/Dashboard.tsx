import {
  AlertCircle,
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  IndianRupee,
  Palette,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { AdminAnalyticsData, AnalyticsRange } from '@/features/admin/analytics/api';
import { useAdminAnalyticsQuery } from '@/features/admin/analytics/hooks';
import { formatDate, formatPrice, getBookingStatusLabel } from '@/lib/utils';

type TrendMetric = 'revenue' | 'bookings' | 'newUsers';

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

const TREND_TABS: Array<{
  key: TrendMetric;
  label: string;
  color: string;
}> = [
  { key: 'revenue', label: 'Revenue (INR)', color: '#c2410c' },
  { key: 'bookings', label: 'Bookings', color: '#d97706' },
  { key: 'newUsers', label: 'New Users', color: '#059669' },
];

const BOOKING_STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#10b981',
  COMPLETED: '#2563eb',
  PAYMENT_PENDING: '#f59e0b',
  CANCELLED: '#ef4444',
  EXPIRED: '#78716c',
  REFUNDED: '#8b5cf6',
  REFUND_PENDING: '#ec4899',
};

const CATEGORY_BAR_COLORS = ['#c2410c', '#d97706', '#ea580c', '#b45309', '#059669', '#2563eb'];

function getStatusBadgeVariant(
  status: string,
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'CONFIRMED':
    case 'APPROVED':
    case 'SUCCEEDED':
      return 'success';
    case 'COMPLETED':
    case 'REFUNDED':
      return 'info';
    case 'PAYMENT_PENDING':
    case 'PENDING':
    case 'CHANGES_REQUESTED':
    case 'REFUND_PENDING':
      return 'warning';
    case 'CANCELLED':
    case 'REJECTED':
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-stone-200 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-stone-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-64 bg-stone-200 rounded-xl animate-pulse" />
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
        <div className="lg:col-span-8 h-80 bg-white border border-stone-200 rounded-2xl animate-pulse" />
        <div className="lg:col-span-4 h-80 bg-white border border-stone-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('revenue');

  const { data: rawData, isLoading, isError, refetch, isFetching } = useAdminAnalyticsQuery(range);
  const data = rawData as AdminAnalyticsData | undefined;

  const activeTrendConfig = useMemo(
    () => TREND_TABS.find((t) => t.key === trendMetric) ?? TREND_TABS[0],
    [trendMetric],
  );

  const paymentSuccessRate = useMemo(() => {
    if (!data) return 0;
    const totalAttempts = data.revenue.succeededPayments + data.revenue.failedPayments;
    if (totalAttempts === 0) return 100;
    return Math.round((data.revenue.succeededPayments / totalAttempts) * 100);
  }, [data]);

  const totalBookingBreakdownCount = useMemo(() => {
    if (!data) return 0;
    return data.bookingStatusBreakdown.reduce((acc, item) => acc + item.count, 0);
  }, [data]);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-10 text-center space-y-3">
          <div className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle size={22} />
          </div>
          <h2 className="text-lg font-semibold text-stone-800">
            Unable to load platform analytics
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            There was an error fetching metrics from the server.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const hasTrendData = data.dailySeries.some((point) => point[trendMetric] > 0);
  const hasUserGrowthData = data.dailySeries.some((point) => point.newUsers > 0);
  const rangeLabel = RANGE_OPTIONS.find((opt) => opt.value === range)?.label ?? 'Last 30 Days';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header & Range Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Admin Overview &amp; Analytics</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Real-time platform performance, revenue trends, and operational queues
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-white border border-stone-200 rounded-xl p-1 shadow-2xs">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  range === opt.value
                    ? 'bg-kala-brown text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
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
        </div>
      </div>

      {/* ── Primary KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Revenue */}
        <Link to="/admin/payments" className="block group">
          <Card hover className="p-5 h-full border-stone-200/80">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl text-purple-700 bg-purple-50">
                <IndianRupee size={20} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {formatPrice(data.revenue.inRangeVolume)} in {range}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-stone-800 group-hover:text-kala-terracotta transition-colors">
              {formatPrice(data.revenue.netRevenue)}
            </div>
            <div className="text-sm font-medium text-stone-600 mt-0.5">Net Platform Revenue</div>
            <p className="text-xs text-stone-400 mt-2">
              Gross {formatPrice(data.revenue.grossVolume)} · Refunded{' '}
              {formatPrice(data.revenue.refundedAmount)}
            </p>
          </Card>
        </Link>

        {/* Total Bookings */}
        <Link to="/admin/bookings" className="block group">
          <Card hover className="p-5 h-full border-stone-200/80">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl text-emerald-700 bg-emerald-50">
                <CalendarDays size={20} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                +{data.bookings.newInRange} in {range}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-stone-800 group-hover:text-kala-terracotta transition-colors">
              {data.bookings.total}
            </div>
            <div className="text-sm font-medium text-stone-600 mt-0.5">Total Bookings</div>
            <p className="text-xs text-stone-400 mt-2">
              {data.bookings.confirmed} confirmed · {data.bookings.completed} completed
            </p>
          </Card>
        </Link>

        {/* Platform Users */}
        <Link to="/admin/users" className="block group">
          <Card hover className="p-5 h-full border-stone-200/80">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl text-blue-700 bg-blue-50">
                <Users size={20} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                +{data.users.newInRange} new
              </span>
            </div>
            <div className="text-2xl font-extrabold text-stone-800 group-hover:text-kala-terracotta transition-colors">
              {data.users.total}
            </div>
            <div className="text-sm font-medium text-stone-600 mt-0.5">Platform Users</div>
            <p className="text-xs text-stone-400 mt-2">
              {data.users.students} students · {data.users.instructors} instructors ·{' '}
              {data.users.blocked} blocked
            </p>
          </Card>
        </Link>

        {/* Instructor Applications */}
        <Link to="/admin/applications" className="block group">
          <Card hover className="p-5 h-full border-stone-200/80">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl text-kala-terracotta bg-amber-50">
                <Palette size={20} />
              </div>
              {data.applications.pending > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Needs review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  All clear
                </span>
              )}
            </div>
            <div className="text-2xl font-extrabold text-stone-800 group-hover:text-kala-terracotta transition-colors">
              {data.applications.pending}
            </div>
            <div className="text-sm font-medium text-stone-600 mt-0.5">Pending Applications</div>
            <p className="text-xs text-stone-400 mt-2">
              {data.applications.approved} approved · {data.applications.changesRequested} changes
              requested
            </p>
          </Card>
        </Link>
      </div>

      {/* ── Secondary Health Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="px-4 py-3 border-stone-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500">Avg. Booking Value</p>
            <p className="text-base font-bold text-stone-800 mt-0.5">
              {formatPrice(data.revenue.avgBookingValue)}
            </p>
          </div>
          <TrendingUp size={18} className="text-kala-amber" />
        </Card>

        <Card className="px-4 py-3 border-stone-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500">Payment Success Rate</p>
            <p className="text-base font-bold text-stone-800 mt-0.5">{paymentSuccessRate}%</p>
          </div>
          <CheckCircle2 size={18} className="text-emerald-600" />
        </Card>

        <Card className="px-4 py-3 border-stone-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500">Active Skills Catalog</p>
            <p className="text-base font-bold text-stone-800 mt-0.5">
              {data.catalog.activeCategories} cats · {data.catalog.activeSubcategories} skills
            </p>
          </div>
          <Sparkles size={18} className="text-purple-600" />
        </Card>

        <Card className="px-4 py-3 border-stone-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500">Approved Offerings</p>
            <p className="text-base font-bold text-stone-800 mt-0.5">
              {data.catalog.approvedOfferings}
            </p>
          </div>
          <BookOpen size={18} className="text-blue-600" />
        </Card>
      </div>

      {/* ── Charts Row 1: Time-Series Trend + Booking Status Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Trend AreaChart */}
        <Card className="lg:col-span-8 p-5 border-stone-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-stone-800">Platform Activity Trend</h2>
              <p className="text-xs text-stone-500">
                Daily {activeTrendConfig.label.toLowerCase()} across {rangeLabel.toLowerCase()}
              </p>
            </div>
            <div className="inline-flex bg-stone-100 rounded-xl p-1 self-start sm:self-auto">
              {TREND_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTrendMetric(tab.key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    trendMetric === tab.key
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.dailySeries}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeTrendConfig.color} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={activeTrendConfig.color} stopOpacity={0.02} />
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
                    width={trendMetric === 'revenue' ? 56 : 36}
                    allowDecimals={false}
                    tickFormatter={(val: number) =>
                      trendMetric === 'revenue'
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
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                    }}
                    formatter={(value) => {
                      const num = Number(value ?? 0);
                      return trendMetric === 'revenue'
                        ? [formatPrice(num), 'Revenue']
                        : [num, trendMetric === 'bookings' ? 'Bookings' : 'New Users'];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={trendMetric}
                    stroke={activeTrendConfig.color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-sm">
                <TrendingUp size={28} className="mb-2 opacity-35" />
                No {activeTrendConfig.label.toLowerCase()} recorded in {rangeLabel.toLowerCase()}.
              </div>
            )}
          </div>
        </Card>

        {/* Booking Status Distribution Donut */}
        <Card className="lg:col-span-4 p-5 border-stone-200/80 flex flex-col">
          <div className="mb-3">
            <h2 className="text-base font-bold text-stone-800">Booking Breakdown</h2>
            <p className="text-xs text-stone-500">
              Distribution across {totalBookingBreakdownCount} bookings
            </p>
          </div>

          {data.bookingStatusBreakdown.length > 0 ? (
            <>
              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.bookingStatusBreakdown}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {data.bookingStatusBreakdown.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={BOOKING_STATUS_COLORS[entry.status] ?? '#a8a29e'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #e7e5e4',
                        fontSize: '12px',
                      }}
                      formatter={(value, name) => [
                        `${value} bookings`,
                        getBookingStatusLabel(String(name)),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-stone-800">
                    {totalBookingBreakdownCount}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">Total</span>
                </div>
              </div>

              <div className="space-y-2 mt-2 flex-1">
                {data.bookingStatusBreakdown.map((item) => {
                  const pct =
                    totalBookingBreakdownCount > 0
                      ? Math.round((item.count / totalBookingBreakdownCount) * 100)
                      : 0;
                  return (
                    <div key={item.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: BOOKING_STATUS_COLORS[item.status] ?? '#a8a29e',
                          }}
                        />
                        <span className="text-stone-600 font-medium">
                          {getBookingStatusLabel(item.status)}
                        </span>
                      </div>
                      <span className="font-semibold text-stone-800">
                        {item.count} <span className="text-stone-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-sm py-10">
              <CalendarDays size={28} className="mb-2 opacity-35" />
              No bookings recorded yet.
            </div>
          )}
        </Card>
      </div>

      {/* ── Charts Row 2: Top Categories + User Acquisition & Payment Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Performing Categories */}
        <Card className="lg:col-span-6 p-5 border-stone-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-800">Top Creative Categories</h2>
              <p className="text-xs text-stone-500">
                Revenue generated from confirmed &amp; completed sessions
              </p>
            </div>
            <Link
              to="/admin/skills"
              className="text-xs font-semibold text-kala-terracotta hover:underline flex items-center gap-0.5"
            >
              Manage <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="h-64 w-full">
            {data.topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topCategories}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
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
                    dataKey="name"
                    width={105}
                    tick={{ fontSize: 12, fill: '#44403c', fontWeight: 500 }}
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
                  <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={22}>
                    {data.topCategories.map((cat, idx) => (
                      <Cell
                        key={cat.id}
                        fill={CATEGORY_BAR_COLORS[idx % CATEGORY_BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-sm">
                <Palette size={28} className="mb-2 opacity-35" />
                No category bookings recorded yet.
              </div>
            )}
          </div>
        </Card>

        {/* User Signups BarChart + Payment Summary */}
        <Card className="lg:col-span-6 p-5 border-stone-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-800">User Registrations ({range})</h2>
              <p className="text-xs text-stone-500">
                {data.users.newInRange} new accounts created in {rangeLabel.toLowerCase()}
              </p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-kala-terracotta hover:underline flex items-center gap-0.5"
            >
              All Users <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="h-44 w-full">
            {hasUserGrowthData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailySeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#78716c' }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={20}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e7e5e4',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [Number(value ?? 0), 'New Users']}
                  />
                  <Bar dataKey="newUsers" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-sm">
                <UserPlus size={26} className="mb-2 opacity-35" />
                No new signups in {rangeLabel.toLowerCase()}.
              </div>
            )}
          </div>

          {/* Payment status mini pills */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Payment Gateway Breakdown
            </p>
            {data.paymentStatusBreakdown.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.paymentStatusBreakdown.map((p) => (
                  <div
                    key={p.status}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs"
                  >
                    <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                    <span className="font-bold text-stone-800">{p.count}</span>
                    {typeof p.amount === 'number' && p.amount > 0 && (
                      <span className="text-stone-400">({formatPrice(p.amount)})</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400">No payments recorded yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* ── Operational Queues & Top Instructors ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Applications */}
        <Card className="lg:col-span-4 p-5 border-stone-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-800">Application Queue</h2>
              <p className="text-xs text-stone-500">Awaiting admin verification</p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-kala-terracotta hover:underline"
            >
              View All
            </Link>
          </div>

          {data.pendingApplications.length > 0 ? (
            <div className="space-y-3 flex-1">
              {data.pendingApplications.map((app) => (
                <Link
                  key={app.id}
                  to={`/admin/applications/${app.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50/40 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {app.instructorName}
                    </p>
                    <p className="text-xs text-stone-400 truncate">
                      {app.offeringsCount} offering
                      {app.offeringsCount === 1 ? '' : 's'} · {formatDate(app.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status === 'CHANGES_REQUESTED' ? 'CHANGES' : 'PENDING'}
                    </Badge>
                    <ChevronRight size={14} className="text-stone-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-stone-400">
              <CheckCircle2 size={28} className="text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-stone-600">Queue is clear</p>
              <p className="text-xs text-stone-400 mt-0.5">
                No pending instructor applications right now.
              </p>
            </div>
          )}
        </Card>

        {/* Top Instructors Leaderboard */}
        <Card className="lg:col-span-4 p-5 border-stone-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-800 flex items-center gap-1.5">
                <Award size={17} className="text-kala-amber" /> Top Instructors
              </h2>
              <p className="text-xs text-stone-500">Ranked by session revenue</p>
            </div>
          </div>

          {data.topInstructors.length > 0 ? (
            <div className="space-y-3 flex-1">
              {data.topInstructors.map((inst, index) => (
                <div
                  key={inst.profileId}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50/70 border border-stone-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-stone-400 w-4 text-center">
                      #{index + 1}
                    </span>
                    <Avatar name={inst.name} src={inst.imageUrl ?? undefined} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{inst.name}</p>
                      <p className="text-xs text-stone-400">
                        {inst.bookingsCount} booking
                        {inst.bookingsCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-kala-brown shrink-0">
                    {formatPrice(inst.revenue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-stone-400">
              <Award size={28} className="mb-2 opacity-35" />
              <p className="text-xs">No confirmed sessions yet.</p>
            </div>
          )}
        </Card>

        {/* Recent Bookings */}
        <Card className="lg:col-span-4 p-5 border-stone-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-800 flex items-center gap-1.5">
                <Clock size={16} className="text-blue-600" /> Recent Bookings
              </h2>
              <p className="text-xs text-stone-500">Latest student activity</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs font-semibold text-kala-terracotta hover:underline"
            >
              View All
            </Link>
          </div>

          {data.recentBookings.length > 0 ? (
            <div className="space-y-2.5 flex-1">
              {data.recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  to={`/admin/bookings/${booking.id}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">
                      {booking.offeringTitle}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate">
                      {booking.studentName} → {booking.instructorName}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-xs font-bold text-stone-800">
                      {formatPrice(booking.amount)}
                    </p>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {getBookingStatusLabel(booking.status)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-stone-400">
              <CalendarDays size={28} className="mb-2 opacity-35" />
              <p className="text-xs">No bookings placed yet.</p>
            </div>
          )}
        </Card>
      </div>

      {/* ── Quick Operational Consoles ── */}
      <div>
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3">
          Management Consoles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/bookings">
            <Card hover className="p-4 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 flex items-center gap-1.5">
                    <CalendarDays size={16} className="text-kala-amber" /> Booking Monitoring
                  </h3>
                  <p className="text-xs text-stone-500">
                    Audit sessions, monitor statuses, and manage holds.
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </div>
            </Card>
          </Link>

          <Link to="/admin/payments">
            <Card hover className="p-4 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 flex items-center gap-1.5">
                    <CreditCard size={16} className="text-purple-600" /> Payments Overview
                  </h3>
                  <p className="text-xs text-stone-500">
                    Track settlements, inspect transactions, and issue refunds.
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </div>
            </Card>
          </Link>

          <Link to="/admin/applications">
            <Card hover className="p-4 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 flex items-center gap-1.5">
                    <Palette size={16} className="text-emerald-600" /> Applications
                  </h3>
                  <p className="text-xs text-stone-500">
                    Review and approve instructor profiles and offerings.
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </div>
            </Card>
          </Link>

          <Link to="/admin/skills">
            <Card hover className="p-4 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-blue-600" /> Skills Catalog
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage categories and subcategories for offerings.
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
