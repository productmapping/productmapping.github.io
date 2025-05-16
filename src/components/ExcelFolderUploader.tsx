import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useFileProcessing } from '@/contexts/FileProcessingContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface ExcelFolderUploaderProps {
  className?: string;
}

const ExcelFolderUploader: React.FC<ExcelFolderUploaderProps> = ({ className }) => {
  const { t } = useLanguage();
  const { uploadFolderFiles, isProcessingFolder, folderProcessingProgress, addReferenceFile } = useFileProcessing();
  const [isDragging, setIsDragging] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<File[]>([]);
  
  // Create refs for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create a separate ref for the folder input that we'll create programmatically
  const folderInputContainerRef = useRef<HTMLDivElement>(null);
  
  // Create and append a folder input element when component mounts
  useEffect(() => {
    // Create the folder input element once
    if (folderInputContainerRef.current) {
      // Clean up any existing input first
      folderInputContainerRef.current.innerHTML = '';
      
      // Create a new input element
      const input = document.createElement('input');
      input.type = 'file';
      input.id = 'folder-upload-input';
      input.multiple = true;
      // Set folder selection attributes directly
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      input.style.display = 'none';
      
      // Add event listener
      input.addEventListener('change', handleFolderSelect);
      
      // Append to container
      folderInputContainerRef.current.appendChild(input);
      
      // Store reference for external use
      window.folderUploadInput = input;
      
      // Clean up
      return () => {
        input.removeEventListener('change', handleFolderSelect);
        delete window.folderUploadInput;
      };
    }
  }, []);
  
  // Handle file upload from the regular file input
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesList = event.target.files;
      // Filter for Excel files
      const excelFiles = Array.from(filesList).filter(
        file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      
      if (excelFiles.length > 0) {
        setProcessingFiles(excelFiles);
        await uploadFolderFiles(filesList);
      } else {
        toast.error('No Excel files found in the selected files');
      }
    }
  };
  
  // Handle selection from the folder input
  const handleFolderSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Filter for Excel files
      const excelFiles = Array.from(input.files).filter(
        file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      
      if (excelFiles.length > 0) {
        toast.info(`Processing ${excelFiles.length} Excel files from folder`);
        setProcessingFiles(excelFiles);
        
        // Only pass Excel files to the API
        await uploadFolderFiles(input.files);
      } else {
        toast.error('No Excel files found in the selected folder');
      }
    }
  };
  
  // Trigger folder selection
  const openFolderDialog = () => {
    const input = document.getElementById('folder-upload-input') as HTMLInputElement;
    if (input) {
      input.click();
    } else {
      toast.error('Folder upload functionality not available');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesList = e.dataTransfer.files;
      // Filter for Excel files
      const excelFiles = Array.from(filesList).filter(
        file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      
      if (excelFiles.length > 0) {
        setProcessingFiles(excelFiles);
        await uploadFolderFiles(filesList);
      } else {
        toast.error('No Excel files found in the dropped files');
      }
    }
  };

  // Reset processing files when processing is complete
  useEffect(() => {
    if (!isProcessingFolder && folderProcessingProgress === 100) {
      // Reset after a short delay to show the completed progress
      const timer = setTimeout(() => {
        setProcessingFiles([]);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isProcessingFolder, folderProcessingProgress]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden container for the folder input */}
      <div ref={folderInputContainerRef} className="hidden"></div>
      
      {!isProcessingFolder ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Regular file input for individual files */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-center mb-1">Drop Excel files here or click to browse</p>
          <p className="text-xs text-muted-foreground">Supported formats: .xlsx, .xls</p>
        </div>
      ) : (
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Processing Files</h3>
            <span className="text-sm text-muted-foreground">
              {Math.round(folderProcessingProgress)}%
            </span>
          </div>
          
          <Progress value={folderProcessingProgress} />
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {processingFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-green-500" />
                <span className="truncate">{file.name}</span>
                {folderProcessingProgress < 100 && (
                  <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Estimated time remaining: {Math.ceil((processingFiles.length * 10) * (1 - folderProcessingProgress/100))} seconds
          </div>
        </div>
      )}
    </div>
  );
};

// Add necessary global typings
declare global {
  interface Window {
    folderUploadInput?: HTMLInputElement;
  }
}

export default ExcelFolderUploader;