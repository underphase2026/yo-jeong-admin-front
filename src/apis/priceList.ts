import defaultApiClient from "./instance/defaultApiClient";

interface getPriceListByPhoneRequest {
  phoneName: string;
  phoneBrand: string;
}

export const getPriceListByPhoneApi = async (
  data: getPriceListByPhoneRequest
) => {
  try {
    const res = await defaultApiClient.get(
      `/user/getPriceListByPhone?phoneName=${data.phoneName}&phoneBrand=${data.phoneBrand}`
    );
    return res.data;
  } catch (error) {
    console.error("Error in getPriceListByPhoneApi:", error);
    throw error;
  }
};

interface enrollPriceListRequest {
  phoneBrand: string;
  phoneName: string;
  phonePlanName: string;
  telecom: string;
  subscriptionType: string;
  subsidyByNumber: number;
}

export const enrollPriceListApi = async (data: enrollPriceListRequest) => {
  try {
    const res = await defaultApiClient.post("/agency/enrollPriceList", data);
    return res.data;
  } catch (error) {
    console.error("Error in enrollPriceListApi:", error);
    throw error;
  }
};

interface checkIsUserVisitRequest {
  costomerId: string;
}

export const checkIsUserVisitApi = async (data: checkIsUserVisitRequest) => {
  try {
    const res = await defaultApiClient.post("/agency/checkIsUserVisit", data);
    return res.data;
  } catch (error) {
    console.error("Error in checkIsUserVisitApi:", error);
    throw error;
  }
};

interface checkLoginRequest {}

export const checkLoginApi = async () => {
  try {
    const res = await defaultApiClient.get("/agency/checkLogin");
    return res.data;
  } catch (error) {
    console.error("Error in checkLoginApi:", error);
    throw error;
  }
};
