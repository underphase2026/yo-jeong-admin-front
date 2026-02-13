import { useAtomValue, useSetAtom } from "jotai";
import { editPriceModalAtom, EditPriceModalCloseAtom } from "./atom";
import { useState, useMemo, useEffect, useRef } from "react";
import { phonePlans, getPlanGroup } from "../../../../contents/phonePlans";
import {
  enrollPriceListApi,
  getPhoneDetailApi,
  getPriceListByPhoneApi,
  addAdditionalDiscountApi,
  updateAdditionalDiscountApi,
  deleteAdditionalDiscountApi,
  type AdditionalDiscountItem,
  getAdditionalDiscountsApi,
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
  const isFirstLoad = useRef(true);

  // 1. 모달이 열릴 때 초기 상태 설정 (option.plan이 있으면 해당 요금제 정보 설정)
  useEffect(() => {
    if (isOpen && telecom) {
      const plans = phonePlans[telecom as keyof typeof phonePlans] || [];
      const initialPlan = plans.find(p => p.name === option?.plan);
      setSelectedPlan(initialPlan || null);
    }
  }, [isOpen, telecom, option?.plan]);

  /**
   * 모달이 열릴 때: 출고가와 공시지원금을 직접 다시 로드합니다.
   */
  useEffect(() => {
    if (isOpen && device && telecom) {
      // 입력값 초기화 (selectedPlan은 위에서 처리하므로 제외)
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
        isFirstLoad.current = true;
        
        try {
          const searchTelecom = telecom === "LG U+" ? "LG U" : telecom;
          const extractedAgencyId = getAgencyIdFromToken();
          const numericAgencyId = Number(extractedAgencyId);
          setAgencyId(numericAgencyId);

          // 1. 모든 데이터 (기기정보, 지원금, 가격표) 병렬 조회
          const [detailRes, subsidyRes, priceListRes] = await Promise.all([
            getPhoneDetailApi({ phoneName: device }),
            getSubsidy(searchTelecom),
            getPriceListByPhoneApi({ phoneName: device })
          ]);

          setFetchedOriginalPrice(detailRes.originalPrice);
          setFetchedCommonDiscount(subsidyRes);

          // 2. 가격표 ID 매칭
          let foundPriceListId: number | null = null;
          if (priceListRes.priceList) {
            const targetSetting = priceListRes.priceList.find(
              p => (p.telecom === telecom || p.telecom === searchTelecom)
            );

            if (targetSetting) {
              const map: Record<string, number> = {};
              targetSetting.options.forEach(opt => {
                if (opt.type === option?.type && opt.priceListId) {
                  map[opt.plan] = opt.priceListId;
                  // 현재 "이미 선택된" (클릭한 행 기반) 요금제에 대한 ID 찾기
                  if (opt.plan === option?.plan) {
                    foundPriceListId = opt.priceListId;
                  }
                }
              });
              setPriceListMap(map);
            }
          }

          // 3. (중복 제거) 여기서 직접 호출하지 않고, 아래의 useEffect가 priceListId 변경을 감지하도록 함
          if (foundPriceListId) {
            setPriceListId(foundPriceListId);
          }

        } catch (e) {
          console.error("모달 데이터 로드 실패:", e);
        } finally {
          setIsInitialLoading(false);
          setTimeout(() => {
            isFirstLoad.current = false;
          }, 0);
        }
      };

      loadModalData();
    }
  }, [isOpen, device, telecom, option?.type, option?.plan]);

  // 요금제 변경 시 PriceList ID 찾기
  useEffect(() => {
    // 초기 로딩 중에는 priceListMap이 채워지고 있는 중이므로 덮어쓰지 않도록 함
    if (isInitialLoading) return;

    if (selectedPlan && priceListMap[selectedPlan.name]) {
      setPriceListId(priceListMap[selectedPlan.name]);
    } else {
      // 요금제 선택이 수동으로 해제된 경우에만 초기화
      if (selectedPlan === null && !isInitialLoading) {
        setPriceListId(null);
        setDiscounts([]);
      }
    }
  }, [selectedPlan, priceListMap, isInitialLoading]);

  // PriceList ID 변경 시 할인 목록 조회 (사용자 조작 및 초기 로드 완료 대응)
  useEffect(() => {
    // 1. 대리점 ID가 없거나 초기 로딩 중인 경우 건너뜀
    // 2. priceListId가 없는 경우 호출하지 않음 (사용자 요구사항: 무조건 둘 다 포함)
    if (!agencyId || isInitialLoading || !priceListId) return;

    const fetchDiscounts = async () => {
      try {
        // console.log("Fetching discounts with:", { agencyId, priceListId }); // 디버깅용
        const res = await getAdditionalDiscountsApi(agencyId, priceListId);
        if (res && Array.isArray(res.discounts)) {
          setDiscounts(res.discounts);
        } else {
          setDiscounts([]);
        }
      } catch (e) {
        console.error("할인 목록 조회 실패:", e);
        setDiscounts([]);
      }
    };
    
    fetchDiscounts();
  }, [priceListId, agencyId, isInitialLoading]);

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
          <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-1 border rounded-lg bg-white relative">
            {_plans.length === 0 ? (
              <div className="col-span-2 py-4 text-center text-xs text-gray-400">조회 가능한 요금제가 없습니다.</div>
            ) : (
              _plans.map((plan, index) => (
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
              ))
            )}
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
                        onClick={async () => {
                          if (!discountFormName.trim()) {
                            alert("할인명을 입력해주세요.");
                            return;
                          }
                          if (!discountFormPrice || Number(discountFormPrice) <= 0) {
                            alert("할인 금액을 입력해주세요.");
                            return;
                          }
                          
                          // 2. 추가 할인 API 호출
                          try {
                            await addAdditionalDiscountApi({
                              priceListId: priceListId || 0, // 0 또는 특정 의미있는 null 값 전달
                              name: discountFormName,
                              price: Number(discountFormPrice),
                            });
                            
                            // 3. 목록 새로고침
                            if (agencyId) {
                               const res = await getAdditionalDiscountsApi(agencyId, priceListId || undefined);
                               setDiscounts(Array.isArray(res.discounts) ? res.discounts : []);
                            }

                            setIsAddingDiscount(false);
                            setDiscountFormName("");
                            setDiscountFormPrice("");
                          } catch (e) {
                            console.error("추가 할인 등록 실패:", e);
                            alert("추가 할인 등록에 실패했습니다.");
                          }
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
                             onClick={async () => {
                               if (!discountFormName.trim() || !discountFormPrice) {
                                 alert("모든 필드를 입력해주세요.");
                                 return;
                               }
                               
                               const targetId = (discount.discountId || (discount as any).id || (discount as any).idx) as number;

                               if (!targetId) {
                                  alert("식별 ID 정보가 부족하여 수정할 수 없습니다.");
                                  return;
                               }

                               try {
                                 await updateAdditionalDiscountApi({
                                   id: targetId,
                                   priceListId: priceListId || 0,
                                   newName: discountFormName,
                                   price: Number(discountFormPrice),
                                 });
                                 
                                 // 목록 새로고침
                                 if (agencyId) {
                                    const res = await getAdditionalDiscountsApi(agencyId, priceListId || undefined);
                                    setDiscounts(Array.isArray(res.discounts) ? res.discounts : []);
                                 }
                                 
                                 setEditingDiscountId(null);
                                 setDiscountFormName("");
                                 setDiscountFormPrice("");
                               } catch (e) {
                                 console.error("수정 실패:", e);
                                 alert("수정에 실패했습니다.");
                               }
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
                            onClick={async () => {
                              if (!confirm("정말 삭제하시겠습니까?")) return;
                              
                              const targetId = (discount.discountId || (discount as any).id || (discount as any).idx) as number;

                              if (!targetId) {
                                 alert("식별 ID 정보가 부족하여 삭제할 수 없습니다.");
                                 return;
                              }

                              try {
                                await deleteAdditionalDiscountApi({ 
                                    id: targetId,
                                    priceListId: priceListId || 0
                                });
                                // 목록 새로고침
                                if (agencyId) {
                                   const res = await getAdditionalDiscountsApi(agencyId, priceListId || undefined);
                                   setDiscounts(Array.isArray(res.discounts) ? res.discounts : []);
                                }
                              } catch (e) {
                                console.error("삭제 실패:", e);
                                alert("삭제에 실패했습니다.");
                              }
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
