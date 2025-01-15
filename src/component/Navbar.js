// NavBar.js
import React, { useEffect, useState } from 'react';
import { auth } from '../Config/FireBase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Menu, X, User, Home, Activity, Settings, LogOut } from 'lucide-react';

const Navbar = ({ onLoginClick }) => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScrollEvent);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScrollEvent);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ease-in-out 
      ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white/50 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Health Buddy
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#hero-section" 
              onClick={(e) => handleScroll(e, 'hero-section')}
              className="text-gray-600 hover:text-blue-500 transition-colors duration-200 flex items-center space-x-1"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </a>
            <a 
              href="#ai" 
              onClick={(e) => handleScroll(e, 'ai')}
              className="text-gray-600 hover:text-blue-500 transition-colors duration-200 flex items-center space-x-1"
            >
              <Activity className="h-4 w-4" />
              <span>Nutritioner</span>
            </a>
            <a 
              href="#tracker" 
              onClick={(e) => handleScroll(e, 'tracker')}
              className="text-gray-600 hover:text-blue-500 transition-colors duration-200 flex items-center space-x-1"
            >
              <Activity className="h-4 w-4" />
              <span>Physical</span>
            </a>
            <a 
              href="#Health_Analisis" 
              onClick={(e) => handleScroll(e, 'Health_Analisis')}
              className="text-gray-600 hover:text-blue-500 transition-colors duration-200 flex items-center space-x-1"
            >
              <Activity className="h-4 w-4" />
              <span>Health Analisis</span>
            </a>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center space-x-1 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="pt-2 pb-4 space-y-1">
            <a 
              href="#hero-section"
              onClick={(e) => handleScroll(e, 'hero-section')}
              className="block px-3 py-2 rounded-md text-gray-600 hover:text-blue-500 hover:bg-gray-50 transition-colors duration-200"
            >
              Home
            </a>
            <a 
              href="#ai"
              onClick={(e) => handleScroll(e, 'ai')}
              className="block px-3 py-2 rounded-md text-gray-600 hover:text-blue-500 hover:bg-gray-50 transition-colors duration-200"
            >
              Dashboard
            </a>
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-600">
                  {user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-red-50 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="w-full text-left px-3 py-2 rounded-md text-blue-500 hover:bg-blue-50 transition-colors duration-200"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;