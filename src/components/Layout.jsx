import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo } from './BrandLogo';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/add-lead', label: 'Add Lead' },
  { to: '/leads', label: 'Lead List' },
];

function NavItem({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-700 text-white'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export function Layout() {
  const { logout, user } = useAuth();
  const { dark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 px-1">
          <BrandLogo size="md" />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="truncate px-2 text-xs text-slate-500">Signed in as {user?.username}</p>
          <button type="button" className="btn-secondary w-full" onClick={toggle}>
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <button type="button" className="btn-primary w-full" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:hidden">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
          <BrandLogo size="sm" showTagline={false} className="min-w-0 flex-1" />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
