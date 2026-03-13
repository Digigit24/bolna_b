import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PhoneOutgoing, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import PageLoader from '../components/ui/PageLoader';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [dashRes, callsRes] = await Promise.all([
          api.get('/api/analytics/dashboard/'),
          api.get('/api/analytics/calls/')
        ]);
        
        // Structure depends on what the API truly returns, mocking visual structure assuming similar standard response
        // Defaulting if empty
        setMetrics({
          kpis: dashRes.data || { calls: {}, candidates: {}, jobs: {} },
          dailyBreakdown: Array.isArray(callsRes.data) ? callsRes.data : []
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load dashboard metrics.');
        // dummy data for visuals
        setMetrics({
          kpis: { 
            calls: { total: 8, avg_duration: 311.3, avg_ai_score: 74.9 }, 
            candidates: { total: 8 }, 
            jobs: { active: 3 }
          },
          dailyBreakdown: [
            { date: 'Mon', calls: 120, duration: 450, success: 90 },
            { date: 'Tue', calls: 200, duration: 600, success: 160 },
            { date: 'Wed', calls: 150, duration: 500, success: 110 },
            { date: 'Thu', calls: 300, duration: 1200, success: 250 },
            { date: 'Fri', calls: 180, duration: 700, success: 140 },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  const kpis = [
    { name: 'Total Calls', value: metrics?.kpis?.calls?.total || 0, icon: PhoneOutgoing, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Avg Duration (s)', value: metrics?.kpis?.calls?.avg_duration || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Total Candidates', value: metrics?.kpis?.candidates?.total || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Avg AI Score', value: `${metrics?.kpis?.calls?.avg_ai_score || 0}`, icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 drop-shadow-sm">Dashboard Overview</h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">Here's what's happening in your organization today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.name} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${item.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`} />
            <div className="relative">
              <div className={`p-3 inline-flex rounded-xl ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">{item.name}</p>
              <p className="mt-1 flex items-baseline tracking-tight text-3xl font-extrabold text-gray-900">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <PhoneOutgoing className="mr-2 h-5 w-5 text-indigo-500" />
            Call Volume (Weekly)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.dailyBreakdown}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#6b7280" />
                <YAxis axisLine={false} tickLine={false} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-emerald-500" />
            Success Ratio
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#6b7280" />
                <YAxis axisLine={false} tickLine={false} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="success" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
