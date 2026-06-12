import { redirect } from "next/navigation";
import { siteRoutes } from "../data/siteRoutes";

export default function RootPage() {
  redirect(siteRoutes.home);
}
