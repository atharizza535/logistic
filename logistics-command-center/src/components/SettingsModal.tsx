import { useState, useEffect } from 'react';
import { Settings, Server, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { toast } from 'sonner';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [backendUrl, setBackendUrl] = useState(api.getBaseUrl());
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (open) {
      setBackendUrl(api.getBaseUrl());
    }
  }, [open]);

  const handleSave = () => {
    api.setBaseUrl(backendUrl);
    toast.success('Backend URL updated successfully');
    onOpenChange(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    const originalUrl = api.getBaseUrl();
    try {
      api.setBaseUrl(backendUrl);
      
      // Test with a dummy order ID - 404 means server is reachable
      await api.getPackageStatus('TEST-CONNECTION');
      toast.success('Connection successful!');
    } catch (error: any) {
      // 404 is expected for test ID, means server is reachable
      if (error?.response?.status === 404) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed. Please check the URL.');
        api.setBaseUrl(originalUrl);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your backend connection settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="backend-url" className="text-sm font-medium text-foreground">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                Backend URL
              </div>
            </Label>
            <Input
              id="backend-url"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://localhost:6769/api/v2"
              className="font-mono text-sm bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              The base URL for the logistics API. Change this if using a different IP or port.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
              className="flex-1"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
