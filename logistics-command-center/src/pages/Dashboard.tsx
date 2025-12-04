import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  CreditCard, 
  Truck, 
  MapPin,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '@/services/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const statusColors: Record<string, string> = {
  awaiting_payment: '#f59e0b',
  payment_verified: '#10b981',
  in_transit: '#3b82f6',
  delivered: '#10b981',
};

export default function Dashboard() {
  const queryClient = useQueryClient();

  // 1. FETCH REAL DATA from Backend
  const { data: packages = [], isLoading, isError } = useQuery({
    queryKey: ['packages'],
    queryFn: () => api.getAllOrders(),
    refetchInterval: 5000, // Poll every 5s for new orders
  });

  // 2. Mutations that refresh data on success
  const simulatePaymentMutation = useMutation({
    mutationFn: (externalOrderId: string) => api.simulatePayment(externalOrderId),
    onSuccess: () => {
      toast.success('Payment verified');
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: Error) => toast.error(`Payment failed: ${error.message}`),
  });

  const dispatchMutation = useMutation({
    mutationFn: (trackingNumber: string) => api.dispatchPackage(trackingNumber),
    onSuccess: () => {
      toast.success('Package dispatched');
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: Error) => toast.error(error.message), // Shows "dispatch_denied" message
  });

  const deliverMutation = useMutation({
    mutationFn: (externalOrderId: string) => api.notifyStore(externalOrderId, 'delivered'),
    onSuccess: () => {
      toast.success('Delivered & Notified');
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: Error) => toast.error(`Delivery failed: ${error.message}`),
  });

  // Calculate stats
  const statusSummary = packages.reduce((acc: any[], pkg: any) => {
    const existing = acc.find((s) => s.status === pkg.status);
    if (existing) existing.count++;
    else acc.push({ status: pkg.status, count: 1 });
    return acc;
  }, []);

  const chartData = statusSummary.map((item: any) => ({
    name: item.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: item.count,
    status: item.status,
  }));

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading live data...</div>;
  if (isError) return <div className="p-8 text-center text-red-400">Connection Error. Is the backend running?</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Operations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time Database View ({packages.length} orders)
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['packages'] })}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="glass-card border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-foreground font-medium">System Connected</p>
              <p className="text-muted-foreground mt-1">
                Displaying live data from Supabase via <code>GET /orders</code>. 
                Use <b>Merchant Simulator</b> to create new orders.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats & Chart Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Volume by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={100} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: 'hsl(222 47% 8%)', border: '1px solid hsl(217 33% 17%)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry: any) => (
                        <Cell key={entry.status} fill={statusColors[entry.status]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No active orders.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20"><AlertCircle className="h-5 w-5 text-amber-400" /></div>
              <div>
                <p className="text-2xl font-bold">{packages.filter((p: any) => p.status === 'awaiting_payment').length}</p>
                <p className="text-xs text-muted-foreground">Awaiting Payment</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20"><Truck className="h-5 w-5 text-blue-400" /></div>
              <div>
                <p className="text-2xl font-bold">{packages.filter((p: any) => p.status === 'in_transit').length}</p>
                <p className="text-xs text-muted-foreground">In Transit</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20"><CheckCircle2 className="h-5 w-5 text-emerald-400" /></div>
              <div>
                <p className="text-2xl font-bold">{packages.filter((p: any) => p.status === 'delivered').length}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Packages Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Package className="h-5 w-5 text-primary" />
            Live Database Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Tracking #</TableHead>
                <TableHead className="text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Recipient</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No orders found in database.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg: any) => (
                  <TableRow key={pkg.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-mono text-sm text-foreground">{pkg.trackingNumber}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{pkg.externalOrderId}</TableCell>
                    <TableCell><StatusBadge status={pkg.status} /></TableCell>
                    <TableCell>
                      <div>
                        <p className="text-foreground text-sm">{pkg.recipient.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{pkg.recipient.address}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {pkg.status === 'awaiting_payment' && (
                          <Button size="sm" variant="outline" 
                            className="text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                            onClick={() => simulatePaymentMutation.mutate(pkg.externalOrderId)}
                            disabled={simulatePaymentMutation.isPending}
                          >
                            <CreditCard className="h-4 w-4 mr-1" /> Pay
                          </Button>
                        )}
                        {pkg.status === 'payment_verified' && (
                          <Button size="sm" variant="outline" 
                            className="text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                            onClick={() => dispatchMutation.mutate(pkg.trackingNumber)}
                            disabled={dispatchMutation.isPending}
                          >
                            <Truck className="h-4 w-4 mr-1" /> Dispatch
                          </Button>
                        )}
                        {pkg.status === 'in_transit' && (
                          <Button size="sm" variant="outline" 
                            className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            onClick={() => deliverMutation.mutate(pkg.externalOrderId)}
                            disabled={deliverMutation.isPending}
                          >
                            <MapPin className="h-4 w-4 mr-1" /> Deliver
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(pkg.trackingNumber);
                                toast.success('Tracking # copied');
                            }}>
                              Copy Tracking #
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}