import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

// Define our types
export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id?: string;
  item_name: string;
  item_spec?: string;
  item_code?: string;
  unit?: string;
  quantity?: string | number;
}

export interface AnalyzedProduct extends Product {
  price?: string;
  provider?: string;
  origin?: string;
  type?: string;
}

export interface ReferenceFile {
  id: string;
  name: string;
  dateUploaded: Date;
  file?: File; // Store the actual file for API uploads
}

// API response type for extracting Excel data
export interface ExcelExtractResponse {
  [sheetName: string]: Product[];
}

// API response type for provider pricing data from folder
export interface ProviderPricingResponse {
  success: boolean;
  message: string;
  data: {
    mappedProducts: {
      [key: string]: any;
    };
    unmappedProducts: any[];
  };
}

// API request type for mapping items to provider pricing
export interface MapItemsRequest {
  item_list: {
    item_name: string;
    item_spec: string | null;
    item_unit: string | null;
    item_total_mass: string | null;
    categories?: Array<{
      category_name: string;
      category_level: number;
    }>;
  }[];
  provider_pricing_detail_list: {
    sheet_name: string;
    provider_pricing: {
      items: {
        item_name: string;
        item_specification: string | null;
        total_amount: number;
        unit_price: number;
        qty_items: number;
        brand: string;
        origin: string;
      }[];
      provider_name: string;
    };
    file_name: string;
  }[];
}

// Add csv_url to the type definition
interface MappingResult {
  items: any[];
  csv_url?: string; // Add the CSV URL property
  [key: string]: any;
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
  isProcessingFolder: boolean;
  folderProcessingProgress: number;
  analyzeProgress: number; // Added for analysis progress tracking
  estimatedAnalyzeTime: number; // Added for estimated time remaining
  providerPricingData: ProviderPricingResponse | null;
  
  setFile: (file: File | null) => void;
  setSheetNames: (sheets: string[]) => void;
  setSelectedSheet: (sheet: string) => void;
  setExtractedProducts: (products: Product[]) => void;
  updateProduct: (index: number, product: Product) => void;
  deleteProduct: (index: number) => void;
  analyzeProducts: () => Promise<MappingResult | null>;
  downloadCsv: () => void;
  addReferenceFile: (files: File | File[]) => void;
  removeReferenceFile: (id: string) => void;
  uploadFolderFiles: (files: FileList) => Promise<void>;
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

// Mock function to simulate product extraction
const extractProductsFromExcel = async (file: File, sheet: string): Promise<Product[]> => {
  // In a real app, we would use a library to parse Excel
  // This is just to simulate the behavior
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate 10-20 random products
      const count = Math.floor(Math.random() * 10) + 10;
      const products: Product[] = [];
      
      for (let i = 1; i <= count; i++) {
        products.push({
          id: `PROD-${i}`,
          item_name: `Product ${i}`,
          item_spec: `Specification for product ${i}. This is a detailed description.`,
          item_code: `SKU-${Math.floor(Math.random() * 10000)}`,
          unit: ['pc', 'kg', 'set', 'box'][Math.floor(Math.random() * 4)],
          quantity: Math.floor(Math.random() * 100) + 1
        });
      }
      
      resolve(products);
    }, 1500);
  });
};

