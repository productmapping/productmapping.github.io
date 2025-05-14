import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface FileUploaderProps {
  onFileSelected: (files: File[]) => void;
  accept?: string;
  className?: string;
  label?: string;
  multiple?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  accept = ".xlsx,.xls",
  className,
  label,
  multiple = true
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      validateAndProcessFiles(filesArray);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      validateAndProcessFiles(filesArray);
    }
  };
  
  const validateAndProcessFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    files.forEach(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !['xlsx', 'xls'].includes(fileExtension)) {
        invalidFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      toast.error(`Invalid file format: ${invalidFiles.join(', ')}. Please upload Excel files (.xlsx, .xls)`);
    }
    
    if (validFiles.length > 0) {
      onFileSelected(validFiles);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={className}>
      {label && <p className="mb-2 font-medium">{label}</p>}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
          isDragging 
            ? "border-tech-purple bg-tech-purple/5" 
            : "border-border hover:border-tech-purple/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="sr-only"
        />
        
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-center mb-1">{multiple ? t('home.upload.dragdropMultiple') || 'Drop files here or click to browse' : t('home.upload.dragdrop')}</p>
        <p className="text-xs text-muted-foreground">{t('home.upload.supported')}</p>
      </div>
    </div>
  );
};

export default FileUploader;
