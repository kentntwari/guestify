import { Outlet, redirect } from "react-router";
import { ofetch as $fetch } from "ofetch";

import { Navbar } from "../components/Navbar";

export async function loader() {
  const res = await $fetch(
    "https://survey-iran-disc-makes.trycloudflare.com/api/auth/user"
  );
  
  if (!res.isAuthenticated)
    return redirect(
      "https://survey-iran-disc-makes.trycloudflare.com/api/auth/login"
    );
  return null;
}

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
