/**
 * MR. MAYOR - Notification Drawer Component (Editorial Aesthetic)
 */

import React from 'react';
import { X, Bell, GitMerge, FileCheck2, FileBadge, MessageSquareWarning, Flame } from 'lucide-react';
import { SystemNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onNavigate: (tabId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'COORDINATION':
        return <GitMerge className="w-4 h-4 text-[#A35C28]" />;
      case 'APPROVAL':
        return <FileCheck2 className="w-4 h-4 text-[#2B4C6F]" />;
      case 'PERMIT':
        return <FileBadge className="w-4 h-4 text-[#2E6B4F]" />;
      case 'COMPLAINT':
        return <MessageSquareWarning className="w-4 h-4 text-[#A35C28]" />;
      case 'EMERGENCY':
        return <Flame className="w-4 h-4 text-[#A35C28] animate-pulse" />;
      default:
        return <Bell className="w-4 h-4 text-[#737373]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-[#FDFCFB] border-l border-[#1A1A1A]/15 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#1A1A1A]/10 flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#1A1A1A]" />
            <h2 className="text-base font-serif-editorial font-bold text-[#1A1A1A]">
              Live System Notifications
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F0EEEB] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#FDFCFB]">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#8A8A8A] text-xs">No active notifications.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) onMarkRead(n.id);
                  if (n.link) {
                    const tab = (n.link || '').replace('/', '');
                    onNavigate(tab);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border text-xs space-y-1 transition-all cursor-pointer bg-[#FFFFFF] ${
                  n.isRead
                    ? 'border-[#1A1A1A]/10 text-[#737373] hover:border-[#1A1A1A]/20'
                    : 'border-[#1A1A1A]/30 text-[#1A1A1A] shadow-xs hover:border-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-[#1A1A1A]">
                    {getIcon(n.type)}
                    <span className="truncate">{n.title}</span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#A35C28] shrink-0" title="Unread" />
                  )}
                </div>
                <p className="text-[11px] text-[#5A5A5A] line-clamp-2 leading-relaxed">{n.message}</p>
                <div className="text-[10px] text-[#8A8A8A] pt-1 flex items-center justify-between border-t border-[#1A1A1A]/5">
                  <span className="font-mono">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[#1A1A1A] font-semibold hover:underline">View details →</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
