import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface Translations {
  [key: string]: {
    en: string;
    vi: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    vi: 'Trang chủ',
  },
  'nav.reference': {
    en: 'Provider Files',
    vi: 'Tệp tham khảo',
  },
  // Step-by-step guide
  'guide.title': {
    en: 'How It Works',
    vi: 'Cách Thức Hoạt Động',
  },
  'guide.step1': {
    en: 'Step 1',
    vi: 'Bước 1',
  },
  'guide.step1.desc': {
    en: 'Upload Provider (References) File',
    vi: 'Tải lên tệp nhà cung cấp (Tham khảo)',
  },
  'guide.step2': {
    en: 'Step 2',
    vi: 'Bước 2',
  },
  'guide.step2.desc': {
    en: 'Upload Your File',
    vi: 'Tải lên tệp của bạn',
  },
  'guide.step3': {
    en: 'Step 3',
    vi: 'Bước 3',
  },
  'guide.step3.desc': {
    en: 'Modify Product and Confirm',
    vi: 'Chỉnh sửa sản phẩm và xác nhận',
  },
  'guide.step4': {
    en: 'Step 4',
    vi: 'Bước 4',
  },
  'guide.step4.desc': {
    en: 'Download Result',
    vi: 'Tải xuống kết quả',
  },
  // Home page
  'home.title': {
    en: 'AI-Powered Product Analysis',
    vi: 'Phân tích sản phẩm bằng AI',
  },
  'home.subtitle': {
    en: 'Extract and analyze product data from Excel files',
    vi: 'Trích xuất và phân tích dữ liệu sản phẩm từ tệp Excel',
  },
  'home.upload.title': {
    en: 'Upload Excel File',
    vi: 'Tải lên tệp Excel',
  },
  'home.upload.button': {
    en: 'Upload File',
    vi: 'Tải lên tệp',
  },
  'home.upload.dragdrop': {
    en: 'Drag and drop your file here or click to browse',
    vi: 'Kéo và thả tệp của bạn vào đây hoặc nhấp để duyệt',
  },
  'home.upload.dragdropMultiple': {
    en: 'Drop files here or click to browse',
    vi: 'Kéo thả các tệp Excel vào đây hoặc nhấp để duyệt',
  },
  'home.upload.supported': {
    en: 'Supported formats: .xlsx, .xls',
    vi: 'Định dạng được hỗ trợ: .xlsx, .xls',
  },
  'home.upload.processing': {
    en: 'Processing file',
    vi: 'Đang xử lý tệp',
  },
  'home.upload.pleaseWait': {
    en: 'Please wait while we extract data from your file...',
    vi: 'Vui lòng đợi trong khi chúng tôi trích xuất dữ liệu từ tệp của bạn...',
  },
  'home.upload.completed': {
    en: 'Processing completed!',
    vi: 'Đã hoàn thành xử lý!',
  },
  'home.sheet.title': {
    en: 'Sheet Selection',
    vi: 'Chọn Sheet',
  },
  'home.sheet.label': {
    en: 'Select Sheet',
    vi: 'Chọn Sheet',
  },
  'home.extracted.title': {
    en: 'Extracted Products',
    vi: 'Sản phẩm Đã Trích Xuất',
  },
  'home.extracted.id': {
    en: 'ID',
    vi: 'ID',
  },
  'home.extracted.name': {
    en: 'Product Name',
    vi: 'Tên Sản Phẩm',
  },
  'home.extracted.spec': {
    en: 'Specification',
    vi: 'Thông số kỹ thuật',
  },
  'home.extracted.unit': {
    en: 'Unit',
    vi: 'Đơn vị',
  },
  'home.extracted.mass': {
    en: 'Total Mass',
    vi: 'Khối lượng',
  },
  'home.extracted.category': {
    en: 'Category',
    vi: 'Danh mục',
  },
  'home.extracted.actions': {
    en: 'Actions',
    vi: 'Hành động',
  },
  'home.extracted.noData': {
    en: 'No products extracted. Please upload an Excel file to begin.',
    vi: 'Không có sản phẩm được trích xuất. Vui lòng tải lên tệp Excel để bắt đầu.',
  },
  'home.actions.edit': {
    en: 'Edit',
    vi: 'Sửa',
  },
  'home.actions.delete': {
    en: 'Delete',
    vi: 'Xóa',
  },
  'home.actions.confirm': {
    en: 'Confirm & Analyze',
    vi: 'Xác nhận & Phân tích',
  },
  'home.actions.download': {
    en: 'Download CSV',
    vi: 'Tải xuống CSV',
  },
  'home.actions.downloadResults': {
    en: 'Download Analysis Results (CSV)',
    vi: 'Tải xuống Kết quả Phân tích (CSV)',
  },
  // Analysis results
  'analysis.title': {
    en: 'Analysis Results',
    vi: 'Kết quả phân tích',
  },
  'analysis.analyzing': {
    en: 'Analyzing products',
    vi: 'Đang phân tích sản phẩm',
  },
  'analysis.id': {
    en: 'ID',
    vi: 'ID',
  },
  'analysis.name': {
    en: 'Product Name',
    vi: 'Tên Sản Phẩm',
  },
  'analysis.price': {
    en: 'Price',
    vi: 'Giá',
  },
  'analysis.provider': {
    en: 'Provider',
    vi: 'Nhà cung cấp',
  },
  'analysis.origin': {
    en: 'Origin',
    vi: 'Xuất xứ',
  },
  'analysis.type': {
    en: 'Type',
    vi: 'Loại',
  },
  'analysis.noData': {
    en: 'No analysis results. Please confirm and analyze products first.',
    vi: 'Không có kết quả phân tích. Vui lòng xác nhận và phân tích sản phẩm trước.',
  },
  'analysis.processingProducts': {
    en: 'Analyzing products',
    vi: 'Đang phân tích sản phẩm',
  },
  'analysis.productCount': {
    en: 'Processing {count} products (~5s per product)',
    vi: 'Đang xử lý {count} sản phẩm (~5 giây mỗi sản phẩm)',
  },
  'analysis.timeRemaining': {
    en: 'Estimated time remaining: {time} seconds',
    vi: 'Thời gian ước tính còn lại: {time} giây',
  },
  // Reference page
  'reference.title': {
    en: 'Provider Files',
    vi: 'Tệp Tham Khảo',
  },
  'reference.subtitle': {
    en: 'Upload Excel files for price reference information',
    vi: 'Tải lên tệp Excel cho thông tin tham khảo giá',
  },
  'reference.upload.title': {
    en: 'Upload Provider File',
    vi: 'Tải lên tệp tham khảo',
  },
  'reference.upload.button': {
    en: 'Upload File',
    vi: 'Tải lên tệp',
  },
  'reference.upload.files': {
    en: 'Upload Excel Files',
    vi: 'Tải lên các tệp Excel',
  },
  'reference.upload.folder': {
    en: 'Upload Folder',
    vi: 'Tải lên thư mục',
  },
  'reference.uploadFolder': {
    en: 'Upload Folder',
    vi: 'Tải lên thư mục',
  },
  'reference.upload.folder.select': {
    en: 'Select a folder',
    vi: 'Chọn một thư mục',
  },
  'reference.upload.processing': {
    en: 'Processing files',
    vi: 'Đang xử lý tệp',
  },
  'reference.required': {
    en: 'Provider files required',
    vi: 'Yêu cầu tệp nhà cung cấp',
  },
  'reference.goToUpload': {
    en: 'Upload Now',
    vi: 'Tải lên ngay',
  },
  'reference.files.title': {
    en: 'Uploaded Provider Files',
    vi: 'Tệp tham khảo đã tải lên',
  },
  'reference.files.name': {
    en: 'File Name',
    vi: 'Tên tệp',
  },
  'reference.files.date': {
    en: 'Upload Date',
    vi: 'Ngày tải lên',
  },
  'reference.files.actions': {
    en: 'Actions',
    vi: 'Hành động',
  },
  'reference.files.noData': {
    en: 'No provider files uploaded. Please upload Excel files to begin.',
    vi: 'Không có tệp tham khảo nào được tải lên. Vui lòng tải lên tệp Excel để bắt đầu.',
  },
  'reference.filesUploaded': {
    en: '{count} files uploaded',
    vi: '{count} tệp đã được tải lên',
  },
  // Common
  'common.loading': {
    en: 'Loading...',
    vi: 'Đang tải...',
  },
  'common.error': {
    en: 'An error occurred',
    vi: 'Đã xảy ra lỗi',
  },
  'common.success': {
    en: 'Success',
    vi: 'Thành công',
  },
  'common.cancel': {
    en: 'Cancel',
    vi: 'Hủy',
  },
  'common.save': {
    en: 'Save',
    vi: 'Lưu',
  },
  'common.upload': {
    en: 'Upload',
    vi: 'Tải lên',
  },
  'common.download': {
    en: 'Download',
    vi: 'Tải xuống',
  },
  'common.delete': {
    en: 'Delete',
    vi: 'Xóa',
  },
  'common.backToHome': {
    en: 'Back to Home',
    vi: 'Trở về Trang chủ',
  },
  'common.continueToNextStep': {
    en: 'Continue to Next Step',
    vi: 'Tiếp tục đến bước tiếp theo',
  },
  'common.itemsPerPage': {
    en: 'Items per page',
    vi: 'Mục mỗi trang',
  },
  'common.of': {
    en: 'of',
    vi: 'của',
  },
  'common.page': {
    en: 'Page',
    vi: 'Trang',
  },
  'common.first': {
    en: 'First',
    vi: 'Đầu tiên',
  },
  'common.last': {
    en: 'Last',
    vi: 'Cuối cùng',
  },
  'common.next': {
    en: 'Next',
    vi: 'Tiếp theo',
  },
  'common.previous': {
    en: 'Previous',
    vi: 'Trước đó',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
