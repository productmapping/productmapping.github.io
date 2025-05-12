
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFileProcessing } from '@/contexts/FileProcessingContext';
import Layout from '@/components/Layout';
import FileUploader from '@/components/FileUploader';
import ProductTable from '@/components/ProductTable';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check, Download, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    setFile,
    setSelectedSheet,
    updateProduct,
    deleteProduct,
    analyzeProducts,
    downloadCsv,
  } = useFileProcessing();
  
  const [fileName, setFileName] = useState<string>('');
  
  useEffect(() => {
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  }, [file]);
  
  const handleSheetChange = (value: string) => {
    setSelectedSheet(value);
    // In a real app, we would re-extract products from the newly selected sheet
  };
  
  return (
    <Layout>
      <div className="space-y-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Card */}
          <Card className="high-tech-card">
            <CardHeader>
              <CardTitle>{t('home.upload.title')}</CardTitle>
              <CardDescription>{t('home.upload.supported')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fileName ? (
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
                )}
                
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
          <Card className="high-tech-card">
            <CardHeader>
              <CardTitle>{t('home.extracted.title')}</CardTitle>
              <CardDescription>
                {extractedProducts.length 
                  ? `${extractedProducts.length} products extracted` 
                  : t('home.extracted.noData')
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden">
                  <ProductTable
                    products={extractedProducts}
                    onEdit={updateProduct}
                    onDelete={deleteProduct}
                  />
                </div>
                
                {extractedProducts.length > 0 && (
                  <div className="flex justify-end">
                    <Button 
                      disabled={isAnalyzing || extractedProducts.length === 0}
                      onClick={analyzeProducts}
                      className="bg-tech-blue hover:bg-tech-blue/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          {t('common.loading')}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {t('home.actions.confirm')}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Analysis Results Card */}
        <Card className={cn(
          "high-tech-card transition-all",
          analyzedProducts.length === 0
            ? "opacity-50"
            : "opacity-100"
        )}>
          <CardHeader>
            <CardTitle>{t('analysis.title')}</CardTitle>
            <CardDescription>
              {analyzedProducts.length 
                ? `${analyzedProducts.length} products analyzed` 
                : t('analysis.noData')
              }
            </CardDescription>
            {analyzedProducts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4"
                onClick={downloadCsv}
              >
                <Download className="mr-2 h-4 w-4" />
                {t('home.actions.download')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ProductTable
              products={analyzedProducts}
              isAnalyzedData={true}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
