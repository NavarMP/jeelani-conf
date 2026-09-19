import React from "react";
import { getAnalyticsData, getZonesData, getAdminDashboardStats } from "@/lib/data";
import { StatCard } from "@/components/admin/analytics/StatCard";
import { RegistrationGrowthChart } from "@/components/admin/analytics/RegistrationGrowthChart";
import { ZoneOccupancyRadar } from "@/components/admin/analytics/ZoneOccupancyRadar";
import { FeedbackSentimentPie } from "@/components/admin/analytics/FeedbackSentimentPie";
import { Users, Banknote, Star, Radio } from "lucide-react";

export const metadata = {
  title: "Event Intelligence | GJC Admin",
  description: "Real-time event analytics and performance metrics",
};

export default async function AnalyticsDashboard() {
  const [analytics, zones, adminStats] = await Promise.all([
    getAnalyticsData(),
    getZonesData(),
    getAdminDashboardStats()
  ]);

  // Mocking registration growth for the mini-table
  const recentGrowth = [
    { date: "Today", assembly: 142, dynamic: 85 },
    { date: "Yesterday", assembly: 110, dynamic: 60 },
    { date: "2 days ago", assembly: 95, dynamic: 45 },
    { date: "3 days ago", assembly: 125, dynamic: 90 },
  ];

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--admin-text)] tracking-tight">Event Intelligence</h1>
          <p className="text-[var(--admin-text-secondary)] mt-1">Real-time registrations, revenue, and venue metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] text-xs font-medium text-[var(--admin-text-secondary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Data Feed Active
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Ticket Revenue"
          value={`₹${analytics.totalRevenue.toLocaleString()}`}
          icon={<Banknote className="w-5 h-5" />}
          trend={{ value: 12.5, label: "vs last week", isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Total Registrations"
          value={analytics.totalRegistrations.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 5.2, label: "vs yesterday", isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="Global Rating"
          value={`${analytics.feedbackStats.avgRating.toFixed(1)} / 5.0`}
          icon={<Star className="w-5 h-5" />}
          trend={{ value: 0.2, label: "sentiment index", isPositive: true }}
          delay={0.3}
        />
        <StatCard
          title="Live Streams"
          value={analytics.liveStreams.isAnyLive ? "ON AIR" : "OFFLINE"}
          icon={<Radio className="w-5 h-5" />}
          className={analytics.liveStreams.isAnyLive ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : ""}
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RegistrationGrowthChart data={analytics.dailyTrend} />
        </div>
        <div>
          <FeedbackSentimentPie data={analytics.feedbackStats.sentimentDistribution} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZoneOccupancyRadar data={zones.zones} />
        
        {/* Registration Trends Mini-table */}
        <div className="flex flex-col rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[var(--admin-text)]">Recent Registration Growth</h3>
            <p className="text-sm text-[var(--admin-text-secondary)] mt-1">Assembly vs Dynamic sessions</p>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--admin-text-secondary)] uppercase bg-[var(--admin-surface-alt)]">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Date</th>
                  <th className="px-4 py-3">Assembly</th>
                  <th className="px-4 py-3">Dynamic</th>
                  <th className="px-4 py-3 rounded-tr-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentGrowth.map((day: any, idx: number) => (
                  <tr key={idx} className="border-b border-[var(--admin-border-subtle)] hover:bg-[var(--admin-surface-alt)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--admin-text)]">{day.date}</td>
                    <td className="px-4 py-3 text-blue-500 font-medium">+{day.assembly}</td>
                    <td className="px-4 py-3 text-purple-500 font-medium">+{day.dynamic}</td>
                    <td className="px-4 py-3 font-bold text-[var(--admin-text)]">+{day.assembly + day.dynamic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
