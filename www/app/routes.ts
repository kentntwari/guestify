import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/_layout.tsx", [route("events", "routes/_layout.events.tsx")]),
] satisfies RouteConfig;
