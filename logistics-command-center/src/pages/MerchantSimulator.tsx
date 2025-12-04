import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ShoppingCart, Package, Send, CheckCircle2, Copy } from 'lucide-react';
import api from '@/services/api';
import type { CreateOrderPayload, RecipientDetails } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface FormState {
  externalOrderId: string;
  merchantId: string;
  recipientName: string;
  address: string;
}

export default function MerchantSimulator() {
  const [formData, setFormData] = useState<FormState>({
    externalOrderId: '',
    merchantId: 'MERCHANT-001',
    recipientName: '',
    address: '',
  });
  const [lastTrackingNumber, setLastTrackingNumber] = useState<string | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => api.createOrder(payload),
    onSuccess: (data) => {
      setLastTrackingNumber(data.tracking_number);
      toast.success(`Order created! Tracking: ${data.tracking_number}`);
      setFormData({ externalOrderId: '', merchantId: 'MERCHANT-001', recipientName: '', address: '' });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.externalOrderId || !formData.recipientName || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipient_details: RecipientDetails = {
      name: formData.recipientName,
      address: formData.address,
    };

    const payload: CreateOrderPayload = {
      external_order_id: formData.externalOrderId,
      merchant_id: formData.merchantId,
      recipient_details,
    };

    createOrderMutation.mutate(payload);
  };

  const copyTrackingNumber = () => {
    if (lastTrackingNumber) {
      navigator.clipboard.writeText(lastTrackingNumber);
      toast.success('Tracking number copied to clipboard');
    }
  };

  const previewPayload = {
    external_order_id: formData.externalOrderId || 'ORD-12345',
    merchant_id: formData.merchantId || 'MERCHANT-001',
    recipient_details: {
      name: formData.recipientName || 'John Doe',
      address: formData.address || '123 Main St',
    },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          Merchant Simulator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Simulate an e-commerce order ingestion into the logistics system
        </p>
      </div>

      {/* Success Card */}
      {lastTrackingNumber && (
        <Card className="glass-card border-emerald-500/30 glow-emerald">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Generated Tracking Number</p>
                  <p className="text-lg font-mono font-semibold text-emerald-400">
                    {lastTrackingNumber}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTrackingNumber}
                className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Form */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Package className="h-5 w-5 text-primary" />
            Create New Order
          </CardTitle>
          <CardDescription>
            This simulates the POST /orders/ingest endpoint call from an e-commerce platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId" className="text-foreground">
                External Order ID
              </Label>
              <Input
                id="orderId"
                placeholder="e.g., ORD-12345"
                value={formData.externalOrderId}
                onChange={(e) =>
                  setFormData({ ...formData, externalOrderId: e.target.value })
                }
                className="font-mono bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">
                Your e-commerce platform's order reference number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchantId" className="text-foreground">
                Merchant ID
              </Label>
              <Input
                id="merchantId"
                placeholder="e.g., MERCHANT-001"
                value={formData.merchantId}
                onChange={(e) =>
                  setFormData({ ...formData, merchantId: e.target.value })
                }
                className="font-mono bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientName" className="text-foreground">
                Recipient Name
              </Label>
              <Input
                id="recipientName"
                placeholder="e.g., John Doe"
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData({ ...formData, recipientName: e.target.value })
                }
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground">
                Delivery Address
              </Label>
              <Textarea
                id="address"
                placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="bg-background border-border resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Order
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* API Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">API Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="block p-3 rounded-lg bg-background border border-border font-mono text-sm text-foreground">
            POST {api.getBaseUrl()}/orders/ingest
          </code>
          <pre className="mt-3 p-3 rounded-lg bg-background border border-border font-mono text-xs text-muted-foreground overflow-x-auto">
{JSON.stringify(previewPayload, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
