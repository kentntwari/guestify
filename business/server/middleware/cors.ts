export default defineEventHandler(async (event) => {
  if (handleCors(event, { origin: "*" })) return;
});
