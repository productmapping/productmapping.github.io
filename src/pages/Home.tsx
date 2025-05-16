import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFileProcessing } from '@/contexts/FileProcessingContext';
import Layout from '@/components/Layout';
import FileUploader from '@/components/FileUploader';
import ExcelFolderUploader from '@/components/ExcelFolderUploader';
import ProductTable from '@/components/ProductTable';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Download, File, X, FileUp, Edit, ArrowRight, Loader2, Trash, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
    analyzeProgress,
    estimatedAnalyzeTime,
    setFile,
    setSelectedSheet,
    updateProduct,
    deleteProduct,
    analyzeProducts,
    referenceFiles, 
    addReferenceFile, 
    removeReferenceFile,
    uploadFolderFiles
  } = useFileProcessing();
  
  const [fileName, setFileName] = useState<string>('');
  const [activeStep, setActiveStep] = useState<string>('step1');
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  // Add reference to track analysis start time
  const analysisStartTimeRef = useRef<number>(0);
  
  const step1Ref = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const extractRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Highlight states
  const [highlightStep1, setHighlightStep1] = useState<boolean>(false);
  const [highlightUpload, setHighlightUpload] = useState<boolean>(false);
  const [highlightExtract, setHighlightExtract] = useState<boolean>(false);
  const [highlightResult, setHighlightResult] = useState<boolean>(false);
  
  // State to store the csv_url from the API response
  const [csvUrl, setCsvUrl] = useState<string | null>(null);
  
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
  
  // Effect to handle the countdown timer for analysis
  useEffect(() => {
    let timerId: number | undefined;
    
    if (isAnalyzing) {
      // Set the initial start time when analysis begins
      if (analysisStartTimeRef.current === 0) {
        analysisStartTimeRef.current = Date.now();
        setRemainingTime(extractedProducts.length * 5); // Initial estimate: 5 seconds per product
      }
      
      // Update the countdown every second
      timerId = window.setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - analysisStartTimeRef.current) / 1000);
        const totalEstimatedSeconds = extractedProducts.length * 5;
        const remaining = Math.max(0, totalEstimatedSeconds - elapsedSeconds);
        setRemainingTime(remaining);
      }, 1000);
    } else {
      // Reset when analysis is complete
      analysisStartTimeRef.current = 0;
    }
    
    return () => {
      if (timerId) window.clearInterval(timerId);
    };
  }, [isAnalyzing, extractedProducts.length]);

  const handleSheetChange = (value: string) => {
    setSelectedSheet(value);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, section?: 'step1' | 'upload' | 'extract' | 'result') => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Reset highlights
    setHighlightStep1(false);
    setHighlightUpload(false);
    setHighlightExtract(false);
    setHighlightResult(false);
    
    // Set highlight based on section
    if (section === 'step1') {
      setHighlightStep1(true);
      setActiveStep('step1');
      // Auto-remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightStep1(false);
      }, 3000);
    } else if (section === 'upload') {
      setHighlightUpload(true);
      setActiveStep('step2');
      // Auto-remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightUpload(false);
      }, 3000);
    } else if (section === 'extract') {
      setHighlightExtract(true);
      setActiveStep('step3');
      // Auto-remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightExtract(false);
      }, 3000);
    } else if (section === 'result') {
      setHighlightResult(true);
      setActiveStep('step4');
      // Auto-remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightResult(false);
      }, 3000);
    }
  };

  // Wrap the original analyzeProducts function to handle additional UI logic
  const handleAnalyzeClick = async () => {
    // Reset the analysis start time
    analysisStartTimeRef.current = 0;
    // Scroll to results section immediately after clicking
    scrollToSection(resultRef, 'result');
    // Start the analysis process
    const result = await analyzeProducts();
    
    // Store the CSV URL if it's available in the response
    if (result && result.csv_url) {
      setCsvUrl(result.csv_url);
    }
  };

  // Custom function to handle CSV download
  const handleDownloadCsv = () => {
    if (csvUrl) {
      // Download from API URL
      const downloadUrl = `http://batgroup.strikingo.com${csvUrl}`;
      console.log('Attempting to download CSV from URL:', downloadUrl);
      
      // Create a hidden link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = `product_analysis_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Starting CSV download...');
    } else {
      console.error('CSV URL is not available');
      toast.error('CSV URL not available. Please try analyzing the data again.');
    }
  };

  const handleStepClick = (step: string) => {
    switch (step) {
      case 'step1':
        scrollToSection(step1Ref, 'step1');
        break;
      case 'step2':
        scrollToSection(uploadRef, 'upload');
        break;
      case 'step3':
        scrollToSection(extractRef, 'extract');
        break;
      case 'step4':
        scrollToSection(resultRef, 'result');
        break;
      default:
        break;
    }
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
              className={cn(
                "cursor-pointer transition-colors",
                activeStep === 'step1' ? "bg-accent/30" : "hover:bg-accent/20"
              )}
              onClick={() => handleStepClick('step1')}
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
              className={cn(
                "cursor-pointer transition-colors",
                activeStep === 'step2' ? "bg-accent/30" : "hover:bg-accent/20"
              )}
              onClick={() => handleStepClick('step2')}
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
              className={cn(
                "cursor-pointer transition-colors",
                activeStep === 'step3' ? "bg-accent/30" : "hover:bg-accent/20"
              )}
              onClick={() => handleStepClick('step3')}
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
              className={cn(
                "cursor-pointer transition-colors",
                activeStep === 'step4' ? "bg-accent/30" : "hover:bg-accent/20"
              )}
              onClick={() => handleStepClick('step4')}
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
        
        {/* Step 1: Reference Files (Integrated from Reference page) */}
        <div className="grid grid-cols-1 gap-6" ref={step1Ref}>
          <Card className={cn(
            "high-tech-card",
            highlightClass,
            highlightStep1 && "animate-pulse-gentle"
          )}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('reference.title')}</CardTitle>
                <CardDescription>{t('reference.subtitle')}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Use the global reference we created
                  if (window.folderUploadInput) {
                    window.folderUploadInput.click();
                  } else {
                    // Fallback to direct DOM method
                    const folderInput = document.getElementById('folder-upload-input');
                    if (folderInput) {
                      folderInput.click();
                    } else {
                      toast.error('Folder upload not available');
                    }
                  }
                }}
                className="flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                {t('reference.uploadFolder') || 'Upload Folder'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Section */}
              <div className="space-y-4">
                {/* Replace the old FileUploader with our new ExcelFolderUploader */}
                <ExcelFolderUploader className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {t('home.upload.supported')}
                </p>
              </div>
              
              {/* Files Table */}
              <div>
                <div className="flex flex-row items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">{t('reference.files.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {referenceFiles.length 
                      ? `${referenceFiles.length} files uploaded` 
                      : t('reference.files.noData')
                    }
                  </p>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('reference.files.name')}</TableHead>
                        <TableHead>{t('reference.files.date')}</TableHead>
                        <TableHead className="text-right">{t('reference.files.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referenceFiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            {t('reference.files.noData')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        referenceFiles.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <File className="h-4 w-4 mr-2" />
                                {file.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(file.dateUploaded, 'PPP')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeReferenceFile(file.id)}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                {t('common.delete')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {referenceFiles.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={() => scrollToSection(uploadRef, 'upload')}
                    className="bg-tech-blue hover:bg-tech-blue/90"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {t('common.continueToNextStep')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Step 2: Upload */}
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
                    onFileSelected={(files) => setFile(files[0])} // Only pass the first file
                    className="w-full"
                    multiple={false} // Set to false to only allow single file selection
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
          
          {/* Step 3: Extracted Products Card */}
          <Card className={cn(
            "high-tech-card md:col-span-7",
            highlightClass,
            highlightExtract && "animate-pulse-gentle"
          )} ref={extractRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('home.extracted.title')}</CardTitle>
                <CardDescription>
                  {referenceFiles.length 
                    ? t('reference.filesUploaded').replace('{count}', referenceFiles.length.toString()) 
                    : t('reference.files.noData')
                  }
                </CardDescription>
              </div>
              
              {/* Confirm & Analyze button in the header */}
              {extractedProducts.length > 0 && (
                <Button 
                  disabled={isAnalyzing || extractedProducts.length === 0 || referenceFiles.length === 0}
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
              
              {extractedProducts.length > 0 && referenceFiles.length === 0 && (
                <div className="text-sm text-amber-500 flex items-center">
                  <span>{t('reference.required')}</span>
                  <Button 
                    variant="link" 
                    size="sm"
                    className="px-1 text-amber-500"
                    onClick={() => scrollToSection(step1Ref, 'step1')}
                  >
                    {t('reference.goToUpload')}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Analysis progress bar when analyzing - Moved here from results section */}
                {isAnalyzing && (
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{t('analysis.processingProducts')}</span>
                      <span className="text-sm font-medium">{Math.round(analyzeProgress)}%</span>
                    </div>
                    <Progress value={analyzeProgress} className="h-2" />
                    <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                      <span>
                        {t('analysis.productCount').replace('{count}', extractedProducts.length.toString())}
                      </span>
                      <span>
                        {t('analysis.timeRemaining').replace('{time}', remainingTime.toString())}
                      </span>
                    </div>
                  </div>
                )}
                
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
        
        {/* Step 4: Analysis Results Card */}
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
                onClick={handleDownloadCsv}
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
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
