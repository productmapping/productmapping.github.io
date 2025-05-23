import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-tech-purple to-tech-blue">
                <span className="text-white font-bold">AI</span>
              </div>
              <span className="text-lg font-bold gradient-text">AI Product Analyzer</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/"
                className={`font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-tech-blue' 
                    : 'text-muted-foreground hover:text-tech-purple'
                }`}
              >
                {t('nav.home')}
              </Link>
            </nav>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-tech-purple"
                onClick={toggleLanguage}
              >
                <Languages className="h-5 w-5 mr-1" />
                <span>{language.toUpperCase()}</span>
              </Button>
              
              {/* Mobile Navigation */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <nav className="flex flex-col space-y-4 mt-8">
                    <Link 
                      to="/"
                      className={`font-medium text-lg transition-colors ${
                        location.pathname === '/' 
                          ? 'text-tech-blue' 
                          : 'text-muted-foreground hover:text-tech-purple'
                      }`}
                    >
                      {t('nav.home')}
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} AI Product Analyzer - <span className="font-medium">Licensed to Strikingo</span>
          </div>
          <div className="mt-1">
            All rights reserved. This project is licensed under Strikingo's proprietary license.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
