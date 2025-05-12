
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, AnalyzedProduct } from '@/contexts/FileProcessingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Edit, Trash, Check, X } from 'lucide-react';

interface ProductTableProps {
  products: Product[] | AnalyzedProduct[];
  isAnalyzedData?: boolean;
  onEdit?: (index: number, product: Product) => void;
  onDelete?: (index: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isAnalyzedData = false,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [editedName, setEditedName] = useState('');
  const [editedId, setEditedId] = useState('');
  
  const openEditDialog = (product: Product, index: number) => {
    setCurrentProduct(product);
    setCurrentIndex(index);
    setEditedName(product.name);
    setEditedId(product.id);
    setEditDialogOpen(true);
  };
  
  const handleEdit = () => {
    if (onEdit && currentIndex !== -1) {
      onEdit(currentIndex, {
        id: editedId,
        name: editedName,
      });
    }
    setEditDialogOpen(false);
  };
  
  const handleDelete = (index: number) => {
    if (onDelete) {
      onDelete(index);
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('home.extracted.id')}</TableHead>
            <TableHead>{t('home.extracted.name')}</TableHead>
            
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
              <TableCell colSpan={isAnalyzedData ? 6 : 3} className="h-24 text-center">
                {isAnalyzedData 
                  ? t('analysis.noData')
                  : t('home.extracted.noData')
                }
              </TableCell>
            </TableRow>
          ) : (
            products.map((product, index) => (
              <TableRow key={`${product.id}-${index}`}>
                <TableCell className="font-medium">{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                
                {isAnalyzedData && 'price' in product && (
                  <>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.provider}</TableCell>
                    <TableCell>{product.origin}</TableCell>
                    <TableCell>{product.type}</TableCell>
                  </>
                )}
                
                {!isAnalyzedData && onEdit && onDelete && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(product, index)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t('home.actions.edit')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(index)}
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
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('home.actions.edit')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="id" className="text-right">
                {t('home.extracted.id')}
              </label>
              <Input
                id="id"
                value={editedId}
                onChange={(e) => setEditedId(e.target.value)}
                className="col-span-3"
              />
            </div>
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
