import { GatewayProvider, CreatePaymentInput, PaymentResult } from "../types";

export class MockGateway implements GatewayProvider {
  name = "mock";

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    console.log(`[GATEWAY-MOCK] Pagamento criado:`, {
      orderId: input.orderId,
      method: input.method,
      amount: input.amountCents / 100,
    });

    const paymentId = `PAY-MOCK-${crypto.randomUUID()}`;

    if (input.method === "pix") {
      return {
        success: true,
        paymentId,
        status: "pending",
        pixCode: `00020126580014BR.GOV.BCB.PIX0136${paymentId}520400005303986540${(input.amountCents / 100).toFixed(2)}5802BR5925LOJA ATLAS RP6009SAO PAULO62070503***6304`,
        pixQrCode: "",
      };
    }

    // Cartão: processa on-site e aprova instantaneamente (mock)
    return {
      success: true,
      paymentId,
      status: "approved",
    };
  }

  validateWebhook(body: string, headers: Record<string, string>) {
    return {
      valid: true,
      paymentId: "mock",
      gatewayEventId: `evt-${crypto.randomUUID()}`,
      status: "approved",
      orderId: "mock",
    };
  }
}
