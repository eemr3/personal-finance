import { motion } from 'motion/react';
import {
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  User,
  CreditCard,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface DashboardHeaderProps {
  userName: string;
  userPhoto?: string;
  balance: number;
  onLogout: () => void;
}

export function Header({
  userName,
  userPhoto,
  balance,
  onLogout,
}: DashboardHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 pt-6 pb-8 rounded-b-4xl shadow-lg">
      {/* Top bar - Avatar, Nome e Ações */}
      <div className="flex items-center justify-between mb-8">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={userName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-linear-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-700" />
                </div>
              )}
            </div>
            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
          </div>

          {/* User Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-3 py-2 transition-all"
            >
              <div className="text-left">
                <p className="text-xs text-white/80">Bem-vindo</p>
                <p className="font-semibold text-sm">{userName}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50"
              >
                <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-sm transition-colors">
                  <User className="w-4 h-4" />
                  Meu Perfil
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-sm transition-colors">
                  <CreditCard className="w-4 h-4" />
                  Cartões
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-sm transition-colors">
                  <Settings className="w-4 h-4" />
                  Configurações
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <button className="relative w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm">
            <Bell className="w-5 h-5 text-white" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold shadow-lg">
              3
            </span>
          </button>
          <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
