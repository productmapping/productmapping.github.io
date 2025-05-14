import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useFileProcessing } from '@/contexts/FileProcessingContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ExcelFolderUploaderProps {
  className?: string;
}

const ExcelFolderUploader: React.FC<ExcelFolderUploaderProps> = ({ className }) => {
  const { t } = useLanguage();
  const { uploadFolderFiles, isProcessingFolder, folderProcessingProgress } = useFileProcessing();
  const [isDragging, setIsDragging] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<File[]>([]);
  
  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesList = event.target.files;
      // Filter for Excel files
      const excelFiles = Array.from(filesList).filter(
        file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      
      if (excelFiles.length > 0) {
        setProcessingFiles(excelFiles);
        await uploadFolderFiles(filesList);
      }
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
          onClick={() => document.getElementById('folder-upload')?.click()}
        >
          <input
            id="folder-upload"
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={handleFolderUpload}
            className="sr-only"
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
          
          <div className="space-y-2">
            {processingFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-green-500" />
                <span>{file.name}</span>
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

export default ExcelFolderUploader;