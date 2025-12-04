import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function OperationsSimulator() {
  // --- STATE MANAGEMENT ---
  const [payData, setPayData] = useState({ orderId: '', txnId: 'TXN-999', status: 'success' });
  const [dispatchData, setDispatchData] = useState({ trackingNumber: '', driverId: 'DRIVER-01' });
  const [notifyData, setNotifyData] = useState({ orderId: '', status: 'delivered' });

  // --- MUTATIONS ---
  const payMutation = useMutation({
    mutationFn: () => api.simulatePayment(payData.orderId), // You might need to update api.ts to accept txnId if you want it dynamic, but hardcoded is fine for now
    onSuccess: () => toast.success('Payment Webhook Sent'),
    onError: (e) => toast.error(e.message)
  });

  const dispatchMutation = useMutation({
    mutationFn: () => api.dispatchPackage(dispatchData.trackingNumber, dispatchData.driverId),
    onSuccess: () => toast.success('Driver Dispatched'),
    onError: (e) => toast.error(e.message)
  });

  const notifyMutation = useMutation({
    mutationFn: () => api.notifyStore(notifyData.orderId, notifyData.status),
    onSuccess: () => toast.success('Store Notified'),
    onError: (e) => toast.error(e.message)
  });

  // --- JSON PREVIEWS ---
  const payJson = {
    external_order_id: payData.orderId || "ORD-12345",
    payment_transaction_id: payData.txnId,
    payment_status: payData.status
  };

  const dispatchJson = {
    tracking_number: dispatchData.trackingNumber || "TRK-ABCD",
    driver_id: dispatchData.driverId
  };

  const notifyJson = {
    external_order_id: notifyData.orderId || "ORD-12345",
    status: notifyData.status
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-primary" />
          Operations Simulator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manually trigger backend logistics flows and visualize the API payloads.
        </p>
      </div>

      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
          <TabsTrigger value="payment" className="data-[state=active]:bg-background data-[state=active]:text-amber-400">Payment</TabsTrigger>
          <TabsTrigger value="dispatch" className="data-[state=active]:bg-background data-[state=active]:text-blue-400">Dispatch</TabsTrigger>
          <TabsTrigger value="delivery" className="data-[state=active]:bg-background data-[state=active]:text-emerald-400">Delivery</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PAYMENT --- */}
        <TabsContent value="payment" className="space-y-4 mt-4">
          <Card className="glass-card border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <CreditCard className="h-5 w-5" /> Simulate Payment
              </CardTitle>
              <CardDescription>Simulates the Payment Gateway Webhook</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>External Order ID</Label>
                <Input 
                  placeholder="e.g. ORD-9000" 
                  value={payData.orderId}
                  onChange={e => setPayData({...payData, orderId: e.target.value})}
                  className="font-mono"
                />
              </div>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-500 text-white"
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending}
              >
                {payMutation.isPending ? "Processing..." : <><Send className="mr-2 h-4 w-4"/> Send Webhook</>}
              </Button>
            </CardContent>
          </Card>

          {/* API Visualizer */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">API Endpoint</CardTitle></CardHeader>
            <CardContent>
              <code className="block p-3 rounded-lg bg-background border border-border font-mono text-sm text-amber-400 mb-2">
                POST {api.getBaseUrl()}/webhooks/payment
              </code>
              <pre className="p-3 rounded-lg bg-background border border-border font-mono text-xs text-muted-foreground overflow-x-auto">
                {JSON.stringify(payJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: DISPATCH --- */}
        <TabsContent value="dispatch" className="space-y-4 mt-4">
          <Card className="glass-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Truck className="h-5 w-5" /> Dispatch Driver
              </CardTitle>
              <CardDescription>Assigns a driver to a verified package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tracking Number</Label>
                <Input 
                  placeholder="e.g. TRK-ABC1234" 
                  value={dispatchData.trackingNumber}
                  onChange={e => setDispatchData({...dispatchData, trackingNumber: e.target.value})}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Driver ID</Label>
                <Input 
                  value={dispatchData.driverId}
                  onChange={e => setDispatchData({...dispatchData, driverId: e.target.value})}
                  className="font-mono"
                />
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => dispatchMutation.mutate()}
                disabled={dispatchMutation.isPending}
              >
                {dispatchMutation.isPending ? "Processing..." : <><Send className="mr-2 h-4 w-4"/> Dispatch Driver</>}
              </Button>
            </CardContent>
          </Card>

          {/* API Visualizer */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">API Endpoint</CardTitle></CardHeader>
            <CardContent>
              <code className="block p-3 rounded-lg bg-background border border-border font-mono text-sm text-blue-400 mb-2">
                POST {api.getBaseUrl()}/dispatch
              </code>
              <pre className="p-3 rounded-lg bg-background border border-border font-mono text-xs text-muted-foreground overflow-x-auto">
                {JSON.stringify(dispatchJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 3: DELIVERY --- */}
        <TabsContent value="delivery" className="space-y-4 mt-4">
          <Card className="glass-card border-emerald-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <MapPin className="h-5 w-5" /> Confirm Delivery
              </CardTitle>
              <CardDescription>Triggers the final callback to the store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>External Order ID</Label>
                <Input 
                  placeholder="e.g. ORD-9000" 
                  value={notifyData.orderId}
                  onChange={e => setNotifyData({...notifyData, orderId: e.target.value})}
                  className="font-mono"
                />
              </div>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => notifyMutation.mutate()}
                disabled={notifyMutation.isPending}
              >
                {notifyMutation.isPending ? "Processing..." : <><CheckCircle2 className="mr-2 h-4 w-4"/> Confirm Delivery</>}
              </Button>
            </CardContent>
          </Card>

          {/* API Visualizer */}
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">API Endpoint</CardTitle></CardHeader>
            <CardContent>
              <code className="block p-3 rounded-lg bg-background border border-border font-mono text-sm text-emerald-400 mb-2">
                POST {api.getBaseUrl()}/notify
              </code>
              <pre className="p-3 rounded-lg bg-background border border-border font-mono text-xs text-muted-foreground overflow-x-auto">
                {JSON.stringify(notifyJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}