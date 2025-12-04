// Model Layer - TypeScript Interfaces matching actual backend

export type PackageStatus = 
  | 'awaiting_payment'
  | 'payment_verified'
  | 'in_transit'
  | 'delivered';

export interface RecipientDetails {
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

// Backend response for GET /partners/status/:id
export interface PackageStatusResponse {
  external_order_id: string;
  status: PackageStatus;
  tracking_number: string;
}

// Frontend display model (transformed from backend)
export interface Package {
  id: string;
  trackingNumber: string;
  externalOrderId: string;
  status: PackageStatus;
  recipient: RecipientDetails;
  createdAt?: string;
  updatedAt?: string;
}

// POST /orders/ingest payload
export interface CreateOrderPayload {
  external_order_id: string;
  merchant_id: string;
  recipient_details: RecipientDetails;
}

// POST /orders/ingest response
export interface CreateOrderResponse {
  message: string;
  tracking_number: string;
  status: PackageStatus;
}

// POST /webhooks/payment payload
export interface PaymentWebhookPayload {
  external_order_id: string;
  payment_transaction_id: string;
  payment_status: 'success' | 'failed' | 'pending';
}

// POST /webhooks/payment response
export interface PaymentWebhookResponse {
  message: string;
  order?: {
    external_order_id: string;
    status: PackageStatus;
    tracking_number: string;
  };
}

// POST /dispatch payload
export interface DispatchPayload {
  tracking_number: string;
  driver_id: string;
}

// POST /dispatch response
export interface DispatchResponse {
  message: string;
  new_status: PackageStatus;
}

// Add this to your existing types
export interface NotifyPayload {
  external_order_id: string;
  status: PackageStatus;
}

export interface NotifyResponse {
  success: boolean;
  new_status: PackageStatus;
}

// Error response from backend
export interface ApiError {
  error: string;
  reason?: string;
}
