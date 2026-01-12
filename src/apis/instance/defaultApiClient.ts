import axios from "axios";
import { keysToCamel, keysToSnake } from "../../utils/caseConverter";

const baseURL = import.meta.env.VITE_API_URL;

const defaultApiClient = axios.create({
  baseURL,
});

defaultApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data) {
      config.data = keysToSnake(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

defaultApiClient.interceptors.response.use(
  (response) => {
    // 데이터가 있을 때만 CamelCase 변환
    if (response.data) {
      try {
        response.data = keysToCamel(response.data);
      } catch (e) {
        console.warn(
          "CamelCase 변환 중 오류가 발생했으나 데이터를 그대로 반환합니다."
        );
      }
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default defaultApiClient;
