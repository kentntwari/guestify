import { Outlet, redirect } from "react-router";
import { ofetch as $fetch } from "ofetch";

import { Navbar } from "../components/Navbar";

export async function loader() {
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
