import { authKey } from "./authKey";

export const logoutAction = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
    
    // Call backend logout directly from browser
    const res = await fetch(`${baseUrl}/user/logout`, {
      method: "POST",
      // Include credentials to send existing cookies and receive new "clear cookie" instructions
      credentials: "include", 
    });

    if (res.ok) {
      // 1. Clear cookies from JS (Frontend domain)
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "adminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      document.cookie = "adminRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      document.cookie = "adminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "adminRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // 2. Redirect to login
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Fallback: Force clear and redirect
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "adminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "adminRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  }
};
