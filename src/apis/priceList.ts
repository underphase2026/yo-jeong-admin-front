// import defaultApiClient from "./instance/defaultApiClient";

// // export const getSubsidy = async (telecom: string): Promise<number> => {
// //   try {
// //     const res = await defaultApiClient.get(
// //       `/user/getSubsidy?telecom=${telecom}`,
// //     );
// //     // 백엔드 응답이 { subsidy: 500000 } 형태라면 res.data.subsidy로 가져와야 함
// //     return res.data.amount || res.data.subsidy || 0;
// //   } catch (error) {
// //     console.error(`[${telecom}] 공시지원금 호출 실패:`, error);
// //     return 0; // 실패 시 기본값 0 반환으로 페이지 중단 방지
// //   }
// // };

// export interface PriceOptions {
//   type: "기기변경" | "번호이동" | "신규가입";
//   plan: string;
//   price: number;
// }

// export interface PriceSettingFeildProps {
//   telecom: "SKT" | "KT" | "LGU+";
//   device: string;
//   options: PriceOptions[];
// }

// export interface getPriceListByPhoneResponse {
//   priceList: PriceSettingFeildProps[];
// }

// export interface enrollPriceListRequest {
//   phoneBrand: string;
//   phoneName: string;
//   phonePlanName: string;
//   telecom: string;
//   subscriptionType: string;
//   subsidyByAgency: number;
// }

// // 명세서에 따른 API 함수들
// export const getPriceListByPhoneApi = async (data: {
//   phoneName: string;
//   phoneBrand: string;
// }) => {
//   const res = await defaultApiClient.get<getPriceListByPhoneResponse>(
//     `/user/getPriceListByPhone?phoneName=${data.phoneName}&phoneBrand=${data.phoneBrand}`,
//   );
//   return res.data;
// };

// export const enrollPriceListApi = async (data: enrollPriceListRequest) => {
//   const res = await defaultApiClient.post(
//     "/agency/enrollPriceListDetail",
//     data,
//   );
//   return res.data;
// };

// // // 공시지원금 조회 (기존 로직 유지)
// // export const getSubsidy = async (telecom: string): Promise<number> => {
// //   const res = await defaultApiClient.get(`/subsidy?telecom=${telecom}`);
// //   return res.data.amount;
// // };

// interface checkIsUserVisitRequest {
//   costomerId: string;
// }

// export const checkIsUserVisitApi = async (data: checkIsUserVisitRequest) => {
//   try {
//     const res = await defaultApiClient.post("/agency/checkIsUserVisit", data);
//     return res.data;
//   } catch (error) {
//     console.error("Error in checkIsUserVisitApi:", error);
//     throw error;
//   }
// };

// interface checkLoginRequest {}

// export const checkLoginApi = async () => {
//   try {
//     const res = await defaultApiClient.get("/agency/checkLogin");
//     return res.data;
//   } catch (error) {
//     console.error("Error in checkLoginApi:", error);
//     throw error;
//   }
// };

import defaultApiClient from "./instance/defaultApiClient";

export interface PriceOptions {
  type: "기기변경" | "번호이동" | "신규가입";
  plan: string;
  price: number;
  priceListId?: number; // Added to access ID
}

export interface PriceSettingFeildProps {
  // DB에서 오는 'LG U'와 UI에서 쓸 'LG U+'를 모두 허용하도록 수정
  telecom: "SKT" | "KT" | "LG U+" | "LG U";
  device: string;
  options: PriceOptions[];
}

export interface getPriceListByPhoneResponse {
  priceList: PriceSettingFeildProps[];
}

export interface enrollPriceListRequest {
  phoneBrand: string;
  phoneName: string;
  phonePlanName: string;
  telecom: string;
  subscriptionType: string;
  subsidyByAgency: number;
  additionalDiscounts?: {
    name: string;
    price: number;
  }[];
}

export interface enrollPriceListResponse {
  priceListId?: number; 
  id?: number;
  success?: boolean;
}

// phone_brand 파라미터 제외
export const getPriceListByPhoneApi = async (data: { phoneName: string }) => {
  const res = await defaultApiClient.get<getPriceListByPhoneResponse>(
    `/agency/getPriceListByPhone`,
    {
      params: {
        phone_name: data.phoneName,
      },
    },
  );
  return res.data;
};

