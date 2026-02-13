import { useAtomValue, useSetAtom } from "jotai";
import { editPriceModalAtom, EditPriceModalCloseAtom } from "./atom";
import { useState, useMemo, useEffect } from "react";
import { phonePlans, getPlanGroup } from "../../../../contents/phonePlans";
import {
  enrollPriceListApi,
  getPhoneDetailApi,
  getPriceListByPhoneApi,
  type AdditionalDiscountItem,
  getAdditionalDiscountsApi,
  type PriceSettingFeildProps,
} from "../../../../apis/priceList";
import { getSubsidy } from "../../../../apis"; // index.ts의 getSubsidy 활용
import { cn } from "cn-func";

// Helper to get agencyId from token
const getAgencyIdFromToken = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    // Try common fields for ID
    return payload.agencyId || payload.id || payload.sub;
  } catch (e) {
    return null;
  }
};

const EditPriceModal = () => {
  const { isOpen, device, telecom, option, phoneBrand } =
    useAtomValue(editPriceModalAtom);
  const closeModal = useSetAtom(EditPriceModalCloseAtom);

  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: number;
  } | null>(null);
  const [salesDiscount, setSalesDiscount] = useState("");

  // 서버에서 직접 받아올 데이터 상태
  const [fetchedOriginalPrice, setFetchedOriginalPrice] = useState<number>(0);
  const [fetchedCommonDiscount, setFetchedCommonDiscount] = useState<number>(0);

  // 추가 할인 상태
  const [discounts, setDiscounts] = useState<AdditionalDiscountItem[]>([]);
  const [priceListId, setPriceListId] = useState<number | null>(null);
  const [priceListMap, setPriceListMap] = useState<Record<string, number>>({}); // plan -> priceListId
  const [agencyId, setAgencyId] = useState<number | null>(null);

  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState<number | null>(null);
  const [discountFormName, setDiscountFormName] = useState("");
  const [discountFormPrice, setDiscountFormPrice] = useState("");

  // 초기 로딩 상태
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  /**
   * 모달이 열릴 때: 출고가와 공시지원금을 직접 다시 로드합니다.
   */
  useEffect(() => {
    if (isOpen && device && telecom) {
      // 입력값 초기화 (먼저 실행)
      setSelectedPlan(null);
      setSalesDiscount("");
      setDiscounts([]);
      setPriceListId(null);
      setPriceListMap({});
      setIsAddingDiscount(false);
      setEditingDiscountId(null);
      setDiscountFormName("");
      setDiscountFormPrice("");

      const loadModalData = async () => {
        setIsInitialLoading(true);
        try {
          // 1. 기기 상세(출고가) 조회
          const detailRes = await getPhoneDetailApi({ phoneName: device });
          setFetchedOriginalPrice(detailRes.originalPrice);

          // 2. 공시지원금 조회 (LG U+ 조건 처리)
          const searchTelecom = telecom === "LG U+" ? "LG U" : telecom;
          const subsidyRes = await getSubsidy(searchTelecom);
          setFetchedCommonDiscount(subsidyRes);

          // 3. 가격표 목록 조회하여 ID 매핑
          const priceListRes = await getPriceListByPhoneApi({ phoneName: device });
          // 현재 통신사/가입유형에 맞는 항목 찾기
          const targetSetting: PriceSettingFeildProps | undefined = priceListRes.priceList.find(
            p => (p.telecom === telecom || p.telecom === searchTelecom)
          );

          let foundPriceListId: number | null = null;
          if (targetSetting) {
            const map: Record<string, number> = {};
            targetSetting.options.forEach(opt => {
              // subscriptionType 검사 (option.type)
              if (opt.type === option?.type && opt.priceListId) {
                map[opt.plan] = opt.priceListId;
                // 첫 번째로 찾은 priceListId를 저장 (추가 할인 조회용)
                if (!foundPriceListId) {
                  foundPriceListId = opt.priceListId;
                }
              }
            });
            setPriceListMap(map);
          }
          
          // 4. Agency ID 추출
          const extractedAgencyId = getAgencyIdFromToken();
          const numericAgencyId = Number(extractedAgencyId);
          setAgencyId(numericAgencyId);

          // 5. 추가 할인 목록 조회 (priceListId가 있을 경우)
          if (foundPriceListId && numericAgencyId) {
            console.log("🔍 추가 할인 조회 시작:", { foundPriceListId, numericAgencyId });
            try {
              const discountRes = await getAdditionalDiscountsApi(numericAgencyId, foundPriceListId);
              console.log("✅ 추가 할인 응답:", discountRes);
              
              // 안전한 null/undefined 체크
              if (discountRes && Array.isArray(discountRes.discounts)) {
                console.log("📝 할인 목록 설정:", discountRes.discounts);
                setDiscounts(discountRes.discounts);
              } else {
                console.warn("⚠️ 응답에 discounts 배열이 없음:", discountRes);
                setDiscounts([]);
              }
            } catch (e) {
              console.error("❌ 추가 할인 목록 조회 실패:", e);
              // 오류 발생해도 빈 배열로 설정하여 UI가 깨지지 않도록 함
              setDiscounts([]);
            }
          } else {
            console.log("ℹ️ 추가 할인 조회 건너뜀:", { foundPriceListId, numericAgencyId });
          }

        } catch (e) {
          console.error("모달 데이터 로드 실패:", e);
        } finally {
          setIsInitialLoading(false);
        }
      };

      loadModalData();
    }
  }, [isOpen, device, telecom, option]); // option added dependency

  // 요금제 변경 시 PriceList ID 찾기
  useEffect(() => {
    if (selectedPlan && priceListMap[selectedPlan.name]) {
      setPriceListId(priceListMap[selectedPlan.name]);
    } else {
      setPriceListId(null);
      setDiscounts([]);
    }
  }, [selectedPlan, priceListMap]);

  // PriceList ID 변경 시 할인 목록 조회
  useEffect(() => {
    const fetchDiscounts = async () => {
      if (priceListId && agencyId) {
        try {
          // priceListId를 쿼리 파라미터로 전달하여 해당 가격표의 할인만 조회
          const res = await getAdditionalDiscountsApi(agencyId, priceListId);
          // 안전한 null/undefined 체크
          if (res && Array.isArray(res.discounts)) {
            setDiscounts(res.discounts);
          } else {
            setDiscounts([]);
          }
        } catch (e) {
          console.error("할인 목록 조회 실패:", e);
          setDiscounts([]);
        }
      } else {
        setDiscounts([]);
      }
    };
    fetchDiscounts();
  }, [priceListId, agencyId]);

  const _plans = useMemo(() => {
    return phonePlans[telecom as keyof typeof phonePlans] || [];
  }, [telecom]);

  const discountNumber = useMemo(() => {
    return Number(salesDiscount.replace(/[^0-9]/g, "")) || 0;
  }, [salesDiscount]);

  // 최종 실구매가 계산 (추가 할인은 계산에서 제외)
  const finalPrice = useMemo(() => {
    return fetchedOriginalPrice - fetchedCommonDiscount - discountNumber;
  }, [fetchedOriginalPrice, fetchedCommonDiscount, discountNumber]);

  const handleSubmit = async () => {
    if (!selectedPlan) return alert("요금제를 선택해주세요.");
    try {
      await enrollPriceListApi({
        phoneBrand,
        phoneName: device,
        phonePlanName: selectedPlan.name,
        telecom,
        subscriptionType: option!.type,
        subsidyByAgency: discountNumber,
        additionalDiscounts: discounts.map(d => ({
          name: d.할인명,
          price: d.할인가격
        }))
      });

      alert("가격이 성공적으로 등록되었습니다.");
      closeModal();
      window.location.reload();
    } catch (e) {
      alert("등록에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
      <div className="relative z-[1001] w-full max-w-[480px] bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-2xl min-h-[400px]">
        {isInitialLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-400">데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center">판매 가격 등록</h2>

        {/* 상단 기기 정보 요약 (Blue 디자인) */}
        <div className="flex justify-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 py-2 rounded-lg border border-blue-100">
          <span>{device}</span> / <span>{telecom}</span> /{" "}
          <span>{option?.type}</span>
        </div>

        {/* 1. 요금제 선택 구역 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">
            1. 요금제 선택
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-1 border rounded-lg bg-white">
            {_plans.map((plan, index) => (
              <button
                key={plan.name}
                onClick={() => setSelectedPlan(plan)}
                className={cn(
                  "p-2 border rounded-lg text-xs font-medium transition-colors",
                  selectedPlan?.name === plan.name
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                )}
              >
                {plan.name}
                {getPlanGroup(index) && ` (${getPlanGroup(index)})`}
              </button>
            ))}
          </div>
        </div>

            {/* 2. 추가 할인 관리 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700">
                  2. 추가 할인 관리
                </label>
                <button
                  onClick={() => {
                    setIsAddingDiscount(true);
                    setDiscountFormName("");
                    setDiscountFormPrice("");
                  }}
                  className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + 추가
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg bg-gray-50">
                {/* 추가 폼 */}
                {isAddingDiscount && (
                  <div className="bg-white border border-blue-300 rounded-lg p-3 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="할인명 입력"
                        value={discountFormName}
                        onChange={(e) => setDiscountFormName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="할인 금액"
                          value={discountFormPrice}
                          onChange={(e) => setDiscountFormPrice(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-full border border-gray-300 rounded px-2 py-1 pr-8 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="absolute right-2 top-1.5 text-gray-400 text-xs">원</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!discountFormName.trim()) {
                            alert("할인명을 입력해주세요.");
                            return;
                          }
                          if (!discountFormPrice || Number(discountFormPrice) <= 0) {
                            alert("할인 금액을 입력해주세요.");
                            return;
                          }
                          
                          // 로컬 상태에만 추가 (ID는 페이크로 생성)
                          setDiscounts([
                            ...discounts,
                            {
                              할인명: discountFormName,
                              할인가격: Number(discountFormPrice),
                              discountId: Date.now(), // 임시 ID
                              priceListId: priceListId || undefined,
                            },
                          ]);

                          setIsAddingDiscount(false);
                          setDiscountFormName("");
                          setDiscountFormPrice("");
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingDiscount(false);
                          setDiscountFormName("");
                          setDiscountFormPrice("");
                        }}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {/* 기존 할인 목록 */}
                {discounts.length === 0 && !isAddingDiscount && (
                  <div className="text-center text-sm text-gray-400 py-4">
                    등록된 추가 할인이 없습니다.
                  </div>
                )}

                 {discounts.map((discount, index) => (
                   <div key={discount.discountId || index}>
                     {editingDiscountId === (discount.discountId || index) ? (
                       // 수정 폼
                       <div className="bg-white border border-orange-300 rounded-lg p-3 flex flex-col gap-2">
                         <div className="flex gap-2">
                           <input
                             type="text"
                             value={discountFormName}
                             onChange={(e) => setDiscountFormName(e.target.value)}
                             className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                           />
                           <div className="flex-1 relative">
                             <input
                               type="text"
                               value={discountFormPrice}
                               onChange={(e) => setDiscountFormPrice(e.target.value.replace(/[^0-9]/g, ""))}
                               className="w-full border border-gray-300 rounded px-2 py-1 pr-8 text-sm text-right focus:outline-none focus:ring-1 focus:ring-orange-500"
                             />
                             <span className="absolute right-2 top-1.5 text-gray-400 text-xs">원</span>
                           </div>
                         </div>
                         <div className="flex gap-2">
                           <button
                             onClick={() => {
                               if (!discountFormName.trim() || !discountFormPrice) {
                                 alert("모든 필드를 입력해주세요.");
                                 return;
                               }
                               
                               // 로컬 상태만 업데이트
                               setDiscounts(discounts.map((d, i) => 
                                 (d.discountId === editingDiscountId || i === editingDiscountId) 
                                   ? { ...d, "할인명": discountFormName, "할인가격": Number(discountFormPrice) }
                                   : d
                               ));
                               setEditingDiscountId(null);
                               setDiscountFormName("");
                               setDiscountFormPrice("");
                             }}
                             className="flex-1 px-3 py-1.5 text-xs font-medium bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                           >
                             저장
                           </button>
                          <button
                            onClick={() => {
                              setEditingDiscountId(null);
                              setDiscountFormName("");
                              setDiscountFormPrice("");
                            }}
                            className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 일반 표시
                      <div className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-800">{discount.할인명 || '-'}</span>
                          <span className="text-xs text-gray-500">{(discount.할인가격 || 0).toLocaleString()}원</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              const targetId = discount.discountId || index;
                              setEditingDiscountId(targetId);
                              setDiscountFormName(discount.할인명 || "");
                              setDiscountFormPrice((discount.할인가격 || 0).toString());
                            }}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => {
                              if (!confirm("정말 삭제하시겠습니까?")) return;
                              // 로컬 상태에서만 삭제
                              setDiscounts(discounts.filter((_, i) => i !== index));
                            }}
                            className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 가격 계산기 구역 (Gray 디자인) */}
            <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
              <div className="flex justify-between text-gray-500">
                <span>단말기 출고가</span>
                <span className="font-bold">
                  {fetchedOriginalPrice > 0
                    ? `${fetchedOriginalPrice.toLocaleString()}원`
                    : "조회 중..."}
                </span>
              </div>

              <div className="flex justify-between text-red-500">
                <span>공통 지원금 (-)</span>
                <span className="font-medium">
                  {fetchedCommonDiscount > 0
                    ? `${fetchedCommonDiscount.toLocaleString()}원`
                    : "0원"}
                </span>
              </div>

              <div className="flex justify-between items-center font-medium">
                <span>판매점 지원금 (-)</span>
                <div className="relative">
                  <input
                    className="border border-gray-300 p-1 rounded w-28 text-right pr-6 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    placeholder="0"
                    value={salesDiscount}
                    onChange={(e) =>
                      setSalesDiscount(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  <span className="absolute right-2 top-1.5 text-gray-400 text-xs">
                    원
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-blue-600 text-base border-t border-gray-200 pt-3 mt-1">
                <span>최종 실구매가</span>
                <span>{finalPrice.toLocaleString()}원</span>
              </div>
            </div>

            {/* 버튼 구역 */}
            <div className="flex gap-2">
              <button
                className="flex-1 p-3 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                onClick={closeModal}
              >
                취소
              </button>
              <button
                className="flex-1 p-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors"
                onClick={handleSubmit}
              >
                등록하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditPriceModal;
