import { authKey } from "./authKey";

export const userLogin = async (formData: any) => {
  const endpoint = formData.access_token ? '/user/google-login' : '/user/login';
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      // This is the key: it allows the browser to receive and store cookies from the backend
      credentials: "include", 
    }
  );

  const userInfo = await res.json();
  
  // No need to manually set cookies here anymore! 
  // The browser handles it automatically because of credentials: "include" 
  // and the backend's res.cookie() header.

  return userInfo;
};
