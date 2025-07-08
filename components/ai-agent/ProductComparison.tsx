// components/ai-agent/ProductComparison.tsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star, Award, ShoppingCart } from 'lucide-react';
import { ShopProduct } from '@/types/shopAI';

interface ProductComparisonProps {
  products: ShopProduct[];
  comparison: any;
  onAddToCart?: (productId: string) => void;
}

export const ProductComparison: React.FC<ProductComparisonProps> = memo(({
  products,
  comparison,
  onAddToCart
}) => {
  if (products.length < 2) {
    return (
      <div className="text-center py-8 text-gray-500">
        Недостаточно товаров для сравнения
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Сравнение товаров</h3>
      </div>

      {/* Recommendation */}
      {comparison.recommendation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Рекомендация AI:</h4>
          <p className="text-blue-700">{comparison.recommendation}</p>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-medium text-gray-700">Характеристика</th>
              {products.map((product) => (
                <th key={product._id} className="text-left p-4 font-medium text-gray-700 min-w-[200px]">
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.brand}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price */}
            <ComparisonRow
              label="Цена"
              values={products.map(p => `${p.price.toLocaleString()}₽`)}
              highlight={comparison.price ? [comparison.price.cheapest._id] : []}
              type="price"
            />

            {/* Rating */}
            <ComparisonRow
              label="Рейтинг"
              values={products.map(p => p.rating ? `${p.rating}/5` : 'Нет рейтинга')}
              highlight={comparison.rating ? [comparison.rating.highest._id] : []}
              type="rating"
            />

            {/* Stock */}
            <ComparisonRow
              label="В наличии"
              values={products.map(p => `${p.inStock} шт.`)}
              highlight={comparison.stock ? [comparison.stock.mostAvailable._id] : []}
              type="stock"
            />

            {/* Category */}
            <ComparisonRow
              label="Категория"
              values={products.map(p => p.category)}
              highlight={[]}
              type="text"
            />

            {/* Nutrition */}
            {products.some(p => p.nutrition) && (
              <>
                <ComparisonRow
                  label="Калории"
                  values={products.map(p => p.nutrition?.calories ? `${p.nutrition.calories} ккал` : 'Н/Д')}
                  highlight={[]}
                  type="nutrition"
                />
                <ComparisonRow
                  label="Белки"
                  values={products.map(p => p.nutrition?.protein ? `${p.nutrition.protein}г` : 'Н/Д')}
                  highlight={[]}
                  type="nutrition"
                />
              </>
            )}

            {/* Benefits */}
            <ComparisonRow
              label="Преимущества"
              values={products.map(p => (
                <div key={p._id} className="space-y-1">
                  {p.benefits?.slice(0, 3).map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-sm">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  )) || <span className="text-gray-400">Не указаны</span>}
                </div>
              ))}
              highlight={[]}
              type="benefits"
            />
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {products.map((product) => (
          <button
            key={product._id}
            onClick={() => onAddToCart?.(product._id)}
            disabled={product.inStock === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Добавить {product.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
});

const ComparisonRow: React.FC<{
  label: string;
  values: (string | React.ReactNode)[];
  highlight: string[];
  type: 'price' | 'rating' | 'stock' | 'text' | 'nutrition' | 'benefits';
}> = memo(({ label, values, highlight, type }) => (
  <tr className="border-b border-gray-100">
    <td className="p-4 font-medium text-gray-700 bg-gray-50">{label}</td>
    {values.map((value, index) => (
      <td
        key={index}
        className={`p-4 ${
          highlight.length > 0 && highlight.includes(String(index))
            ? 'bg-green-50 border-l-4 border-green-400'
            : ''
        }`}
      >
        {type === 'benefits' ? (
          value
        ) : (
          <span className={highlight.length > 0 && highlight.includes(String(index)) ? 'font-semibold text-green-700' : ''}>
            {value}
          </span>
        )}
      </td>
    ))}
  </tr>
));