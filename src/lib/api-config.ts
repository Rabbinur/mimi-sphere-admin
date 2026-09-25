export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
  if (typeof window !== "undefined" && window.location.hostname && window.location.hostname !== "localhost") {
    return envUrl.replace(/localhost|127\.0\.0\.1/, window.location.hostname);
  }
  return envUrl;
};
