import { ReactNode, useState, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
});

export const useLayout = () => useContext(LayoutContext);

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <LayoutContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      <div className="min-h-screen bg-background industrial-grid">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main 
          className="min-h-screen transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? '4rem' : '16rem' }}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </LayoutContext.Provider>
  );
}
