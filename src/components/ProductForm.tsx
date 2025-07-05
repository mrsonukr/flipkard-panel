import React, { useState } from 'react';
import { Save, AlertCircle, X } from 'lucide-react';
import { ImageInputs } from './ImageInputs';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  basePrice: number;
  discountPercentage: number;
  images: string[];
  averageRating: number;
  totalReviews: number;
  stockStatus: string;
  variants: Array<{ type: string; name: string }> | null;
  delivery: number;
}

interface ProductFormProps {
  category: string;
  onProductSave: (product: Product) => void;
  existingProducts: Product[];
  editingProduct?: Product | null;
  onCancelEdit?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  category,
  onProductSave,
  existingProducts,
  editingProduct,
  onCancelEdit
}) => {
  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    brand: editingProduct?.brand || '',
    basePrice: editingProduct?.basePrice?.toString() || '',
    discountPercentage: editingProduct?.discountPercentage?.toString() || '',
    images: editingProduct?.images || [''],
    averageRating: editingProduct?.averageRating?.toString() || '4',
    totalReviews: editingProduct?.totalReviews?.toString() || '',
    stockStatus: editingProduct?.stockStatus || '',
    colorVariant: editingProduct?.variants?.find(v => v.type === 'color')?.name || '',
    storageVariant: editingProduct?.variants?.find(v => v.type === 'storage')?.name || '',
    delivery: editingProduct?.delivery?.toString() || '2'
  });

  const [duplicateError, setDuplicateError] = useState('');

  const stockStatusOptions = {
    mobile: ['Performance Beast', 'Top Discount', 'Hot Deal', 'Best Seller'],
    cloth: ['Hot Deal', 'Trending', 'Fashion Forward', 'Best Seller'],
    shoes: ['Top Discount', 'Sport Essential', 'Limited Edition', 'Best Seller'],
    others: ['Hot Deal', 'Top Discount', 'Best Seller', 'Featured']
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const checkDuplicates = () => {
    const currentName = formData.name.toLowerCase().trim();
    const duplicate = existingProducts.find(
      product => product.name.toLowerCase().trim() === currentName && 
      (!editingProduct || product.id !== editingProduct.id)
    );
    
    if (duplicate) {
      setDuplicateError('Product with this name already exists!');
      return true;
    }
    
    setDuplicateError('');
    return false;
  };

  const removeDuplicateImages = (images: string[]) => {
    const seen = new Set<string>();
    return images.filter(img => {
      if (img && img.trim() !== '') {
        if (seen.has(img.trim())) {
          return false;
        }
        seen.add(img.trim());
        return true;
      }
      return false;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkDuplicates()) return;

    // Remove duplicate images
    const cleanImages = removeDuplicateImages(formData.images);

    // Build variants array only for mobile category
    let variants = null;
    if (category === 'mobile') {
      const variantArray = [];
      if (formData.colorVariant.trim()) {
        variantArray.push({ type: 'color', name: formData.colorVariant.trim() });
      }
      if (formData.storageVariant.trim()) {
        variantArray.push({ type: 'storage', name: formData.storageVariant.trim() });
      }
      variants = variantArray.length > 0 ? variantArray : null;
    }

    const product: Product = {
      id: editingProduct?.id || `${category}-${Date.now()}`,
      name: formData.name,
      brand: formData.brand,
      category,
      basePrice: parseInt(formData.basePrice),
      discountPercentage: parseInt(formData.discountPercentage),
      images: cleanImages,
      averageRating: parseFloat(formData.averageRating),
      totalReviews: parseInt(formData.totalReviews),
      stockStatus: formData.stockStatus,
      variants: variants,
      delivery: parseInt(formData.delivery)
    };

    onProductSave(product);
    
    // Reset form if not editing
    if (!editingProduct) {
      setFormData({
        name: '',
        brand: '',
        basePrice: '',
        discountPercentage: '',
        images: [''],
        averageRating: '4',
        totalReviews: '',
        stockStatus: '',
        colorVariant: '',
        storageVariant: '',
        delivery: '2'
      });
    }
  };

  React.useEffect(() => {
    if (formData.name) {
      checkDuplicates();
    }
  }, [formData.name]);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {editingProduct ? 'Edit' : 'Add New'} {category} Product
          </h2>
          {editingProduct && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {duplicateError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-600">{duplicateError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand *
          </label>
          <input
            type="text"
            required
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter brand name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Price *
          </label>
          <input
            type="number"
            required
            value={formData.basePrice}
            onChange={(e) => handleInputChange('basePrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter base price"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Percentage *
          </label>
          <input
            type="number"
            required
            min="0"
            max="100"
            value={formData.discountPercentage}
            onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter discount percentage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Average Rating *
          </label>
          <select
            value={formData.averageRating}
            onChange={(e) => handleInputChange('averageRating', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Reviews *
          </label>
          <input
            type="number"
            required
            value={formData.totalReviews}
            onChange={(e) => handleInputChange('totalReviews', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter total reviews"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Status *
          </label>
          <select
            required
            value={formData.stockStatus}
            onChange={(e) => handleInputChange('stockStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select stock status</option>
            {stockStatusOptions[category as keyof typeof stockStatusOptions]?.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Days *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.delivery}
            onChange={(e) => handleInputChange('delivery', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter delivery days"
          />
        </div>
      </div>

      <ImageInputs
        images={formData.images}
        onImagesChange={(images) => handleInputChange('images', images)}
      />

      {/* Product Variants - Only show for mobile category */}
      {category === 'mobile' && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Product Variants</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Variant
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="color"
                  readOnly
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
                <input
                  type="text"
                  value={formData.colorVariant}
                  onChange={(e) => handleInputChange('colorVariant', e.target.value)}
                  placeholder="e.g., Black, Red, Blue"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Variant
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="storage"
                  readOnly
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
                <input
                  type="text"
                  value={formData.storageVariant}
                  onChange={(e) => handleInputChange('storageVariant', e.target.value)}
                  placeholder="e.g., 128GB, 256GB"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          {editingProduct ? 'Update Product' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};