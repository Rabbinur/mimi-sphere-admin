import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getApiBaseUrl } from "./api-config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getProxiedUrl = (url: string | undefined) => {
  if (!url) return "";
  // If it's already a data URL, localhost, or already proxied, return as is
  if (url.startsWith("data:") || url.includes("localhost") || url.includes("proxy?url=")) return url;

  // List of domains that are typically blocked or have CORS issues
  const blockedDomains = ["alicdn.com", "1688.com", "alicdn"];
  const shouldProxy = blockedDomains.some(domain => url.includes(domain));

  if (shouldProxy) {
    const API_URL = getApiBaseUrl();
    const baseUrl = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;
    return `${baseUrl}file/proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
};
