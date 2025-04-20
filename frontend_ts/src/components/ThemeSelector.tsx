import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Check } from 'lucide-react';

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
  text?: string;
  contrastText?: string;
}

export const themes: Theme[] = [
  { 
    id: 'dark', 
    name: 'Dark', 
    primary: '#1a1a1a', 
    secondary: '#2d2d2d', 
    accent: '#3b82f6', 
    text: '#ffffff',
    background: '#121212',
    contrastText: 'rgba(255, 255, 255, 0.9)'
  },
  { 
    id: 'light', 
    name: 'Light', 
    primary: '#ffffff', 
    secondary: '#f0f0f0', 
    accent: '#2563eb', 
    text: '#000000',
    background: '#f9f9f9',
    contrastText: 'rgba(0, 0, 0, 0.9)'
  },
  { 
    id: 'blue', 
    name: 'Blue', 
    primary: '#1e3a8a', 
    secondary: '#2563eb', 
    accent: '#60a5fa', 
    text: '#ffffff',
    background: '#172554',
    contrastText: 'rgba(255, 255, 255, 0.9)'
  },
  { 
    id: 'green', 
    name: 'Green', 
    primary: '#064e3b', 
    secondary: '#059669', 
    accent: '#34d399', 
    text: '#ffffff',
    background: '#022c22',
    contrastText: 'rgba(255, 255, 255, 0.9)'
  },
  { 
    id: 'purple', 
    name: 'Purple', 
    primary: '#4c1d95', 
    secondary: '#7c3aed', 
    accent: '#8b5cf6', 
    text: '#ffffff',
    background: '#2e1065',
    contrastText: 'rgba(255, 255, 255, 0.9)'
  },
  { 
    id: 'red', 
    name: 'Red', 
    primary: '#7f1d1d', 
    secondary: '#dc2626', 
    accent: '#ef4444', 
    text: '#ffffff',
    background: '#450a0a',
    contrastText: 'rgba(255, 255, 255, 0.9)'
  },
  { 
    id: 'pink', 
    name: 'Pink', 
    primary: '#831843', 
    secondary: '#db2777', 
    accent: '#f472b6', 
    text: '#ffffff',
    background: '#500724',
    contrastText: 'rgba(255, 255, 255, 0.9)'
  },
  { 
    id: 'orange', 
    name: 'Orange', 
    primary: '#7c2d12', 
    secondary: '#ea580c', 
    accent: '#fb923c', 
    text: '#ffffff',
    background: '#431407',
    contrastText: 'rgba(255, 255, 255, 0.9)'
  },
  { 
    id: 'gradient', 
    name: 'Gradient', 
    primary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)', 
    secondary: '#4c1d95', 
    accent: '#f472b6', 
    text: '#ffffff',
    background: '#1a0536',
    contrastText: 'rgba(255, 255, 255, 0.9)'
  },
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onSelect: (themeId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedTheme, onSelect }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Theme</CardTitle>
        <CardDescription>Select a visual theme for your profile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelect(theme.id)}
              className={`p-4 h-16 rounded-lg border-2 relative transition-all duration-300 hover:scale-105 ${
                selectedTheme === theme.id
                  ? 'border-primary scale-105'
                  : 'border-transparent'
              }`}
              style={{ 
                background: theme.primary,
                color: theme.text || '#ffffff'
              }}
              title={theme.name}
            >
              <span className="sr-only">{theme.name}</span>
              {selectedTheme === theme.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm text-muted-foreground">
            Selected: {themes.find(t => t.id === selectedTheme)?.name || 'Custom'} theme
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector; 