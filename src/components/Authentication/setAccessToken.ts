"use server";

import { cookies } from "next/headers";
import { authKey } from "./authKey";

export const setAccessToken = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(authKey, token, {
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
};
