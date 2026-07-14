export type PaymentMethod = "pix" | "credit_card";

export interface CardData {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
  cpf: string;
}

export interface CreatePaymentInput {
  orderId: string;
  amountCents: number;
  currency: string;
  method: PaymentMethod;
  customerName: string;
  customerEmail?: string;
  description: string;
  installments?: number;
  callbackUrl: string;
  cardData?: CardData;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: "pending" | "approved" | "failed";
  pixCode?: string;
  pixQrCode?: string;
  paymentUrl?: string;
  error?: string;
}

export interface GatewayProvider {
  name: string;
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  validateWebhook(body: string, headers: Record<string, string>): {
    valid: boolean;
    paymentId?: string;
    gatewayEventId?: string;
    status?: string;
    orderId?: string;
  };
}
