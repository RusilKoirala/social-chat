import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Users, User } from 'lucide-react';

export default function MobileNav() {
  const navItems = [
    { to: '/app', icon: Home, label: 'Home' },
    { to: '/app/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/app/friends', icon: Users, label: 'Friends' },
    { to: '/app/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-4 flex-1 transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`
            }
          >
            <item.icon size={24} />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
