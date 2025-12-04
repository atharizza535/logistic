import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, CheckCircle2, Clock, Truck, MapPin } from 'lucide-react';
import api from '@/services/api';
import type { PackageStatus, PackageStatusResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TimelineStep {
  status: PackageStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const timelineSteps: TimelineStep[] = [
  { status: 'awaiting_payment', label: 'Awaiting Payment', icon: Clock },
  { status: 'payment_verified', label: 'Payment Verified', icon: CheckCircle2 },
  { status: 'in_transit', label: 'In Transit', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: MapPin },
];

const statusOrder: PackageStatus[] = [
  'awaiting_payment', 
  'payment_verified',
  'in_transit',
  'delivered',
];

export default function PartnerTracker() {
  const [searchId, setSearchId] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const { data: packageData, isLoading, error, isError } = useQuery({
    queryKey: ['package', submittedId],
    queryFn: () => api.getPackageStatus(submittedId!),
    enabled: !!submittedId,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setSubmittedId(searchId.trim());
    }
  };

  const getStepStatus = (stepStatus: PackageStatus, currentStatus: PackageStatus) => {
    const stepIndex = statusOrder.indexOf(stepStatus);
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Partner Tracker
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your order using your External Order ID
        </p>
      </div>

      {/* Search Form */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              placeholder="Enter External Order ID (e.g., ORD-12345)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 font-mono bg-background border-border"
            />
            <Button 
              type="submit" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {packageData && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5 text-primary" />
              Order Status
            </CardTitle>
            <CardDescription>
              <span className="font-mono text-primary">{packageData.tracking_number}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Package Info */}
            <div className="mb-6 p-4 rounded-lg bg-background border border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">External Order ID</p>
                  <p className="text-foreground font-mono font-medium">{packageData.external_order_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Status</p>
                  <p className="text-foreground font-medium capitalize">
                    {packageData.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {timelineSteps.map((step, index) => {
                const stepStatus = getStepStatus(step.status, packageData.status);
                const isLast = index === timelineSteps.length - 1;
                const StepIcon = step.icon;

                return (
                  <div key={step.status} className="flex gap-4">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                          stepStatus === 'completed' && 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
                          stepStatus === 'current' && 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse',
                          stepStatus === 'pending' && 'bg-muted border-border text-muted-foreground'
                        )}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            'w-0.5 h-12 transition-colors',
                            stepStatus === 'completed' ? 'bg-emerald-500/50' : 'bg-border'
                          )}
                        />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className={cn('pb-12', isLast && 'pb-0')}>
                      <p
                        className={cn(
                          'font-medium',
                          stepStatus === 'completed' && 'text-emerald-400',
                          stepStatus === 'current' && 'text-blue-400',
                          stepStatus === 'pending' && 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </p>
                      {stepStatus === 'current' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Current Status
                        </p>
                      )}
                      {stepStatus === 'completed' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ✓ Completed
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error / Not Found */}
      {submittedId && !isLoading && isError && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-medium">Order not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please check your External Order ID and try again
            </p>
          </CardContent>
        </Card>
      )}

      {/* API Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">API Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="block p-3 rounded-lg bg-background border border-border font-mono text-sm text-foreground">
            GET {api.getBaseUrl()}/partners/status/{'{external_order_id}'}
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
