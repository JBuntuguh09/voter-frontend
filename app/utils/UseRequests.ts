import axios, { AxiosInstance, AxiosRequestHeaders, RawAxiosRequestHeaders } from "axios";
import Cookies from "js-cookie";
import { URL } from "./Constant";

const api: AxiosInstance = axios.create({
  baseURL: URL,
});

interface UseRequestsReturn {
  httpAuthGetAsync<T = any>(url: string): Promise<T>;
  httpPostAsync<T = any, U = any>(url: string, body: T): Promise<U>;
  httpAuthPostAsync<T = any, U = any>(
    url: string,
    body: T,
    headers?: AxiosRequestHeaders
  ): Promise<U>;
  httpAuthPutAsync<T = any, U = any>(
    url: string,
    body: T,
    headers?: AxiosRequestHeaders
  ): Promise<U>;
  httpAuthPatchAsync<T = any, U = any>(
    url: string,
    body: T,
    headers?: AxiosRequestHeaders
  ): Promise<U>;
  httpAuthDeleteAsync<T = any, U = any>(url: string, body?: T): Promise<U>;
}

export default function useRequests(tokenInfo?: string): UseRequestsReturn {
  const token = Cookies.get("token");
  const sessionToken = tokenInfo ?? token;

  // Default headers
  const reqHeaders: RawAxiosRequestHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionToken}`,
    "Access-Control-Allow-Origin": "*",
  };

  function getHeaders(body: any, customHeaders?: AxiosRequestHeaders) {
    // If body is FormData, let the browser set correct boundary-based Content-Type
    const isFormData = body instanceof FormData;
    const baseHeaders = isFormData
      ? { Authorization: `Bearer ${sessionToken}` } // no Content-Type override
      : reqHeaders;

    return { ...baseHeaders, ...customHeaders };
  }

  async function httpPostAsync<T = any, U = any>(url: string, body: T): Promise<U> {
    const response = await api.post<U>(url, body);
    return response.data;
  }

  async function httpAuthGetAsync<T = any>(url: string): Promise<T> {
    const response = await api.get<T>(url, { headers: reqHeaders });
    return response.data;
  }

  async function httpAuthPostAsync<T = any, U = any>(
    url: string,
    body: T,
    headers?: AxiosRequestHeaders
  ): Promise<U> {
    const response = await api.post<U>(url, body, { headers: getHeaders(body, headers) });
    return response.data;
  }

  async function httpAuthPutAsync<T = any, U = any>(
    url: string,
    body: T,
    headers?: AxiosRequestHeaders
  ): Promise<U> {
    const response = await api.put<U>(url, body, { headers: getHeaders(body, headers) });
    return response.data;
  }

  async function httpAuthPatchAsync<T = any, U = any>(
    url: string,
    body: T,
    headers?: AxiosRequestHeaders
  ): Promise<U> {
    const response = await api.patch<U>(url, body, { headers: getHeaders(body, headers) });
    return response.data;
  }

  async function httpAuthDeleteAsync<T = any, U = any>(url: string, body?: T): Promise<U> {
    const config = {
      headers: reqHeaders,
      data: body,
    };
    const response = await api.delete<U>(url, config);
    return response.data;
  }

  return {
    httpAuthGetAsync,
    httpPostAsync,
    httpAuthPostAsync,
    httpAuthPutAsync,
    httpAuthDeleteAsync,
    httpAuthPatchAsync,
    
  };
}
