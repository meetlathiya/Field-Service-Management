import React, { useState, useRef, useEffect } from 'react';
import { AppView } from '../types';
import { DashboardIcon, CalendarIcon, MenuIcon, CloseIcon } from './Icons';
// FIX: User type is now on the firebase namespace, imported from firebaseConfig to ensure v8 compatibility.
import firebase from '../services/firebaseConfig';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: firebase.User;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, user, onSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { view: AppView.Dashboard, label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5 mr-2" /> },
    { view: AppView.Calendar, label: 'Calendar', icon: <CalendarIcon className="w-5 h-5 mr-2" /> },
  ];
  
  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setIsMenuOpen(false);
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);


  return (
    <header className="bg-primary-dark shadow-md sticky top-0 z-20">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white font-bold text-xl flex items-center">
              <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-1.414-1.414M19.778 19.778l-1.414-1.414M18.364 5.636l1.414-1.414M4.222 19.778l1.414-1.414M12 12a6 6 0 100-12 6 6 0 000 12z"></path></svg>
              Payal Electronics
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.view)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      currentView === item.view
                        ? 'bg-primary-light text-white'
                        : 'text-gray-300 hover:bg-primary-light hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
                 <div className="relative" ref={userMenuRef}>
                    <div>
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="max-w-xs bg-primary-dark rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-white">
                            <span className="sr-only">Open user menu</span>
                            <img className="h-8 w-8 rounded-full" src={user.photoURL || undefined} alt="User avatar" />
                        </button>
                    </div>
                    {isUserMenuOpen && (
                         <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-30">
                            <div className="px-4 py-2 border-b">
                                <p className="text-sm text-gray-700 font-semibold truncate">{user.displayName}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <button onClick={onSignOut} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
            >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <CloseIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
            <div className="md:hidden" id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                     {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => handleNavClick(item.view)}
                            className={`w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                            currentView === item.view
                                ? 'bg-primary-light text-white'
                                : 'text-gray-300 hover:bg-primary-light hover:text-white'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
                 <div className="pt-4 pb-3 border-t border-primary-light">
                    <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={user.photoURL || undefined} alt="User avatar" />
                        </div>
                        <div className="ml-3">
                            <div className="text-base font-medium leading-none text-white">{user.displayName}</div>
                            <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                        </div>
                    </div>
                    <div className="mt-3 px-2 space-y-1">
                        <button onClick={onSignOut} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-primary-light">
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        )}
      </nav>
    </header>
  );
};
