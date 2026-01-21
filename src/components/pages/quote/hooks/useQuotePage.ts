import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getSubsidy } from "../../../../apis";
import {
  getPriceListByPhoneApi,
  PriceSettingFeildProps,
} from "../../../../apis/priceList";

export const useQuotePage = (brand: "samsung" | "apple") => {
  const [searchParams, setSearchParams] = useSearchParams();
  const phoneParam = searchParams.get("phone");

  const [selectedOption, setSelectedOption] = useState<{ name: string } | null>(
    phoneParam ? { name: phoneParam } : null,
  );

  const [agencyPriceList, setAgencyPriceList] = useState<
    PriceSettingFeildProps[]
    >([]);
  
  const [commonDiscounts, setCommonDiscounts] = useState<
    Record<string, number>
  >({
    SKT: 0,
    KT: 0,
    "LG U+": 0,
  });

  // 1. 통신사별 공시 지원금 로드 (LG U+ 조회 시 LG U 사용)
  useEffect(() => {
    const fetchAllSubsidies = async () => {
      try {
        const [skt, kt, lgu] = await Promise.all([
          getSubsidy("SKT"),
          getSubsidy("KT"),
          getSubsidy("LG U"),
        ]);
        setCommonDiscounts({ SKT: skt, KT: kt, "LG U+": lgu });
      } catch (e) {
        console.error("지원금 로드 실패", e);
      }
    };
    fetchAllSubsidies();
  }, []);

  // 2. 기종 선택 시 데이터 로드 및 URL 동기화
  useEffect(() => {
    if (!selectedOption) return;
    setSearchParams({ phone: selectedOption.name });

    const fetchData = async () => {
      try {
        const res = await getPriceListByPhoneApi({
          phoneName: selectedOption.name,
        });
        // 서버 데이터 'LG U'를 UI용 'LG U+'로 변환
        const formatted = (res?.priceList || []).map((item) => ({
          ...item,
          telecom: item.telecom === "LG U" ? "LG U+" : (item.telecom as any),
        }));
        setAgencyPriceList(formatted);
      } catch (e) {
        setAgencyPriceList([]);
      }
    };
    fetchData();
  }, [selectedOption, setSearchParams]);

  return {
    selectedOption,
    setSelectedOption,
    commonDiscounts,
    agencyPriceList,
  };
};
