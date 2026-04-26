
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Trash2, CheckCircle2, ShieldAlert, BellOff, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    requestPermission,
    permissionStatus 
  } = useNotifications();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-[#6C63FF]' : 'text-gray-400'} />
        {unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[#6C63FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0a0a0a]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-[360px] bg-[#1a1a1a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="font-bold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] text-[#6C63FF] font-bold hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={clearAll}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {permissionStatus !== 'granted' && (
                  <div className="p-4 bg-[#6C63FF]/10 border-b border-[#6C63FF]/20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ShieldAlert size={16} className="text-[#6C63FF]" />
                      <p className="text-[10px] text-[#6C63FF] font-medium">Turn on browser notifications?</p>
                    </div>
                    <button 
                      onClick={requestPermission}
                      className="bg-[#6C63FF] text-white text-[10px] font-bold px-3 py-1.5 rounded-full"
                    >
                      Enable
                    </button>
                  </div>
                )}

                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-500 space-y-3">
                    <BellOff size={32} strokeWidth={1.5} />
                    <p className="text-sm font-medium">No alerts yet</p>
                    <p className="text-[11px] text-center px-10">We'll notify you about your workouts and AI tips here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notif) => (
                      <motion.div 
                        key={notif.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 flex items-start space-x-4 transition-colors ${notif.read ? 'opacity-60' : 'bg-white/5'}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${
                          notif.type === 'success' ? 'bg-green-500/10 text-green-500' :
                          notif.type === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-[#6C63FF]/10 text-[#6C63FF]'
                        }`}>
                          {notif.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                            <span className="text-[9px] text-gray-500">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed">{notif.message}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-[#6C63FF] rounded-full mt-2" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