// Mock function to simulate product analysis
const analyzeProducts = async (products: Product[], referenceFiles: ReferenceFile[]): Promise<AnalyzedProduct[]> => {
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
  const [isProcessingFolder, setIsProcessingFolder] = useState<boolean>(false);
  const [folderProcessingProgress, setFolderProcessingProgress] = useState<number>(0);
  const [analyzeProgress, setAnalyzeProgress] = useState<number>(0); // Added for analysis progress tracking
  const [estimatedAnalyzeTime, setEstimatedAnalyzeTime] = useState<number>(0); // Added for estimated time remaining
  const [providerPricingData, setProviderPricingData] = useState<ProviderPricingResponse | null>(null);
  
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
      // Simulate progress updates while waiting for API response
      const progressInterval = setInterval(() => {
        if (isMounted.current) {
          setLoadingProgress(prev => {
            const newProgress = prev + (100 - prev) * 0.1;
            return newProgress > 95 ? 95 : newProgress; // Cap at 95% until actually complete
          });
        }
      }, 500);
      
      // Validate file type first
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !['xlsx', 'xls'].includes(fileExtension)) {
        throw new Error('Invalid file format. Please upload Excel files (.xlsx, .xls)');
      }
      
      // Create FormData for API call
      const formData = new FormData();
      formData.append('file', file);
      
      // Make API call to extract data from Excel
      const response = await fetch('http://localhost:8000/bid/extract_items_from_excel', {
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
      toast.success(`File "${file.name}" processed successfully`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(error instanceof Error ? error.message : 'Error processing file. Please try again.');
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
    const updatedProducts = [...extractedProducts];
    updatedProducts.splice(index, 1);
    setExtractedProducts(updatedProducts);
  };

  // New function to map items to provider pricing
  const mapItemsToProviderPricing = async (): Promise<MappingResult | null> => {
    if (!providerPricingData) {
      toast.error('No provider pricing data available. Please upload provider files first.');
      return null;
    }

    try {
      // CRITICAL DEBUGGING: Log exact state of providerPricingData
      console.log('============ PROVIDER PRICING DEBUG START ============');
      console.log('providerPricingData type:', typeof providerPricingData);
      console.log('providerPricingData is array?', Array.isArray(providerPricingData));
      console.log('providerPricingData stringified:', JSON.stringify(providerPricingData));
      console.log('============ PROVIDER PRICING DEBUG END ============');

      // Prepare the request payload
      const requestPayload: MapItemsRequest = {
        item_list: extractedProducts.map(product => ({
          item_name: product.item_name,
          item_spec: product.item_spec || null,
          item_unit: product.unit || null,
          item_total_mass: product.quantity?.toString() || null,
          categories: [
            {
              category_name: "HỆ THỐNG BÁO CHÁY", // Default category for now
              category_level: 0
            }
          ]
        })),
        provider_pricing_detail_list: []
      };

      // Handle the provider pricing data based on its actual structure
      if (Array.isArray(providerPricingData)) {
        // If providerPricingData is already an array with the correct format, use it directly
        console.log('Provider pricing data is an array, using it directly');
        requestPayload.provider_pricing_detail_list = providerPricingData;
      } else if (providerPricingData && typeof providerPricingData === 'object') {
        // If it's an object, need to check its structure
        if (providerPricingData.formattedProviderPricing && Array.isArray(providerPricingData.formattedProviderPricing)) {
          console.log('Using formattedProviderPricing array');
          requestPayload.provider_pricing_detail_list = providerPricingData.formattedProviderPricing;
        } else if (providerPricingData.data && Array.isArray(providerPricingData.data)) {
          console.log('Using data array property');
          requestPayload.provider_pricing_detail_list = providerPricingData.data;
        } else {
          console.log('Could not find appropriate data structure in providerPricingData');
        }
      }

      // Log what we're sending to the API
      console.log('Final request payload provider_pricing_detail_list count:', requestPayload.provider_pricing_detail_list.length);
      console.log('First item in provider_pricing_detail_list:', requestPayload.provider_pricing_detail_list.length > 0 ? 
                  JSON.stringify(requestPayload.provider_pricing_detail_list[0]) : 'None');
      
      // Make API call to map items to provider pricing
      const response = await fetch('http://localhost:8000/bid/map_items_to_provider_pricing_json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      // Log the raw response from the server
      const rawResponse = await response.text();
      console.log('Raw API response:', rawResponse);
      
      let data;
      try {
        data = JSON.parse(rawResponse);
        console.log('Parsed API response:', data);
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Error mapping items to provider pricing:', error);
      toast.error('Error analyzing products. Please try again.');
      return null;
    }
  };
  
  const analyzeProductsWithAPI = async (): Promise<MappingResult | null> => {
    if (extractedProducts.length === 0) {
      toast.error('Please upload product data before analyzing');
      return null;
    }
    
    if (!providerPricingData) {
      toast.error('Please upload provider files before analyzing');
      return null;
    }
    
    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    setEstimatedAnalyzeTime(extractedProducts.length * 5); // Estimate 5 seconds per product
    
    try {
      // Start a timer to update the progress continuously
      const startTime = Date.now();
      const totalEstimatedTime = extractedProducts.length * 5 * 1000; // 5 seconds per product in ms
      
      // Set up interval to update progress every 100ms for smooth animation
      const progressInterval = setInterval(() => {
        if (isMounted.current && isAnalyzing) {
          const elapsedTime = Date.now() - startTime;
          // Calculate progress based on elapsed time vs total estimated time
          const estimatedProgress = Math.min((elapsedTime / totalEstimatedTime) * 100, 99);
          setAnalyzeProgress(estimatedProgress);
        }
      }, 100);
      
      // Call the map_items_to_provider_pricing_json API
      const mappingResult = await mapItemsToProviderPricing();
      
      clearInterval(progressInterval);
      
      if (!mappingResult) {
        throw new Error('Failed to analyze products');
      }
      
      // Set progress to 100% when complete
      setAnalyzeProgress(100);
      
      // Transform the API response into analyzed products
      const results: AnalyzedProduct[] = extractedProducts.map(product => {
        // Find the matching product in the mapping result
        const matchedProduct = mappingResult.items?.find((item: any) => 
          item.item_name === product.item_name
        );
        
        if (matchedProduct) {
          return {
            ...product,
            price: matchedProduct.unit_price?.toString() || 'N/A',
            provider: matchedProduct.provider || 'Unknown',
            origin: matchedProduct.origin || 'Unknown',
            type: matchedProduct.type || 'Unknown'
          };
        } else {
          // If no match is found, return the product with default values
          return {
            ...product,
            price: 'N/A',
            provider: 'Not Found',
            origin: 'Unknown',
            type: 'Unknown'
          };
        }
      });
      
      // Short delay to show 100% progress before completing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalyzedProducts(results);
      toast.success('Analysis completed successfully');
      
      // Return the mapping result including the csv_url
      return mappingResult;
    } catch (error) {
      console.error('Error analyzing products:', error);
      toast.error('Error analyzing products. Please try again.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const downloadCsv = () => {
    if (analyzedProducts.length === 0) {
      toast.error('No analyzed data to download');
      return;
    }
    
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
  
  const addReferenceFile = (files: File | File[]) => {
    // Handle both single file and array of files
    const filesArray = Array.isArray(files) ? files : [files];
    
    // Process each file and add to referenceFiles
    const newReferenceFiles = filesArray.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      name: file.name,
      dateUploaded: new Date(),
      file: file, // Store the actual file object
    }));
    
    if (newReferenceFiles.length > 0) {
      setReferenceFiles(prev => [...prev, ...newReferenceFiles]);
      
      // If multiple files, show a different toast message
      if (filesArray.length > 1) {
        toast.success(`${filesArray.length} provider files uploaded successfully`);
      } else {
        toast.success(`Provider file "${filesArray[0].name}" uploaded successfully`);
      }
      
      // If files are uploaded, automatically process them through API
      processReferenceFiles(filesArray);
    }
  };

  // Function to process reference files through the API
  const processReferenceFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    
    setIsProcessingFolder(true);
    setFolderProcessingProgress(0);
    
    try {
      // Create FormData for API call
      const formData = new FormData();
      
      // Add all files to the FormData
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        if (isMounted.current) {
          setFolderProcessingProgress(prev => {
            const newProgress = prev + (100 - prev) * 0.1;
            return newProgress > 95 ? 95 : newProgress;
          });
        }
      }, 500);
      
      // Make API call to process the files
      const response = await fetch('http://localhost:8000/provider/extract_provider_pricing_from_excel_folder_json', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const rawData = await response.text(); // Get raw response text
      console.log('Raw API response:', rawData);
      
      let data;
      try {
        data = JSON.parse(rawData);
        console.log('Parsed API response:', data);
      } catch (parseError) {
        console.error('Failed to parse API response as JSON:', parseError);
        throw new Error('Failed to parse server response');
      }
      
      // DEBUGGING: Inspect the response structure in detail
      console.log('API success status:', data.success);
      console.log('API message:', data.message);
      console.log('API data type:', typeof data.data);
      console.log('API data structure:', JSON.stringify(data.data, null, 2));
      
      // Direct conversion to the correct format
      let providerData;
      
      // Handle the data structure based on content
      if (Array.isArray(data)) {
        console.log('Response is direct array format');
        providerData = data;
      } else if (data && Array.isArray(data.data)) {
        console.log('Response has data array property');
        providerData = data;
      } else if (data && typeof data.data === 'object' && data.data !== null) {
        console.log('Response has data object property');
        
        // The example you provided earlier had this structure - prepare it here
        const formattedData = [];
        
        if (data.data.mappedProducts && typeof data.data.mappedProducts === 'object') {
          Object.entries(data.data.mappedProducts).forEach(([sheetName, value]) => {
            if (value && typeof value === 'object') {
              // If it's already in the correct format
              if (value.provider_pricing && Array.isArray(value.provider_pricing.items)) {
                formattedData.push({
                  sheet_name: sheetName,
                  provider_pricing: value.provider_pricing,
                  file_name: value.file_name || sheetName
                });
              } 
              // If items are directly in the value
              else if (Array.isArray(value.items)) {
                formattedData.push({
                  sheet_name: sheetName,
                  provider_pricing: {
                    items: value.items,
                    provider_name: value.provider_name || 'Unknown Provider'
                  },
                  file_name: value.file_name || sheetName
                });
              }
              // If value itself is an array
              else if (Array.isArray(value)) {
                formattedData.push({
                  sheet_name: sheetName,
                  provider_pricing: {
                    items: value,
                    provider_name: 'Unknown Provider'
                  },
                  file_name: sheetName
                });
              }
            }
          });
        }
        
        // Override the data structure with our correctly formatted one
        data.formattedProviderPricing = formattedData;
        providerData = data;
        
        console.log('Converted to formatter array structure:', formattedData.length, 'sheets');
      } else {
        console.log('Unknown response structure');
        providerData = { data: [], success: false, message: 'Failed to parse data structure' };
      }
      
      // Set the provider pricing data with the formatted structure
      setProviderPricingData(providerData);
      setFolderProcessingProgress(100);
      
      toast.success('Files processed successfully');
      
      return providerData;
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files. Please try again.');
      return null;
    } finally {
      setIsProcessingFolder(false);
    }
  };

  const removeReferenceFile = (id: string) => {
    setReferenceFiles(referenceFiles.filter(file => file.id !== id));
  };

  // Function to upload folder files and process them through the API
  const uploadFolderFiles = async (files: FileList) => {
    if (files.length === 0) {
      toast.error('No files selected');
      return;
    }
    
    setIsProcessingFolder(true);
    setFolderProcessingProgress(0);
    
    try {
      // Create FormData for API call
      const formData = new FormData();
      
      // Count Excel files for progress calculation
      const excelFiles: File[] = [];
      
      // Add all files to the FormData
      Array.from(files).forEach(file => {
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          formData.append('files', file);
          excelFiles.push(file);
          
          // Add to reference files as well
          const newReferenceFile: ReferenceFile = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            name: file.name,
            dateUploaded: new Date(),
            file: file,
          };
          setReferenceFiles(prevFiles => [...prevFiles, newReferenceFile]);
        }
      });

      if (excelFiles.length === 0) {
        toast.error('No Excel files found');
        setIsProcessingFolder(false);
        return;
      }
      
      // Show toast with number of files being processed
      toast.info(`Processing ${excelFiles.length} files (approx. ${excelFiles.length * 20} seconds)`);
      
      // Progress simulation based on number of files (20 seconds per file)
      const totalEstimatedTime = excelFiles.length * 20 * 1000; // Convert to milliseconds
      const startTime = Date.now();
      const updateInterval = 100; // Update every 100ms for smooth progress
      
      const progressInterval = setInterval(() => {
        if (isMounted.current) {
          const elapsedTime = Date.now() - startTime;
          const estimatedProgress = Math.min((elapsedTime / totalEstimatedTime) * 100, 95);
          setFolderProcessingProgress(estimatedProgress);
        }
      }, updateInterval);
      
      // Make API call to process the folder
      const response = await fetch('http://localhost:8000/provider/extract_provider_pricing_from_excel_folder_json', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data: ProviderPricingResponse = await response.json();
      setProviderPricingData(data);
      setFolderProcessingProgress(100);
      
      // Display files that were processed successfully
      if (data.success) {
        toast.success(`Successfully processed ${excelFiles.length} provider files`);
        
        // List all files that were processed
        excelFiles.forEach(file => {
          toast.info(`Processed: ${file.name}`);
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error processing folder:', error);
      toast.error('Error processing folder. Please try again.');
      return null;
    } finally {
      setIsProcessingFolder(false);
    }
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
        isProcessingFolder,
        folderProcessingProgress,
        analyzeProgress,
        estimatedAnalyzeTime,
        providerPricingData,
        setFile: (file) => {
          setFile(file);
          handleFileUpload(file);
        },
        setSheetNames,
        setSelectedSheet: handleSheetChange,
        setExtractedProducts,
        updateProduct,
        deleteProduct,
        analyzeProducts: analyzeProductsWithAPI,
        downloadCsv,
        addReferenceFile,
        removeReferenceFile,
        uploadFolderFiles
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


