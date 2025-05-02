'use client';

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import type { Route } from '@/types/booking';

interface RouteSelectionProps {
  locations: string[];
  onRouteSelect: (route: Route) => void;
}

export default function RouteSelection({ locations, onRouteSelect }: RouteSelectionProps) {
  const [startPoint, setStartPoint] = useState<string>('');
  const [endPoint, setEndPoint] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSelect = () => {
    if (!startPoint || !endPoint) {
      setError('Please select both start and end points.');
      return;
    }
    if (startPoint === endPoint) {
      setError('Start and end points cannot be the same.');
      return;
    }
    setError('');
    onRouteSelect({ start: startPoint, end: endPoint });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <Label htmlFor="start-point">From</Label>
          <Select value={startPoint} onValueChange={setStartPoint}>
            <SelectTrigger id="start-point" className="w-full">
              <SelectValue placeholder="Select starting point" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="end-point">To</Label>
           <Select value={endPoint} onValueChange={setEndPoint}>
            <SelectTrigger id="end-point" className="w-full">
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location} disabled={location === startPoint}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
       {error && <p className="text-destructive text-sm text-center">{error}</p>}
      <Button onClick={handleSelect} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        Find Buses <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
