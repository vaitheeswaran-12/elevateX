import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Bell,
  Award,
  Briefcase,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function NotificationsView() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      if (!token) return;
      try {
        const res = await fetch('/api/student/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const d = await res.json();
          setNotifications(d);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/student/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      const res = await fetch('/api/student/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Maps notification types to corresponding visual icons
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Certificate Ready':
        return <Award className="w-5 h-5 text-green-500" />;
      case 'New Job':
        return <Briefcase className="w-5 h-5 text-indigo-500" />;
      case 'Quiz Reminder':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header detailing stats and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Notification System</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Stay updated with newly uploaded courses, quiz reminders, placement schedules, and certificates.</p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-100 dark:border-gray-700 shrink-0"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
          <Bell className="w-12 h-12 text-gray-300 mx-auto animate-swing" />
          <p className="text-gray-500 font-semibold text-sm">No notifications found.</p>
          <p className="text-xs text-gray-400">We'll alert you immediately when active events arise.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                item.is_read
                  ? 'bg-white dark:bg-gray-900/60 border-gray-100 dark:border-gray-800/80 opacity-70'
                  : 'bg-white dark:bg-gray-900 border-primary/20 dark:border-primary/40 shadow-soft'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  item.is_read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary/5 dark:bg-primary/20'
                }`}>
                  {getNotificationIcon(item.type)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                    <span>{item.title}</span>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-ping"></span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed break-words">{item.message}</p>
                </div>
              </div>

              {!item.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkSingleRead(item.id)}
                  className="text-xs font-bold text-primary hover:underline shrink-0 ml-2"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
