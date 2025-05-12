import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

// Define our types
export interface Category {
  category_name: string;
  category_level: number;
}

export interface Product {
  item_name: string;
  item_spec: string | null;
  item_unit: string | null;
  item_total_mass: string | null;
  categories: Category[];
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

// API response type for extracting Excel data
export interface ExcelExtractResponse {
  [sheetName: string]: Product[];
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
  loadingProgress: number;
  
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
        {
          item_name: 'Laptop Dell XPS 13',
          item_spec: '13-inch, 8GB RAM',
          item_unit: 'pcs',
          item_total_mass: '1.2kg',
          categories: [{ category_name: 'Electronics', category_level: 1 }]
        },
        {
          item_name: 'iPhone 13 Pro',
          item_spec: '128GB, Graphite',
          item_unit: 'pcs',
          item_total_mass: '0.5kg',
          categories: [{ category_name: 'Electronics', category_level: 1 }]
        },
        {
          item_name: 'Samsung Galaxy S22',
          item_spec: '256GB, Phantom Black',
          item_unit: 'pcs',
          item_total_mass: '0.6kg',
          categories: [{ category_name: 'Electronics', category_level: 1 }]
        },
        {
          item_name: 'Sony WH-1000XM4',
          item_spec: 'Noise Cancelling Headphones',
          item_unit: 'pcs',
          item_total_mass: '0.3kg',
          categories: [{ category_name: 'Accessories', category_level: 2 }]
        },
        {
          item_name: 'HP Spectre x360',
          item_spec: '15-inch, 16GB RAM',
          item_unit: 'pcs',
          item_total_mass: '2.0kg',
          categories: [{ category_name: 'Electronics', category_level: 1 }]
        },
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
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  // Store the full API response to access different sheets
  const [allSheetData, setAllSheetData] = useState<ExcelExtractResponse>({});
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      setSheetNames([]);
      setSelectedSheet('');
      setExtractedProducts([]);
      setAnalyzedProducts([]);
      setAllSheetData({});
      setLoadingProgress(0);
      return;
    }
    
    setIsLoading(true);
    setLoadingProgress(0);
    
    try {
      // Simulate a 15-second API call with incremental progress updates
      const progressInterval = setInterval(() => {
        if (isMounted.current) {
          setLoadingProgress(prev => {
            const newProgress = prev + (100 - prev) * 0.1;
            return newProgress > 95 ? 95 : newProgress; // Cap at 95% until actually complete
          });
        }
      }, 500);
      
      // Create FormData for API call
      const formData = new FormData();
      formData.append('file', file);
      
      // Make API call to extract data from Excel
      const response = await fetch('http://0.0.0.0:8000/bid/extract_items_from_excel', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data: ExcelExtractResponse = await response.json();
      setAllSheetData(data);
      
      // Extract sheet names from API response
      const sheets = Object.keys(data);
      setSheetNames(sheets);
      
      if (sheets.length > 0) {
        const firstSheet = sheets[0];
        setSelectedSheet(firstSheet);
        setExtractedProducts(data[firstSheet]);
      } else {
        setExtractedProducts([]);
      }
      
      setLoadingProgress(100);
      toast.success('File processed successfully');
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sheet selection
  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (allSheetData[sheetName]) {
      setExtractedProducts(allSheetData[sheetName]);
    } else {
      setExtractedProducts([]);
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
          product.item_name,
          `"${product.item_spec?.replace(/"/g, '""') || ''}"`, // Escape quotes for CSV
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
    toast.success(`Provider file "${file.name}" uploaded successfully`);
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
        loadingProgress,
        setFile: (file) => {
          setFile(file);
          handleFileUpload(file);
        },
        setSheetNames,
        setSelectedSheet: handleSheetChange,
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
