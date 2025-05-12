import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, AnalyzedProduct } from '@/contexts/FileProcessingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductTableProps {
  products: Product[] | AnalyzedProduct[];
  isAnalyzedData?: boolean;
  onEdit?: (index: number, product: Product) => void;
  onDelete?: (index: number) => void;
  actionButton?: React.ReactNode; // New prop for action button
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isAnalyzedData = false,
  onEdit,
  onDelete,
  actionButton, // Add the new prop
}) => {
  const { t } = useLanguage();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [editedName, setEditedName] = useState('');
  const [editedSpec, setEditedSpec] = useState('');
  const [editedUnit, setEditedUnit] = useState('');
  const [editedMass, setEditedMass] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  const openEditDialog = (product: Product, index: number) => {
    setCurrentProduct(product);
    setCurrentIndex(index);
    setEditedName(product.item_name);
    setEditedSpec(product.item_spec || '');
    setEditedUnit(product.item_unit || '');
    setEditedMass(product.item_total_mass || '');
    setEditDialogOpen(true);
  };
  
  const handleEdit = () => {
    if (onEdit && currentIndex !== -1 && currentProduct) {
      onEdit(currentIndex, {
        ...currentProduct,
        item_name: editedName,
        item_spec: editedSpec || null,
        item_unit: editedUnit || null,
        item_total_mass: editedMass || null,
      });
    }
    setEditDialogOpen(false);
  };
  
  const handleDelete = (index: number) => {
    if (onDelete) {
      onDelete(index);
    }
  };
  
  // Format categories for display: lower category_level first, separated by dash
  const formatCategories = (categories: Product['categories']) => {
    if (!categories || categories.length === 0) return '-';
    
    return categories
      .sort((a, b) => a.category_level - b.category_level)
      .map(cat => cat.category_name)
      .join(' - ');
  };
  
  // Pagination logic
  const totalPages = Math.ceil(products.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProducts = products.slice(startIndex, endIndex);
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  return (
    <div className="rounded-md border">
      {/* Pagination Controls - Moved to the top of the table */}
      {products.length > 0 && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {t('common.itemsPerPage')}:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Add action button here */}
            {actionButton}
          </div>
          
          <div className="flex items-center space-x-6">
            <span className="text-sm text-muted-foreground">
              {`${startIndex + 1}-${Math.min(endIndex, products.length)} ${t('common.of')} ${products.length}`}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full overflow-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">{t('home.extracted.category')}</TableHead>
              <TableHead className="w-[25%]">{t('home.extracted.name')}</TableHead>
              <TableHead>{t('home.extracted.spec')}</TableHead>
              <TableHead>{t('home.extracted.unit')}</TableHead>
              <TableHead>{t('home.extracted.mass')}</TableHead>
              
              {isAnalyzedData && (
                <>
                  <TableHead>{t('analysis.price')}</TableHead>
                  <TableHead>{t('analysis.provider')}</TableHead>
                  <TableHead>{t('analysis.origin')}</TableHead>
                  <TableHead>{t('analysis.type')}</TableHead>
                </>
              )}
              
              {!isAnalyzedData && onEdit && onDelete && (
                <TableHead className="text-right">{t('home.extracted.actions')}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAnalyzedData ? 9 : 6} className="h-24 text-center">
                  {isAnalyzedData 
                    ? t('analysis.noData')
                    : t('home.extracted.noData')
                  }
                </TableCell>
              </TableRow>
            ) : (
              currentProducts.map((product, index) => (
                <TableRow key={`product-${index}`}>
                  <TableCell>{formatCategories(product.categories)}</TableCell>
                  <TableCell className="font-medium">{product.item_name}</TableCell>
                  <TableCell>{product.item_spec || '-'}</TableCell>
                  <TableCell>{product.item_unit || '-'}</TableCell>
                  <TableCell>{product.item_total_mass || '-'}</TableCell>
                  
                  {isAnalyzedData && (
                    <>
                      <TableCell>{(product as AnalyzedProduct).price}</TableCell>
                      <TableCell>{(product as AnalyzedProduct).provider}</TableCell>
                      <TableCell>{(product as AnalyzedProduct).origin}</TableCell>
                      <TableCell>{(product as AnalyzedProduct).type}</TableCell>
                    </>
                  )}
                  
                  {!isAnalyzedData && onEdit && onDelete && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditDialog(product, startIndex + index)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t('home.actions.edit')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(startIndex + index)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          {t('home.actions.delete')}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('home.actions.edit')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                {t('home.extracted.name')}
              </label>
              <Input
                id="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="spec" className="text-right">
                {t('home.extracted.spec')}
              </label>
              <Input
                id="spec"
                value={editedSpec}
                onChange={(e) => setEditedSpec(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="unit" className="text-right">
                {t('home.extracted.unit')}
              </label>
              <Input
                id="unit"
                value={editedUnit}
                onChange={(e) => setEditedUnit(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="mass" className="text-right">
                {t('home.extracted.mass')}
              </label>
              <Input
                id="mass"
                value={editedMass}
                onChange={(e) => setEditedMass(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              {t('common.cancel')}
            </Button>
            <Button onClick={handleEdit}>
              <Check className="h-4 w-4 mr-1" />
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductTable;
