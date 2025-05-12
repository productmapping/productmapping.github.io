
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';

// Define our types
export interface Product {
  id: string;
  name: string;
}

export interface AnalyzedProduct extends Product {
  price: string;
  provider: string;
  origin: string;
  type: string;
}

export interface ReferenceFile {
  id: string;
  name: string;
  dateUploaded: Date;
}

interface FileProcessingContextType {
  file: File | null;
  sheetNames: string[];
  selectedSheet: string;
  extractedProducts: Product[];
  analyzedProducts: AnalyzedProduct[];
  referenceFiles: ReferenceFile[];
  isLoading: boolean;
  isAnalyzing: boolean;
  
  setFile: (file: File | null) => void;
  setSheetNames: (sheets: string[]) => void;
  setSelectedSheet: (sheet: string) => void;
  setExtractedProducts: (products: Product[]) => void;
  updateProduct: (index: number, product: Product) => void;
  deleteProduct: (index: number) => void;
  analyzeProducts: () => Promise<void>;
  downloadCsv: () => void;
  addReferenceFile: (file: File) => void;
  removeReferenceFile: (id: string) => void;
}

const FileProcessingContext = createContext<FileProcessingContextType | undefined>(undefined);

// Mock function to simulate sheet extraction from Excel
const extractSheetsFromExcel = async (file: File): Promise<string[]> => {
  // In a real app, we would use a library like xlsx or exceljs
  // For now, we'll simulate a delay and return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['Sheet1', 'Products', 'Data', 'Inventory']);
    }, 1000);
  });
};

// Mock function to extract products from Excel sheet
const extractProductsFromSheet = async (file: File, sheetName: string): Promise<Product[]> => {
  // In a real app, we would parse the Excel file
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProducts: Product[] = [
        { id: 'P001', name: 'Laptop Dell XPS 13' },
        { id: 'P002', name: 'iPhone 13 Pro' },
        { id: 'P003', name: 'Samsung Galaxy S22' },
        { id: 'P004', name: 'Sony WH-1000XM4' },
        { id: 'P005', name: 'HP Spectre x360' },
      ];
      resolve(mockProducts);
    }, 1500);
  });
};

// Mock function to analyze products
const analyzeProductsMock = async (products: Product[]): Promise<AnalyzedProduct[]> => {
  // In a real app, this would call an API
  return new Promise((resolve) => {
    setTimeout(() => {
      const analyzedProducts: AnalyzedProduct[] = products.map(product => ({
        ...product,
        price: `$${Math.floor(Math.random() * 1000) + 100}`,
        provider: ['Apple', 'Samsung', 'Dell', 'HP', 'Sony'][Math.floor(Math.random() * 5)],
        origin: ['USA', 'China', 'Japan', 'South Korea', 'Vietnam'][Math.floor(Math.random() * 5)],
        type: ['Electronics', 'Accessories', 'Components', 'Peripherals'][Math.floor(Math.random() * 4)]
      }));
      resolve(analyzedProducts);
    }, 2000);
  });
};

export const FileProcessingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [extractedProducts, setExtractedProducts] = useState<Product[]>([]);
  const [analyzedProducts, setAnalyzedProducts] = useState<AnalyzedProduct[]>([]);
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      setSheetNames([]);
      setSelectedSheet('');
      setExtractedProducts([]);
      setAnalyzedProducts([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const sheets = await extractSheetsFromExcel(file);
      setSheetNames(sheets);
      
      // Auto-select the first sheet
      if (sheets.length > 0) {
        const selectedSheet = sheets[0];
        setSelectedSheet(selectedSheet);
        
        // Auto-extract products from the selected sheet
        const products = await extractProductsFromSheet(file, selectedSheet);
        setExtractedProducts(products);
      }
      
      toast.success('File processed successfully');
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = (index: number, product: Product) => {
    const updatedProducts = [...extractedProducts];
    updatedProducts[index] = product;
    setExtractedProducts(updatedProducts);
  };

  const deleteProduct = (index: number) => {
    const updatedProducts = extractedProducts.filter((_, i) => i !== index);
    setExtractedProducts(updatedProducts);
  };

  const analyzeProducts = async () => {
    if (extractedProducts.length === 0) {
      toast.error('No products to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const analyzed = await analyzeProductsMock(extractedProducts);
      setAnalyzedProducts(analyzed);
      toast.success('Products analyzed successfully');
    } catch (error) {
      console.error('Error analyzing products:', error);
      toast.error('Error analyzing products. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadCsv = () => {
    if (analyzedProducts.length === 0) {
      toast.error('No analyzed data to download');
      return;
    }
    
    // Convert data to CSV format
    const headers = ['ID', 'Product Name', 'Price', 'Provider', 'Origin', 'Type'];
    const csvData = [
      headers.join(','),
      ...analyzedProducts.map(product => 
        [
          product.id,
          `"${product.name.replace(/"/g, '""')}"`, // Escape quotes for CSV
          product.price,
          product.provider,
          product.origin,
          product.type
        ].join(',')
      )
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `product_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV downloaded successfully');
  };

  const addReferenceFile = (file: File) => {
    const newReferenceFile: ReferenceFile = {
      id: Date.now().toString(),
      name: file.name,
      dateUploaded: new Date(),
    };
    
    setReferenceFiles([...referenceFiles, newReferenceFile]);
    toast.success(`Reference file "${file.name}" uploaded successfully`);
  };

  const removeReferenceFile = (id: string) => {
    setReferenceFiles(referenceFiles.filter(file => file.id !== id));
  };

  return (
    <FileProcessingContext.Provider
      value={{
        file,
        sheetNames,
        selectedSheet,
        extractedProducts,
        analyzedProducts,
        referenceFiles,
        isLoading,
        isAnalyzing,
        setFile: (file) => {
          setFile(file);
          handleFileUpload(file);
        },
        setSheetNames,
        setSelectedSheet,
        setExtractedProducts,
        updateProduct,
        deleteProduct,
        analyzeProducts,
        downloadCsv,
        addReferenceFile,
        removeReferenceFile
      }}
    >
      {children}
    </FileProcessingContext.Provider>
  );
};

export const useFileProcessing = (): FileProcessingContextType => {
  const context = useContext(FileProcessingContext);
  if (context === undefined) {
    throw new Error('useFileProcessing must be used within a FileProcessingProvider');
  }
  return context;
};
