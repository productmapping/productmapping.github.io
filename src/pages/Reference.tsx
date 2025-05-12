import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFileProcessing } from '@/contexts/FileProcessingContext';
import Layout from '@/components/Layout';
import FileUploader from '@/components/FileUploader';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { File, Trash, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

const Reference: React.FC = () => {
  const { t } = useLanguage();
  const { referenceFiles, addReferenceFile, removeReferenceFile } = useFileProcessing();

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex flex-col items-center">
          <div className="w-full mb-4">
            <Link to="/">
              <Button variant="ghost" className="flex items-center text-muted-foreground hover:text-tech-purple">
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('common.backToHome') || 'Back to Home'}
              </Button>
            </Link>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            {t('reference.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('reference.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Upload Card */}
          <Card className="high-tech-card">
            <CardHeader>
              <CardTitle>{t('reference.upload.title')}</CardTitle>
              <CardDescription>{t('home.upload.supported')}</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                onFileSelected={addReferenceFile}
                className="w-full"
                label={t('reference.upload.button')}
              />
            </CardContent>
          </Card>
          
          {/* Reference Files List */}
          <Card className="high-tech-card">
            <CardHeader>
              <CardTitle>{t('reference.files.title')}</CardTitle>
              <CardDescription>
                {referenceFiles.length 
                  ? `${referenceFiles.length} files uploaded` 
                  : t('reference.files.noData')
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('reference.files.name')}</TableHead>
                      <TableHead>{t('reference.files.date')}</TableHead>
                      <TableHead className="text-right">{t('reference.files.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referenceFiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          {t('reference.files.noData')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      referenceFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <File className="h-4 w-4 mr-2" />
                              {file.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(file.dateUploaded, 'PPP')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeReferenceFile(file.id)}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              {t('common.delete')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reference;
