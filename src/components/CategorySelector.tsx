import React from 'react';
import { Smartphone, Shirt, Footprints, Package } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const categories = [
  { id: 'mobile', name: 'Mobile', icon: Smartphone, color: 'bg-blue-500' },
  { id: 'cloth', name: 'Clothing', icon: Shirt, color: 'bg-purple-500' },
  { id: 'shoes', name: 'Shoes', icon: Footprints, color: 'bg-green-500' },
  { id: 'others', name: 'Others', icon: Package, color: 'bg-orange-500' }
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-300
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3
              ${isSelected ? category.color : 'bg-gray-100'}
            `}>
              <Icon 
                className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} 
              />
            </div>
            <h3 className={`
              font-semibold text-sm
              ${isSelected ? 'text-blue-600' : 'text-gray-700'}
            `}>
              {category.name}
            </h3>
          </button>
        );
      })}
    </div>
  );
};