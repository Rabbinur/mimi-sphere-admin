"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const deleteCookies = async (keys: string[], path?: string) => {
  const cookieStore = await cookies();

  for (const key of keys) {
    //@ts-ignore
    cookieStore.delete(key);
  }

  if (path) {
    redirect(path);
  }
};
