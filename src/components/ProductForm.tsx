import React, { useState } from 'react';
import { Save, AlertCircle, X, Link, Loader2 } from 'lucide-react';
import { ImageInputs } from './ImageInputs';
import { scrapeProductData } from '../utils/productScraper';

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
  originalMrp?: number;
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
  // Generate random values
  const generateRandomValues = () => {
    const ratings = [4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5];
    const deliveryDays = [2, 3, 4, 5];
    const discounts = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
    
    return {
      rating: ratings[Math.floor(Math.random() * ratings.length)],
      delivery: deliveryDays[Math.floor(Math.random() * deliveryDays.length)],
      discount: discounts[Math.floor(Math.random() * discounts.length)],
      reviews: Math.floor(Math.random() * 50000) + 1000 // 1000 to 51000 reviews
    };
  };

  const getRandomStockStatus = (category: string) => {
    const options = stockStatusOptions[category as keyof typeof stockStatusOptions] || stockStatusOptions.others;
    return options[Math.floor(Math.random() * options.length)];
  };

  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    brand: editingProduct?.brand || '',
    mrp: editingProduct ? (editingProduct.basePrice * (100 + editingProduct.discountPercentage) / 100).toString() : '24900',
    salePrice: editingProduct?.basePrice?.toString() || '498',
    images: editingProduct?.images || [''],
    colorVariant: editingProduct?.variants?.find(v => v.type === 'color')?.name || '',
    storageVariant: editingProduct?.variants?.find(v => v.type === 'storage')?.name || ''
  });

  const [productUrl, setProductUrl] = useState('');
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [scrapingError, setScrapingError] = useState('');
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

  const handleAutoFill = async () => {
    if (!productUrl.trim()) {
      setScrapingError('Please enter a product URL');
      return;
    }

    setIsScrapingLoading(true);
    setScrapingError('');

    try {
      const scrapedData = await scrapeProductData(productUrl);
      
      if (scrapedData) {
        // Auto-fill the form with scraped data
        setFormData(prev => ({
          ...prev,
          name: scrapedData.name,
          brand: scrapedData.brand,
          mrp: scrapedData.mrp.toString(),
          salePrice: scrapedData.salePrice.toString(),
          images: scrapedData.images.length > 0 ? scrapedData.images : ['']
        }));
        
        setScrapingError('');
        alert(`Product data filled successfully! Found ${scrapedData.images.length} images.`);
      }
    } catch (error) {
      setScrapingError(error instanceof Error ? error.message : 'Failed to scrape product data');
    } finally {
      setIsScrapingLoading(false);
    }
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

    // Generate random values for new products, keep existing for edits
    const randomValues = editingProduct ? {
      rating: editingProduct.averageRating,
      delivery: editingProduct.delivery,
      reviews: editingProduct.totalReviews
    } : generateRandomValues();

    // Calculate discount percentage from MRP and sale price
    const mrpValue = parseInt(formData.mrp);
    const salePriceValue = parseInt(formData.salePrice);
    const calculatedDiscount = Math.round(((mrpValue - salePriceValue) / mrpValue) * 100);

    const stockStatus = editingProduct ? editingProduct.stockStatus : getRandomStockStatus(category);

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
      basePrice: salePriceValue,
      discountPercentage: calculatedDiscount,
      images: cleanImages,
      averageRating: randomValues.rating,
      totalReviews: randomValues.reviews,
      stockStatus: stockStatus,
      variants: variants,
      delivery: randomValues.delivery,
      originalMrp: mrpValue // Store original MRP
    };

    onProductSave(product);
    
    // Reset form if not editing
    if (!editingProduct) {
      setFormData({
        name: '',
        brand: '',
        mrp: '24900',
        salePrice: '498',
        images: [''],
        colorVariant: '',
        storageVariant: ''
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

      {/* Auto-fill from URL Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-medium text-blue-800">Auto-fill from Product URL</h3>
        </div>
        
        {scrapingError && (
          <div className="mb-3 text-red-600 text-sm bg-red-50 p-2 rounded-md">
            {scrapingError}
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="Paste Flipkart product URL here..."
            className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isScrapingLoading}
          />
          <button
            type="button"
            onClick={handleAutoFill}
            disabled={isScrapingLoading || !productUrl.trim()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScrapingLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                Auto-fill
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-blue-600 mt-2">
          Currently supports Flipkart product URLs. The form will be automatically filled with scraped data.
        </p>
      </div>

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MRP *
              </label>
              <input
                type="number"
                required
                value={formData.mrp}
                onChange={(e) => handleInputChange('mrp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter MRP (e.g., 24900)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price *
              </label>
              <input
                type="number"
                required
                value={formData.salePrice}
                onChange={(e) => handleInputChange('salePrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter sale price (e.g., 498)"
              />
            </div>
          </div>
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