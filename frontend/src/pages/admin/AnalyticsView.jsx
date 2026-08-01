import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  Users,
  Activity,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load system analytics.');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-gray-400 font-bold">Loading system analytics trends...</div>;
  }

  if (error) {
    return <div className="p-6 bg-rose-500/10 text-rose-500 rounded-2xl">{error}</div>;
  }

  const COLORS = ['#4f46e5', '#06b6d4', '#eab308', '#ec4899'];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Business Intelligence</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide transactional logs, registration rates, user engagement, and active cohorts.</p>
      </div>

      {/* Main Bar Chart: growth */}
      <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Monthly Demographic Growth</h3>
            <p className="text-xs text-gray-400 font-bold">Aggregate growth metrics for students, educators, and recruiters.</p>
          </div>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="students" name="Students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="instructors" name="Instructors" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recruiters" name="Recruiters" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Line Chart: DAU Trend */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Daily Active Cohorts (DAU)</h3>
            <p className="text-xs text-gray-400 font-bold">Unique authenticated user sessions traced inside the system.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dauTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="dau" stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Enrollment by category */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Academic Categories Distribution</h3>
            <p className="text-xs text-gray-400 font-bold">Total course enrollments segmented by educational vertical.</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.enrollmentsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.enrollmentsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 space-y-2">
              {data.enrollmentsByCategory.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="font-extrabold text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{item.name}</span>
                  <span className="text-gray-400 font-bold">({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
