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
  userId: number;
  password: string;
  name: string;
  sellerName: string;
  address: string;
  phoneNumber: string;
  email: string;
  startTime: string;
  endTime: string;
}

export const agencyRegisterApi = async (data: AgencyRegisterRequest) => {
  try {
    const res = await defaultApiClient.post("/agency/register", data);
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

export interface getStatusAgencyResponse {
  quoteCount: number;
  completeQuoteCount: number;
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

export const getQuoteDetailApi = async (data: getQuoteDetailRequest) => {
  try {
    const res = await defaultApiClient.get(
      `/agency/getQuoteDetail?quoteCode=${data.quoteCode}`
    );
    return res.data;
  } catch (error) {
    console.error("Error in getQuoteDetailApi:", error);
    throw error;
  }
};
