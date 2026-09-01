import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { logoutAction } from "./logoutAction";

export const logoutUser = async (router: AppRouterInstance, path: string = "/") => {
  await logoutAction();
  router.push(path);
  router.refresh();
};
