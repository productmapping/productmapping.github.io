import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFileProcessing } from '@/contexts/FileProcessingContext';
import Layout from '@/components/Layout';
import FileUploader from '@/components/FileUploader';
import ProductTable from '@/components/ProductTable';
import { Progress } from '@/components/ui/progress';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check, Download, File, X, FileUp, Edit, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const {
    file,
    sheetNames,
    selectedSheet,
    extractedProducts,
    analyzedProducts,
    isLoading,
    isAnalyzing,
    loadingProgress,
    setFile,
    setSelectedSheet,
    updateProduct,
    deleteProduct,
    analyzeProducts,
    downloadCsv,
  } = useFileProcessing();
  
  const [fileName, setFileName] = useState<string>('');
  const uploadRef = useRef<HTMLDivElement>(null);
  const extractRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Highlight states
  const [highlightUpload, setHighlightUpload] = useState<boolean>(false);
  const [highlightExtract, setHighlightExtract] = useState<boolean>(false);
  const [highlightResult, setHighlightResult] = useState<boolean>(false);
  
  useEffect(() => {
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  }, [file]);

  // Scroll to results section when analysis is complete
  useEffect(() => {
    // If we were analyzing and now we're not, and we have results
    if (!isAnalyzing && analyzedProducts.length > 0) {
      scrollToSection(resultRef, 'result');
    }
  }, [isAnalyzing, analyzedProducts.length]);
  
  const handleSheetChange = (value: string) => {
    setSelectedSheet(value);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, section?: 'upload' | 'extract' | 'result') => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Reset highlights
    setHighlightUpload(false);
    setHighlightExtract(false);
    setHighlightResult(false);
    
    // Set highlight based on section
    if (section === 'upload') {
      setHighlightUpload(true);
      // Auto-remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightUpload(false);
      }, 3000);
    } else if (section === 'extract') {
      setHighlightExtract(true);
      // Auto-remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightExtract(false);
      }, 3000);
    } else if (section === 'result') {
      setHighlightResult(true);
      // Auto-remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightResult(false);
      }, 3000);
    }
  };

  // Wrap the original analyzeProducts function to handle additional UI logic
  const handleAnalyzeClick = async () => {
    // Scroll to results section immediately after clicking
    scrollToSection(resultRef, 'result');
    // Start the analysis process
    await analyzeProducts();
  };

  const goToReferencePage = () => {
    navigate('/reference');
  };
  
  // Custom CSS for the gradient highlight effect
  const highlightClass = "transition-all duration-1000 ease-in-out";
  const activeHighlightClass = "shadow-[0_0_30px_10px_rgba(124,58,237,0.15),0_0_10px_4px_rgba(79,70,229,0.2)]";
  
  return (
    <Layout>
      <div className="space-y-8 max-w-full">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Step-by-step guide section */}
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border/50">
          <h2 className="text-xl font-semibold text-center mb-4">{t('guide.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <Card 
              className="cursor-pointer hover:bg-accent/20 transition-colors" 
              onClick={goToReferencePage}
            >
              <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <FileUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">{t('guide.step1')}</h3>
                <p className="text-sm text-muted-foreground">{t('guide.step1.desc')}</p>
                <ArrowRight className="h-5 w-5 mt-1 text-muted-foreground" />
              </CardContent>
            </Card>
            
            {/* Step 2 */}
            <Card 
              className="cursor-pointer hover:bg-accent/20 transition-colors" 
              onClick={() => scrollToSection(uploadRef, 'upload')}
            >
              <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <File className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">{t('guide.step2')}</h3>
                <p className="text-sm text-muted-foreground">{t('guide.step2.desc')}</p>
                <ArrowRight className="h-5 w-5 mt-1 text-muted-foreground" />
              </CardContent>
            </Card>
            
            {/* Step 3 */}
            <Card 
              className="cursor-pointer hover:bg-accent/20 transition-colors" 
              onClick={() => scrollToSection(extractRef, 'extract')}
            >
              <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">{t('guide.step3')}</h3>
                <p className="text-sm text-muted-foreground">{t('guide.step3.desc')}</p>
                <ArrowRight className="h-5 w-5 mt-1 text-muted-foreground" />
              </CardContent>
            </Card>
            
            {/* Step 4 */}
            <Card 
              className="cursor-pointer hover:bg-accent/20 transition-colors" 
              onClick={() => scrollToSection(resultRef, 'result')}
            >
              <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">{t('guide.step4')}</h3>
                <p className="text-sm text-muted-foreground">{t('guide.step4.desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-10 gap-6" ref={uploadRef}>
          {/* Upload Card */}
          <Card className={cn(
            "high-tech-card md:col-span-3",
            highlightClass,
            highlightUpload && "animate-pulse-gentle"
          )}>
            <CardHeader>
              <CardTitle>{t('home.upload.title')}</CardTitle>
              <CardDescription>{t('home.upload.supported')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{t('home.upload.processing')}</span>
                      <span className="text-sm font-medium">{Math.round(loadingProgress)}%</span>
                    </div>
                    <Progress value={loadingProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      {loadingProgress < 100 ? t('home.upload.pleaseWait') : t('home.upload.completed')}
                    </p>
                  </div>
                )}
                
                {!isLoading && (fileName ? (
                  <div className="flex items-center p-4 bg-secondary rounded-lg">
                    <File className="h-6 w-6 mr-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        Excel File
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <FileUploader
                    onFileSelected={setFile}
                    className="w-full"
                  />
                ))}
                
                {sheetNames.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">{t('home.sheet.label')}</p>
                    <Select value={selectedSheet} onValueChange={handleSheetChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('home.sheet.label')} />
                      </SelectTrigger>
                      <SelectContent>
                        {sheetNames.map((sheet) => (
                          <SelectItem key={sheet} value={sheet}>
                            {sheet}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Extracted Products Card */}
          <Card className={cn(
            "high-tech-card md:col-span-7",
            highlightClass,
            highlightExtract && "animate-pulse-gentle"
          )} ref={extractRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('home.extracted.title')}</CardTitle>
                <CardDescription>
                  {extractedProducts.length 
                    ? `${extractedProducts.length} products extracted` 
                    : t('home.extracted.noData')
                  }
                </CardDescription>
              </div>
              
              {/* Confirm & Analyze button in the header */}
              {extractedProducts.length > 0 && (
                <Button 
                  disabled={isAnalyzing || extractedProducts.length === 0}
                  onClick={handleAnalyzeClick}
                  className="bg-tech-blue hover:bg-tech-blue/90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t('home.actions.confirm')}
                    </>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg">
                  <ProductTable
                    products={extractedProducts}
                    onEdit={updateProduct}
                    onDelete={deleteProduct}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Analysis Results Card */}
        <Card className={cn(
          "high-tech-card transition-all",
          analyzedProducts.length === 0
            ? "opacity-50"
            : "opacity-100",
          highlightClass,
          highlightResult && "animate-pulse-gentle"
        )} ref={resultRef}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('analysis.title')}</CardTitle>
              <CardDescription>
                {analyzedProducts.length 
                  ? `${analyzedProducts.length} products analyzed` 
                  : t('analysis.noData')
                }
              </CardDescription>
            </div>
            {analyzedProducts.length > 0 && (
              <Button
                onClick={downloadCsv}
                className="bg-tech-blue hover:bg-tech-blue/90"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('home.actions.download')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div>
              <ProductTable
                products={analyzedProducts}
                isAnalyzedData={true}
              />
            </div>
          </CardContent>
          {analyzedProducts.length > 0 && (
            <CardFooter className="flex justify-center pt-4 pb-6">
              <Button 
                onClick={downloadCsv}
                className="bg-tech-blue hover:bg-tech-blue/90 px-6"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                {t('home.actions.downloadResults')}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
