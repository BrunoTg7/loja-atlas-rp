import { GatewayProvider } from "./types";
import { MockGateway } from "./providers/mock";
import { InfinitePayGateway } from "./providers/infinitepay";

let cached: GatewayProvider | null = null;

export function getGatewayProvider(providerName?: string): GatewayProvider {
  if (cached) return cached;

  const name = providerName || process.env.GATEWAY_PROVIDER || "mock";

  switch (name) {
    case "infinitepay":
      cached = new InfinitePayGateway();
      break;
    case "mock":
    default:
      cached = new MockGateway();
      break;
  }

  return cached;
}
