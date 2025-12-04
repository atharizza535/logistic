import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Search, 
  Settings,
  Package,
  ChevronLeft,
  ChevronRight,
  Radio,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SettingsModal } from '@/components/SettingsModal';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: 'Live Operations',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Merchant Simulator',
    href: '/merchant',
    icon: ShoppingCart,
  },
  {
    title: 'Ops Simulator',
    href: '/operations',
    icon: Workflow,
  },
  {
    title: 'Partner Tracker',
    href: '/tracker',
    icon: Search,
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Package className="h-6 w-6 text-primary" />
                  <Radio className="absolute -right-1 -top-1 h-3 w-3 text-primary animate-pulse" />
                </div>
                <span className="font-semibold text-sidebar-foreground">LogiCommand</span>
              </div>
            )}
            {collapsed && (
              <div className="mx-auto">
                <Package className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-primary glow-emerald'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                collapsed && 'justify-center'
              )}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Settings</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
