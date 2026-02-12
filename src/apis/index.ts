import defaultApiClient from "./instance/defaultApiClient";

// interface SearchAgenciesRequest {
//   phoneName: string;
//   phoneBrand: string;
//   telecom: string;
//   canChangeTelecom: boolean;
// }

// export interface AgencyInfo {
//   agencyId: number;
//   agencyName: string;
//   agencyRating: number;

//   telecom: string;
//   subscriptionType: string;

//   phoneBrand: string;
//   phoneName: string;
//   phonePrice: number;

//   authTag: boolean;
// }

// interface SearchAgenciesResponse {
//   agency: AgencyInfo[];
// }

// export const searchAgenciesApi = async (data: SearchAgenciesRequest) => {
//   try {
//     const res = await defaultApiClient.post<SearchAgenciesResponse>(
//       "/user/searchAgencies",
//       data
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Error in searchAgenciesApi:", error);
//     throw error;
//   }
// };

// interface AgencyDetailRequest {
//   agencyId: number;
//   phoneBrand: string;
//   phoneName: string;
//   telecom: string;
//   subscriptionType: string;
// }

// export interface AgencyDetailResponse {
//   agencyId: number;
//   agencyName: string;
//   agencyRating: number;
//   agencyAddress: string;
//   agencyPhoneNumber: string;

//   phoneName: string;
//   phoneBrand: string;
//   phonePrice: number;
//   phoneOriginalPrice: number;
//   phoneImage: string;

//   startTime: string;
//   endTime: string;
// }

// export const getAgencyDetail = async (data: AgencyDetailRequest) => {
//   try {
//     const res = await defaultApiClient.post<AgencyDetailResponse>(
//       "/user/getAgencyDetail",
//       data
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Error in getAgencyDetail:", error);
//     throw error;
//   }
// };

export const getSubsidy = async (telecom: string) => {
  try {
    const res = await defaultApiClient.get<{ subsidyValue: number }>(
      `/user/getSubsidy?telecom=${telecom}`
    );
    return res.data.subsidyValue;
  } catch (error) {
    console.error("Error in getSubsidy:", error);
    throw error;
  }
};

interface AgencyLoginRequest {
  userId: string;
  password: string;
}

export const agencyLoginApi = async (data: AgencyLoginRequest) => {
  try {
    const res = await defaultApiClient.post("/agency/agencyLogin", data);
    return res.data;
  } catch (error) {
    console.error("Error in agencyLoginApi:", error);
    throw error;
  }
};

interface AgencyRegisterRequest {
  user_id: string;
  password: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
}

export const agencyRegisterApi = async (data: AgencyRegisterRequest) => {
  try {
    const res = await defaultApiClient.post("/agency/agencyRegister", data);
    return res.data;
  } catch (error) {
    console.error("Error in agencyRegisterApi:", error);
    throw error;
  }
};

interface enrollAgencyRequest {
  telecom: string;
  subsidyValue: number;
}

export const enrollAgencyApi = async (data: enrollAgencyRequest) => {
  try {
    const res = await defaultApiClient.post("/agency/enrollAgency", data);
    return res.data;
  } catch (error) {
    console.error("Error in enrollAgencyApi:", error);
    throw error;
  }
};

interface getStatusAgencyRequest {}

export interface quoteInfo {
  quoteId: number;
  customerName: string;
  costomerPhoneNumber: string;
  quoteCode: string;
  createTime: Date;
  isUserVisit: boolean;
}

export interface getStatusAgencyResponse {
  quoteCount: number;
  completeQuoteCount: number;
  quotes: quoteInfo[];
}

export const getStatusAgencyApi = async () => {
  try {
    const res = await defaultApiClient.get<getStatusAgencyResponse>(
      "/agency/getStatusAgency"
    );
    return res.data;
  } catch (error) {
    console.error("Error in getStatusAgencyApi:", error);
    throw error;
  }
};

interface getStatusQuoteRequest {
  authCode: string;
}

export interface getStatusQuoteResponse {
  userName: string;
  agencyPhoneNumber: string;
  isUserVisit: boolean;
}

export const getStatusQuoteApi = async (data: getStatusQuoteRequest) => {
  try {
    const res = await defaultApiClient.get<getStatusQuoteResponse>(
      `/agency/getStatusQuote?authCode=${data.authCode}`
    );
    return res.data;
  } catch (error) {
    console.error("Error in getStatusQuoteApi:", error);
    throw error;
  }
};

interface getQuoteDetailRequest {
  quoteCode: string;
}

export interface getQuoteDetailResponse {
  isPhoneActivate: boolean;
  customerName: string;
  customerEmail: string;
  phoneBrand: string;
  phoneName: string;
  phoneVolume: string;
  phonePlanName: string;
  telecom: string;
  subscriptionType: string;
  subsidyByTelecom: number;
  subsidyByAgency: number;
  price: number;
  createTime: string;
}

export interface UserItem {
  estimateId: number;
  customerName: string;
  customerPhoneNumber: string;
  customerEmail: string;
  phoneBrand: string;
  phoneName: string;
  authCode: string;
  isUserVisit: boolean;
  isPhoneActivate: boolean;
  createTime: string;
  elapsedTime: string;
}

export interface GetUserListResponse {
  users: UserItem[];
}

export const getUserListApi = async (): Promise<GetUserListResponse> => {
  try {
    const res = await defaultApiClient.get<GetUserListResponse>(
      "/agency/getUserList"
    );
    return res.data;
  } catch (error) {
    console.error("Error in getUserListApi:", error);
    throw error;
  }
}

export const getQuoteDetailApi = async (data: getQuoteDetailRequest) => {
  try {
    const res = await defaultApiClient.get<getQuoteDetailResponse>(
      "/agency/getQuoteDetail",
      {
        params: {
          // 서버 스웨거에서 쿼리 파라미터 이름이 'quoteCode'인지 'quote_code'인지 확인하세요.
          auth_code: data.quoteCode,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

interface UpdateVisitStatusRequest {
  authCode: string;
  isUserVisit: boolean;
}

interface UpdateVisitStatusResponse {
  success: boolean;
  message: string;
}

export const updateVisitStatusApi = async (data: UpdateVisitStatusRequest) => {
  try {
    const res = await defaultApiClient.post<UpdateVisitStatusResponse>(
      "/agency/updateVisitStatus",
      {
        auth_code: data.authCode,
        is_user_visit: data.isUserVisit,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error in updateVisitStatusApi:", error);
    throw error;
  }
};
