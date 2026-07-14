import { GatewayProvider, CreatePaymentInput, PaymentResult } from "../types";

export class InfinitePayGateway implements GatewayProvider {
  name = "infinitepay";

  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.GATEWAY_API_KEY || "";
    this.apiUrl = process.env.GATEWAY_API_URL || "https://api.infinitepay.io/v1";
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    try {
      const body: Record<string, any> = {
        amount: input.amountCents,
        currency: input.currency,
        description: input.description,
        order_id: input.orderId,
        callback_url: input.callbackUrl,
      };

      if (input.method === "pix") {
        body.payment_method = "pix";
      } else {
        body.payment_method = "credit_card";
        body.installments = input.installments || 1;
        body.customer = {
          name: input.customerName,
          email: input.customerEmail,
        };
      }

      const res = await fetch(`${this.apiUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          paymentId: "",
          status: "failed",
          error: data.message || `Erro ${res.status}`,
        };
      }

      return {
        success: true,
        paymentId: data.id || data.payment_id,
        status: "pending",
        pixCode: data.pix_code,
        pixQrCode: data.pix_qr_code,
        paymentUrl: data.payment_url,
      };
    } catch (err: any) {
      return {
        success: false,
        paymentId: "",
        status: "failed",
        error: err.message,
      };
    }
  }

  validateWebhook(body: string, headers: Record<string, string>) {
    const webhookSecret = process.env.GATEWAY_WEBHOOK_SECRET;
    if (!webhookSecret) return { valid: false };

    const crypto = require("crypto");
    const signature = headers["x-webhook-signature"] || headers["x-hub-signature-256"];
    if (!signature) return { valid: false };

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    const sigClean = signature.replace("sha256=", "");
    const a = Buffer.from(sigClean);
    const b = Buffer.from(expected);

    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false };
    }

    try {
      const payload = JSON.parse(body);
      return {
        valid: true,
        paymentId: payload.payment_id || payload.id,
        gatewayEventId: payload.event_id || payload.id,
        status: payload.status,
        orderId: payload.order_id,
      };
    } catch {
      return { valid: false };
    }
  }
}
