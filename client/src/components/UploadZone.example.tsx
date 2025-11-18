import { useState } from 'react';
import UploadZone from './UploadZone';

/**
 * Example usage of UploadZone component
 * 
 * This component demonstrates:
 * - Drag and drop file upload
 * - File type validation (PDF, PNG, JPG, JPEG)
 * - File size validation (max 10MB)
 * - Upload progress display
 * - Error handling
 * - File list management
 */
export default function UploadZoneExample() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFilesAdded = (files: File[]) => {
    console.log('Files added:', files);
    setUploadedFiles((prev) => [...prev, ...files]);
    
    // Here you would typically:
    // 1. Upload files to server
    // 2. Process files with AI
    // 3. Update document store
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        文件上传示例
      </h1>

      <UploadZone onFilesAdded={handleFilesAdded} />

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            已处理的文件
          </h2>
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="text-sm text-gray-700">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
