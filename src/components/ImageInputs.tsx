import React from 'react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';

interface ImageInputsProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  duplicateError?: string;
}

export const ImageInputs: React.FC<ImageInputsProps> = ({
  images,
  onImagesChange,
  duplicateError
}) => {
  const [duplicateIndices, setDuplicateIndices] = React.useState<number[]>([]);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    onImagesChange(newImages);
    
    // Check for duplicates
    checkDuplicates(newImages);
  };

  const checkDuplicates = (imageList: string[]) => {
    const duplicates: number[] = [];
    const seen = new Set<string>();
    
    imageList.forEach((image, index) => {
      if (image && image.trim() !== '') {
        if (seen.has(image.trim())) {
          duplicates.push(index);
          // Also mark the first occurrence
          const firstIndex = imageList.findIndex(img => img.trim() === image.trim());
          if (firstIndex !== -1 && !duplicates.includes(firstIndex)) {
            duplicates.push(firstIndex);
          }
        } else {
          seen.add(image.trim());
        }
      }
    });
    
    setDuplicateIndices(duplicates);
  };

  const addImageInput = () => {
    onImagesChange([...images, '']);
  };

  const removeImageInput = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    checkDuplicates(newImages);
  };

  // Auto-add new input when last one is filled
  React.useEffect(() => {
    if (images.length > 0 && images[images.length - 1] !== '' && images.length < 10) {
      addImageInput();
    }
  }, [images]);

  React.useEffect(() => {
    checkDuplicates(images);
  }, [images]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-gray-600" />
        <label className="block text-sm font-medium text-gray-700">
          Product Images
        </label>
      </div>
      
      {duplicateError && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
          {duplicateError}
        </div>
      )}

      {duplicateIndices.length > 0 && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
          Duplicate image URLs detected. They will be automatically removed during export.
        </div>
      )}

      <div className="space-y-3">
        {images.map((image, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <input
                type="url"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder={`Image URL ${index + 1}`}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  duplicateIndices.includes(index) 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => removeImageInput(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {index === images.length - 1 && images.length < 10 && image !== '' && (
              <button
                type="button"
                onClick={addImageInput}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};