export const enrollPriceListApi = async (data: enrollPriceListRequest) => {
  // 전송 직전 'LG U+'를 'LG U'로 변환
  const requestData = {
    ...data,
    telecom: data.telecom === "LG U+" ? "LG U" : data.telecom,
  };
  const res = await defaultApiClient.post<enrollPriceListResponse>(
    "/agency/enrollPriceListDetail",
    requestData,
  );
  return res.data;
};

export interface getPhoneDetailRequest {
  phoneName: string;
}

export interface getPhoneDetailResponse {
  originalPrice: number;
}

// 2. 기종별 상세 정보(출고가) 조회
export const getPhoneDetailApi = async (data: getPhoneDetailRequest) => {
  const res = await defaultApiClient.get<getPhoneDetailResponse>(
    `/agency/getPhoneDetail`,
    {
      params: {
        phone_name: data.phoneName, // phoneName -> phone_name 으로 수정하여 400 에러 해결
      },
    },
  );
  return res.data;
};

// ============ Additional Discount APIs ============

// Custom Axios instance for APIs that require CamelCase request body
// defaultApiClient converts request body to snake_case, which causes 400 Bad Request
// because NestJS backend expects priceListId (CamelCase).
import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL;
const camelClient = axios.create({ baseURL });

camelClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Convert response keys to camelCase (consistent with defaultApiClient)
import { keysToCamel } from "../utils/caseConverter";
camelClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      try {
        response.data = keysToCamel(response.data);
      } catch (e) {
        // ignore
      }
    }
    return response;
  },
  async (error) => {
      // Handle 401 like defaultApiClient
    if (error.response?.status === 401) {
       // Optional: Redirect to login or just reject?
       // user module API might not always redirect. Keeping it simple.
    }
    return Promise.reject(error);
  }
);

export interface AdditionalDiscountItem {
  "할인명": string;
  "할인가격": number;
  priceListId?: number;
  discountId?: number;
}

export interface GetAdditionalDiscountsResponse {
  discounts: AdditionalDiscountItem[];
}

export interface AddAdditionalDiscountRequest {
  priceListId: number;
  name: string;
  price: number;
}

export interface UpdateAdditionalDiscountRequest {
  id: number;
  priceListId: number;
  newName: string;
  price: number;
}

export interface UpdateAdditionalDiscountResponse {
  name: string;
  price: number;
}

export interface DeleteAdditionalDiscountRequest {
  id: number;
  priceListId: number;
}

// Get all additional discounts for an agency
export const getAdditionalDiscountsApi = async (agencyId: number, priceListId?: number) => {
  const res = await camelClient.post<GetAdditionalDiscountsResponse>(
    `/user/getAdditionalDiscounts`,
    {
      agencyId: agencyId,
      priceListId: priceListId,
    },
  );

  // 백엔드 응답 키값 매핑 (스크린샷 및 다양한 백엔드 버전 대응)
  if (res.data && Array.isArray(res.data.discounts)) {
    res.data.discounts = res.data.discounts.map((item: any) => {
      // 1. 이름/가격 매핑
      const mappedItem = {
        ...item,
        "할인명": item["할인명"] || item["추가 할인 명"] || item["name"] || "-",
        "할인가격": item["할인가격"] || item["가격"] || item["price"] || 0,
      };

      // 2. ID 매핑 강화 (백엔드에서 올 수 있는 모든 가능성 체크)
      // camelClient에서 keysToCamel을 쓰므로 snake_case는 이미 camelCase로 변환되어 있을 것임 (예: price_list_id -> priceListId)
      mappedItem.discountId = item.discountId || item.id || item.discount_id;
      mappedItem.priceListId = item.priceListId || item.price_list_id || item.priceList_id || priceListId;

      return mappedItem;
    });
  }

  return res.data;
};

// Add new additional discount
export const addAdditionalDiscountApi = async (
  data: AddAdditionalDiscountRequest,
) => {
  // Use camelClient to preserve camelCase keys
  const res = await camelClient.post(`/agency/addAdditionalDiscount`, data);
  return res.data;
};

// Update existing additional discount
export const updateAdditionalDiscountApi = async (
  data: UpdateAdditionalDiscountRequest,
) => {
  const res = await camelClient.patch<UpdateAdditionalDiscountResponse>(
    `/agency/updateAdditionalDiscount`,
    data,
  );
  return res.data;
};

// Delete additional discount
export const deleteAdditionalDiscountApi = async (
  data: DeleteAdditionalDiscountRequest,
) => {
  const res = await camelClient.delete(`/agency/deleteAdditionalDiscount`, {
    data,
  });
  return res.data;
};
