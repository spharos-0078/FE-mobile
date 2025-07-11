import React from 'react';
import { FundingProductType } from '@/types/ProductTypes';
import FundingItemCard from '@/components/common/FundingItemCard';

export function FundingListSection({
  fundingProducts,
}: {
  fundingProducts: FundingProductType[];
}) {
  if (fundingProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">검색된 상품이 없습니다</div>
        <div className="text-sm text-gray-600">
          다른 카테고리 & 검색어를 입력해보세요
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      {fundingProducts.map((product) => {
        // null 체크 추가
        if (!product || !product.funding) {
          console.error('Invalid product data:', product);
          return null;
        }

        return (
          <FundingItemCard
            key={product.funding.fundingUuid}
            product={product}
          />
        );
      })}
    </div>
  );
}
