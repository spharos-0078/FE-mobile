'use client';

import React, { useState, useEffect, useRef } from 'react';
import AnimatedPrice from './AnimatedPrice';
import AnimatedValue from './AnimatedValue';
import ItemCardImage from './ItemCardImage';
import ItemCardInfo from './ItemCardInfo';
import {
  getMarketPrice,
  getQoutes,
  getPreviousDayQuotes,
} from '@/action/market-price-service';
import {
  PieceProductType,
  MarketPriceData,
  QoutesData,
} from '@/types/ProductTypes';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { marketStorage } from '@/lib/market-storage';
import { Skeleton } from '@/components/atoms';
import { useRouter } from 'next/navigation';

interface PieceItemCardProps {
  product: PieceProductType;
}

export default function PieceItemCard({ product }: PieceItemCardProps) {
  const router = useRouter();
  const { piece } = product;
  const [marketData, setMarketData] = useState<MarketPriceData | null>(null);
  const [qoutesData, setQoutesData] = useState<QoutesData | null>(null);
  const [previousDayQuotesData, setPreviousDayQuotesData] =
    useState<QoutesData | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [isLoadingPreviousDayData, setIsLoadingPreviousDayData] =
    useState(false);
  // const [dataSource, setDataSource] = useState<'live' | 'cached' | 'none'>(
  //   'none'
  // );

  // 이전 값들을 저장하여 변경 감지
  const prevMarketDataRef = useRef<MarketPriceData | null>(null);
  const prevQoutesDataRef = useRef<QoutesData | null>(null);

  const thumbnailImage =
    product.images.find((img) => img.isThumbnail)?.imageUrl ||
    product.images[0]?.imageUrl;

  // 가격 우선순위: 시장가 > 종가 > AI 예측가
  const displayPrice =
    typeof piece.marketPrice === 'number' && piece.marketPrice > 0
      ? piece.marketPrice
      : piece.closingPrice || product.aiEstimatedPrice || 0;

  // 주가 데이터 가져오기
  useEffect(() => {
  
    const fetchMarketData = async () => {
      // 이미 로딩 중이면 중복 호출 방지
      if (isLoadingMarketData) {
        console.log('Already loading, skipping...');
        return;
      }

      setIsLoadingMarketData(true);

      // marketData는 항상 API에서 가져오기 (테스트용)
      try {
        const response = await getMarketPrice(piece.pieceProductUuid);
        if (response?.isSuccess && response.result) {
          // 이전 값과 비교하여 변경 감지
          const prevMarket = prevMarketDataRef.current;
          if (prevMarket) {
            console.log('Market data changed:', {
              prev: prevMarket,
              current: response.result,
            });
          }
          prevMarketDataRef.current = response.result;
          setMarketData(response.result);
          // setDataSource('live');
          marketStorage.saveMarketData(piece.pieceProductUuid, response.result);
        } else {
          // 임시로 더미 데이터 사용 (테스트용)
          const dummyMarketData: MarketPriceData = {
            stckPrpr: piece.closingPrice || 1000,
            stckOprc: (piece.closingPrice || 1000) - 50,
            stckHgpr: (piece.closingPrice || 1000) + 100,
            stckLwpr: (piece.closingPrice || 1000) - 100,
            prdyVrssSign: '1',
            prdyVrss: 50,
            prdyCrt: 5.0,
          };
          setMarketData(dummyMarketData);
          // setDataSource('live');
        }
      } catch (error) {
        console.error('Error fetching market price:', error);
        // 에러 시에도 더미 데이터 사용
        const dummyMarketData: MarketPriceData = {
          stckPrpr: piece.closingPrice || 1000,
          stckOprc: (piece.closingPrice || 1000) - 50,
          stckHgpr: (piece.closingPrice || 1000) + 100,
          stckLwpr: (piece.closingPrice || 1000) - 100,
          prdyVrssSign: '1',
          prdyVrss: 50,
          prdyCrt: 5.0,
        };
        setMarketData(dummyMarketData);
        // setDataSource('live');
      }

      // qoutesData는 실시간으로 패칭
      try {
        const qoutesResponse = await getQoutes(piece.pieceProductUuid);
        if (qoutesResponse?.isSuccess && qoutesResponse.result) {
          // 이전 값과 비교하여 변경 감지
          const prevQoutes = prevQoutesDataRef.current;
          if (prevQoutes) {
            console.log('Qoutes data changed:', {
              prev: prevQoutes,
              current: qoutesResponse.result,
            });
          }
          prevQoutesDataRef.current = qoutesResponse.result;
          setQoutesData(qoutesResponse.result);
        } else {
          // 임시로 더미 데이터 사용 (테스트용)
          const dummyQoutesData: QoutesData = {
            askp: [piece.closingPrice ? piece.closingPrice + 10 : 1010],
            bidp: [piece.closingPrice ? piece.closingPrice - 10 : 990],
            askpRsq: [1.0],
            bidpRsq: [-1.0],
          };
          setQoutesData(dummyQoutesData);
        }
      } catch (error) {
        console.error('Error fetching qoutes:', error);
        // 에러 시에도 더미 데이터 사용
        const dummyQoutesData: QoutesData = {
          askp: [piece.closingPrice ? piece.closingPrice + 10 : 1010],
          bidp: [piece.closingPrice ? piece.closingPrice - 10 : 990],
          askpRsq: [1.0],
          bidpRsq: [-1.0],
        };
        setQoutesData(dummyQoutesData);
      }

      // 전날 업데이트된 마지막 호가 데이터 가져오기
      setIsLoadingPreviousDayData(true);
      try {
        const previousDayQuotesResponse = await getPreviousDayQuotes(
          piece.pieceProductUuid
        );
        console.log(
          'API response previous day quotes:',
          previousDayQuotesResponse
        );
        if (
          previousDayQuotesResponse?.isSuccess &&
          previousDayQuotesResponse.result
        ) {
          setPreviousDayQuotesData(previousDayQuotesResponse.result);
        } else {
          // 전날 데이터가 없으면 현재 종가 기준으로 더미 데이터 생성
          const dummyPreviousDayQuotesData: QoutesData = {
            askp: [piece.closingPrice ? piece.closingPrice + 5 : 1005],
            bidp: [piece.closingPrice ? piece.closingPrice - 5 : 995],
            askpRsq: [0.5],
            bidpRsq: [-0.5],
          };
          console.log(
            'Using dummy previous day quotes data:',
            dummyPreviousDayQuotesData
          );
          setPreviousDayQuotesData(dummyPreviousDayQuotesData);
        }
      } catch (error) {
        console.error('Error fetching previous day quotes:', error);
        // 에러 시에도 더미 데이터 사용
        const dummyPreviousDayQuotesData: QoutesData = {
          askp: [piece.closingPrice ? piece.closingPrice + 5 : 1005],
          bidp: [piece.closingPrice ? piece.closingPrice - 5 : 995],
          askpRsq: [0.5],
          bidpRsq: [-0.5],
        };
       
        setPreviousDayQuotesData(dummyPreviousDayQuotesData);
      } finally {
        setIsLoadingPreviousDayData(false);
      }

      setIsLoadingMarketData(false);
    };

    fetchMarketData();

    // SSE 알림을 감지하여 데이터 새로고침
    const handleSSEAlert = (event: MessageEvent) => {
      try {
        // Check if it's our SSE alert message
        if (event.data && event.data.type === 'SSE_ALERT') {
          const alertData = event.data.data;
          if (
            alertData.alertType === 'PIECE_PRICE_CHANGE' &&
            alertData.key === piece.pieceProductUuid
          ) {
          
            fetchMarketData();
          }
        }
      } catch {
        // Ignore parsing errors
      }
    };

    // SSE 이벤트 리스너 추가
    window.addEventListener('message', handleSSEAlert);

    return () => {
      window.removeEventListener('message', handleSSEAlert);
    };
  }, [piece.pieceProductUuid]); // isLoadingMarketData 제거

  // 주가 데이터가 있는 경우 표시 (더 명확한 조건)
  const hasMarketData =
    marketData &&
    typeof marketData.stckPrpr === 'number' &&
    typeof marketData.stckHgpr === 'number' &&
    typeof marketData.stckLwpr === 'number';

  const handleClick = () => {
    router.push(`/piece/${piece.pieceProductUuid}`);
  };

  return (
    <div
      onClick={handleClick}
      className="w-full rounded-lg bg-white overflow-hidden relative mx-auto items-center justify-center"
    >
      {/* 상한가 하한가를 표시하자 */}
      <ItemCardImage
        remainingTime={`${piece.tradeQuantity}개`}
        thumbnail={thumbnailImage}
        type="piece"
      />
      <div className="relative">
        <ItemCardInfo
          mainCategory={product.mainCategory.categoryName}
          subCategory={product.subCategory.categoryName}
          productName={product.productName}
          price={displayPrice}
          type="piece"
          priceComponent={<AnimatedPrice price={displayPrice} />}
        />

        {/* 주가 정보 표시 - 로딩 중에도 기본 레이아웃 유지 */}
        <div className="px-4 mt-[-10px] pb-3 flex justify-start items-center gap-2 min-h-[20px]">
          {isLoadingMarketData ? (
            // 로딩 중일 때 부드러운 스켈레톤 애니메이션
            <div className="flex items-center gap-2">
              <Skeleton width="w-3" height="h-3" rounded="full" />
              <Skeleton width="w-16" height="h-3" />
              <Skeleton width="w-12" height="h-3" />
            </div>
          ) : hasMarketData && marketData ? (
            // 실제 데이터가 있을 때
            <>
              {marketData.prdyVrss > 0 ? (
                <TrendingUp className="w-3 h-3 text-red-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-blue-500" />
              )}
              <AnimatedValue
                value={marketData.prdyVrss}
                className={cn(
                  'text-xs font-bold',
                  marketData.prdyVrss > 0 ? 'text-red-500' : 'text-blue-500'
                )}
                formatValue={(value) => `${value.toLocaleString()}원`}
              />
              <AnimatedValue
                value={marketData.prdyCrt}
                className={cn(
                  'text-xs font-bold',
                  marketData.prdyCrt > 0 ? 'text-red-500' : 'text-blue-500'
                )}
                formatValue={(value) =>
                  `(${typeof value === 'number' ? value.toFixed(2) : value}%)`
                }
              />
            </>
          ) : (
            // 데이터가 없을 때 기본 정보 표시
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {piece.closingPrice
                  ? `종가: ${piece.closingPrice.toLocaleString()}원`
                  : '거래값을 요청중입니다'}
              </span>
            </div>
          )}
        </div>
        <div className="px-4 pb-4 flex justify-start items-center gap-1 min-h-[20px]">
          {qoutesData?.askp[0] && (
            <div className="inline-flex items-center px-2 h-5 rounded-xs text-[0.6rem] font-medium bg-red-50 text-red-700 border border-red-200">
              <span className="mr-1">매도</span>
              <AnimatedValue
                value={qoutesData.askp[0]}
                className="font-bold"
                formatValue={(value) => value.toLocaleString()}
              />
            </div>
          )}
          {qoutesData?.bidp[0] && (
            <div className="inline-flex items-center px-2 h-5 rounded-xs text-[0.6rem] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <span className="mr-1">매수</span>
              <AnimatedValue
                value={qoutesData.bidp[0]}
                className="font-bold"
                formatValue={(value) => value.toLocaleString()}
              />
            </div>
          )}
        </div>

        {/* 전날 업데이트된 마지막 호가 데이터 표시 */}
        {isLoadingPreviousDayData ? (
          <div className="px-4 pb-2 flex justify-start items-center gap-1 min-h-[16px]">
            <span className="text-[0.5rem] text-gray-500 mr-1">전일</span>
            <div className="inline-flex items-center gap-1">
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        ) : previousDayQuotesData ? (
          <div className="px-4 pb-2 flex justify-start items-center gap-1 min-h-[16px]">
            <span className="text-[0.5rem] text-gray-500 mr-1">전일</span>
            {previousDayQuotesData.askp[0] && (
              <div className="inline-flex items-center px-1.5 h-4 rounded-xs text-[0.5rem] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <span className="mr-0.5">매도</span>
                <AnimatedValue
                  value={previousDayQuotesData.askp[0]}
                  className="font-bold"
                  formatValue={(value) => value.toLocaleString()}
                />
              </div>
            )}
            {previousDayQuotesData.bidp[0] && (
              <div className="inline-flex items-center px-1.5 h-4 rounded-xs text-[0.5rem] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <span className="mr-0.5">매수</span>
                <AnimatedValue
                  value={previousDayQuotesData.bidp[0]}
                  className="font-bold"
                  formatValue={(value) => value.toLocaleString()}
                />
              </div>
            )}
          </div>
        ) : null}
      </div>
      {/* 상세보기 버튼
      <div className="absolute bottom-0 right-0 p-4 flex justify-center items-center">
        <Button className="w-fit">상세보기</Button>
      </div> */}
    </div>
  );
}
