import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';

export default function ThemeToggleButton({ variant = 'default', url }) {
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTheme = () => {
    if (variant === 'gif' && url) {
      setIsAnimating(true);
      
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: url('${url}') center/contain no-repeat;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-in-out;
      `;
      
      // Add fade in animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(overlay);
      
      // Change theme after a short delay
      setTimeout(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
      }, 500);
      
      // Remove overlay
      setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.3s ease-in-out';
        setTimeout(() => {
          document.body.removeChild(overlay);
          document.head.removeChild(style);
          setIsAnimating(false);
        }, 300);
      }, 1000);
    } else {
      // Default toggle without animation
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      disabled={isAnimating}
      className="p-3 hover:bg-accent rounded-md transition-colors disabled:opacity-50"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-muted-foreground hover:text-foreground" />
      ) : (
        <Sun size={20} className="text-muted-foreground hover:text-foreground" />
      )}
    </button>
  );
}
