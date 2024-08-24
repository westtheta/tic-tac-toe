import { CanvasInterface, CanvasClient } from "@dscvr-one/canvas-client-sdk";

async function getUser() {
  const canvasClient = new CanvasClient();
  const canvasHandshakeResponse = await canvasClient.ready();
  return canvasHandshakeResponse;
}
export const canvasHandshakeResponse = getUser();
