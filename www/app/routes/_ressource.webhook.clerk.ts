import type { Route } from "./+types/_ressource.webhook.clerk";

import { ClerkWebhookController } from "_controllers/webhook.clerk";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  return new ClerkWebhookController(request).handleWebhookEvent();
}
