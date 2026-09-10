'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, notificationsApi } from '../../lib/api';
import { NotificationItem } from '@maheall/shared';
import {
  IconLogOut,
  IconUser,
  IconBell,
  IconCheck,
  IconX,
  IconClock,
  IconRefresh,
} from '../ui/icons';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ phone?: string; roles?: string[] } | null>(null);

  // Notification state
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getMy({ limit: 15 });
      if (res.data) {
        setNotifications(res.data.items || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch {
      // Ignore in demo/fallback mode
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAuthed =
      localStorage.getItem('maheall_admin_auth') === 'true' ||
      !!localStorage.getItem('access_token');

    if (!isAuthed) {
      router.push('/admin/login');
      return;
    }

    authApi
      .getMe()
      .then((res) => {
        if (res.data) setUser(res.data);
      })
      .catch(() => {
        setUser({ phone: '+919846012345', roles: ['MAHAL_ADMIN'] });
      });

    fetchNotifications();

    // Poll for notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [router]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMarkingId(id);
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Local fallback
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch {
      // Local fallback
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })),
      );
      setUnreadCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore error
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('maheall_admin_auth');
    }
    router.push('/admin/login');
  };

  const formatRelativeTime = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getCategoryBadgeClass = (type: string) => {
    switch (type) {
      case 'JANAZAH':
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'FINANCE':
      case 'PIRIVU':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'MADRASA':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EVENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 fixed top-0 right-0 left-0 lg:left-64 z-20 px-4 sm:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
            aria-label="Toggle Admin Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5 sm:gap-2">
          <span className="truncate max-w-[140px] sm:max-w-none">Mahal Digital OS</span>
          <span className="text-gray-300">•</span>
          <span className="text-emerald-800 font-bold truncate">Management Portal</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) fetchNotifications();
            }}
            className={`relative p-2.5 rounded-xl text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 transition border border-transparent hover:border-emerald-200 ${
              isOpen ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ''
            }`}
            title="Notifications"
          >
            <IconBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full text-[10px] min-w-4 h-4 px-1 flex items-center justify-center font-black animate-pulse shadow-sm border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Modal */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-emerald-900/10 z-50 overflow-hidden animate-fadeIn">
              <div className="p-4 bg-emerald-50/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-black">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline flex items-center gap-1"
                    >
                      <IconCheck className="w-3.5 h-3.5" /> Mark read
                    </button>
                  )}
                  <button
                    onClick={() => fetchNotifications()}
                    disabled={isLoading}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition"
                    title="Refresh"
                  >
                    <IconRefresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <IconBell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-700">No notifications yet</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      New updates and circulars will appear here
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !n.read_at;
                    return (
                      <div
                        key={n.id}
                        className={`p-4 hover:bg-gray-50 transition flex items-start gap-3 cursor-pointer ${
                          isUnread ? 'bg-emerald-50/40' : ''
                        }`}
                        onClick={(e) => {
                          if (isUnread) handleMarkAsRead(n.id, e);
                        }}
                      >
                        {/* Unread indicator dot */}
                        <div className="mt-1 flex-shrink-0">
                          {isUnread ? (
                            <span className="block w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                          ) : (
                            <span className="block w-2.5 h-2.5 rounded-full bg-gray-200" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md border font-black uppercase ${getCategoryBadgeClass(
                                n.type,
                              )}`}
                            >
                              {n.type}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5 ml-auto font-mono">
                              <IconClock className="w-3 h-3" />
                              {formatRelativeTime(n.created_at)}
                            </span>
                          </div>

                          <h4
                            className={`text-xs ${
                              isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                            } leading-snug line-clamp-1`}
                          >
                            {n.title}
                          </h4>

                          {n.body && (
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {n.body}
                            </p>
                          )}
                        </div>

                        {isUnread && (
                          <button
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            disabled={markingId === n.id}
                            className="text-gray-400 hover:text-emerald-800 p-1 rounded-lg hover:bg-white transition flex-shrink-0"
                            title="Mark as read"
                          >
                            <IconCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                  <span className="text-[11px] text-gray-500 font-medium">
                    Showing latest notifications &bull; Real-time alerts
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User profile dropdown / info */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-400/30 shadow-xs">
            <IconUser className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-black text-gray-900 leading-tight">
              {user?.phone ?? 'Admin Desk'}
            </div>
            <div className="text-[10px] text-emerald-800 font-bold leading-tight uppercase tracking-wider">
              {user?.roles?.[0] ?? 'MAHAL_ADMIN'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="ml-2 p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <IconLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
