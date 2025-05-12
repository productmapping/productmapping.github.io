
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  
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
              <Link 
                to="/reference"
                className={`font-medium transition-colors ${
                  location.pathname === '/reference' 
                    ? 'text-tech-blue' 
                    : 'text-muted-foreground hover:text-tech-purple'
                }`}
              >
                {t('nav.reference')}
              </Link>
            </nav>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-tech-purple"
              onClick={toggleLanguage}
            >
              <Languages className="h-5 w-5 mr-1" />
              <span>{language.toUpperCase()}</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AI Product Analyzer
        </div>
      </footer>
    </div>
  );
};

export default Layout;
