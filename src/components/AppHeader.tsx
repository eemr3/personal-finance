'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface AppHeaderProps {
  /** Título principal (ex: "Olá, User" ou "Transações") */
  title: React.ReactNode;
  /** Subtítulo opcional (ex: "Aqui está sua visão geral financeira") */
  subtitle?: React.ReactNode;
  /** Conteúdo extra à esquerda, antes do avatar (ex: filtros, busca) */
  children?: React.ReactNode;
}

export function AppHeader({ title, subtitle, children }: AppHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const displayName = user?.displayName || 'User';
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="w-full bg-primary text-primary-foreground px-4 pt-6 pb-6 rounded-b-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {children}
          <h1 className="text-xl md:text-2xl font-semibold leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/15 focus-visible:ring-white/50"
              aria-label={t('header.openMenu')}
            >
              <Avatar>
                <AvatarImage
                  src={user?.photoURL ?? undefined}
                  alt={displayName}
                />
                <AvatarFallback className="bg-white/20 text-primary-foreground text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push('/settings/profile')}
                className="cursor-pointer"
              >
                <User size={16} className="mr-2" />
                {t('header.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="cursor-pointer"
              >
                <Settings size={16} className="mr-2" />
                {t('header.settings')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => logout()}
                className="cursor-pointer"
                variant="destructive"
              >
                <LogOut size={16} className="mr-2" />
                {t('header.logout')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
