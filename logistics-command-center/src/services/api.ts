// Controller Layer - API Service matching actual backend (server.js)
import axios, { AxiosInstance, AxiosError } from 'axios';
import type { 
  CreateOrderPayload, 
  CreateOrderResponse,
  PaymentWebhookPayload,
  PaymentWebhookResponse,
  DispatchPayload,
  DispatchResponse,
  PackageStatusResponse,
  NotifyPayload,
  NotifyResponse,
  PackageStatus,
  ApiError,
  Package
} from '@/types';

const DEFAULT_BASE_URL = 'http://localhost:6769';

class ApiService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = localStorage.getItem('backendUrl') || DEFAULT_BASE_URL;
    this.client = this.createClient();
  }

  private createClient(): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
    localStorage.setItem('backendUrl', url);
    this.client = this.createClient();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // POST /orders/ingest (Store -> Us)
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const response = await this.client.post<CreateOrderResponse>('/orders/ingest', payload);
    return response.data;
  }

  // POST /webhooks/payment (Payment Gateway -> Us)
  async simulatePayment(externalOrderId: string): Promise<PaymentWebhookResponse> {
    const payload: PaymentWebhookPayload = {
      external_order_id: externalOrderId,
      payment_transaction_id: `PAY-${Date.now()}`,
      payment_status: 'success',
    };
    const response = await this.client.post<PaymentWebhookResponse>('/webhooks/payment', payload);
    return response.data;
  }

  // GET /partners/status/:id (Store -> Us)
  async getPackageStatus(externalOrderId: string): Promise<PackageStatusResponse> {
    const response = await this.client.get<PackageStatusResponse>(`/partners/status/${externalOrderId}`);
    return response.data;
  }

  // POST /dispatch (Driver App -> Us)
  async dispatchPackage(trackingNumber: string, driverId: string = 'DRIVER-001'): Promise<DispatchResponse> {
    const payload: DispatchPayload = {
      tracking_number: trackingNumber,
      driver_id: driverId,
    };
    
    try {
      const response = await this.client.post<DispatchResponse>('/dispatch', payload);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.status === 403) {
        const apiError = axiosError.response.data;
        throw new Error(apiError.reason || 'Dispatch denied: Package must be payment_verified');
      }
      if (axiosError.response?.status === 404) {
        throw new Error('Package not found');
      }
      throw error;
    }
  }

  // POST /notify (Internal System -> Store)
  async notifyStore(externalOrderId: string, status: string): Promise<NotifyResponse> {
    const payload: NotifyPayload = {
      external_order_id: externalOrderId,
      status: status as PackageStatus,
    };
    const response = await this.client.post<NotifyResponse>('/notify', payload);
    return response.data;
  }

  async getAllOrders(): Promise<Package[]> {
    const response = await this.client.get<any[]>('/orders');
    
    // Transform backend data to frontend model if necessary
    // (Assuming backend returns snake_case, mapping to camelCase for frontend)
    return response.data.map(pkg => ({
      id: pkg.id,
      trackingNumber: pkg.tracking_number,
      externalOrderId: pkg.external_order_id,
      status: pkg.status,
      recipient: pkg.recipient_details || { name: 'Unknown', address: 'No address' },
      createdAt: pkg.created_at
    }));
  }
}

export const api = new ApiService();
export default api;
