import {
  getFundingProductsList,
  getFundingProduct,
  getPieceProductsList,
  getPieceProducts,
  getPieceMarketPrice,
} from '@/action/product-service';
import { FundingProductType, PieceProductType } from '@/types/ProductTypes';

export class ProductService {
  /**
   * 공모 상품 목록과 상세 정보를 가져옵니다.
   */
  static async getFundingProducts(
    page: number = 1,
    size: number = 10
  ): Promise<FundingProductType[]> {
    try {
      // 1. 공모 상품 UUID 목록 가져오기
      const fundingProductsList = await getFundingProductsList({ page, size });

      // 2. 각 상품의 상세 정보 가져오기
      const fundingProducts = await Promise.all(
        fundingProductsList.fundingUuidList.map(async (fundingUuid: string) => {
          try {
            return await getFundingProduct(fundingUuid);
          } catch (error) {
            console.error(
              `Failed to fetch funding product ${fundingUuid}:`,
              error
            );
            return null;
          }
        })
      );

      // 3. null 값 필터링
      return fundingProducts.filter(
        (product) => product !== null
      ) as FundingProductType[];
    } catch (error) {
      console.error('Failed to fetch funding products:', error);
      return [];
    }
  }

  /**
   * 조각 상품 목록과 상세 정보를 가져옵니다.
   */
  static async getPieceProducts(): Promise<PieceProductType[]> {
    try {
      // 1. 조각 상품 UUID 목록 가져오기
      const pieceProductsList = await getPieceProductsList({
        sortBy: 'ID',
        page: 0,
        size: 10,
      });

      // 2. 각 상품의 상세 정보와 시장가 가져오기
      const pieceProducts = await Promise.all(
        pieceProductsList.pieceProductUuidList.map(
          async (pieceUuid: string) => {
            try {
              const product = await getPieceProducts(pieceUuid);

              // 시장가 가져오기
              try {
                const marketPriceData = await getPieceMarketPrice(pieceUuid);
                console.log(`Market price for ${pieceUuid}:`, marketPriceData);

                // 시장가가 유효한 숫자인지 확인
                const marketPrice = marketPriceData.marketPrice;
                if (
                  typeof marketPrice === 'number' &&
                  !isNaN(marketPrice) &&
                  marketPrice > 0
                ) {
                  return {
                    ...product,
                    piece: {
                      ...product.piece,
                      marketPrice: marketPrice,
                    },
                  };
                } else {
                  console.warn(
                    `Invalid market price for ${pieceUuid}:`,
                    marketPrice
                  );
                  return product;
                }
              } catch (marketPriceError) {
                console.error(
                  `Failed to fetch market price for ${pieceUuid}:`,
                  marketPriceError
                );
                // 시장가 가져오기 실패 시 기존 데이터 반환
                return product;
              }
            } catch (error) {
              console.error(
                `Failed to fetch piece product ${pieceUuid}:`,
                error
              );
              return null;
            }
          }
        )
      );

      // 3. null 값 필터링
      return pieceProducts.filter(
        (product) => product !== null
      ) as PieceProductType[];
    } catch (error) {
      console.error('Failed to fetch piece products:', error);
      return [];
    }
  }

  /**
   * 공모 상품과 조각 상품을 동시에 가져옵니다.
   */
  static async getAllProducts(page: number = 1, size: number = 10) {
    try {
      const [fundingProducts, pieceProducts] = await Promise.all([
        this.getFundingProducts(page, size),
        this.getPieceProducts(),
      ]);

      return {
        fundingProducts,
        pieceProducts,
      };
    } catch (error) {
      console.error('Failed to fetch all products:', error);
      return {
        fundingProducts: [],
        pieceProducts: [],
      };
    }
  }
}
