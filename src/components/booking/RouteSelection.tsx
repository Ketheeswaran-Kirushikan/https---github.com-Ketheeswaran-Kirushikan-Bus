'use client';

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import type { Route } from '@/types/schema';
import { toast } from 'react-toastify';

interface RouteSelectionProps {
  locations: string[];
  onRouteSelect: (route: Route) => void;
}

export default function RouteSelection({ locations, onRouteSelect }: RouteSelectionProps) {
  const [startPoint, setStartPoint] = useState<string>('');
  const [endPoint, setEndPoint] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const handleSelect = () => {
    // Validate required fields
    if (!startPoint || !endPoint || !date || !startTime || !endTime) {
      toast.error('Please select start point, end point, date, and time range.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Validate start and end points
    if (startPoint === endPoint) {
      toast.error('Start and end points cannot be the same.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Validate time range
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    if (end <= start) {
      toast.error('End time must be after start time.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Validate date (must be today or in the future)
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    if (selectedDate < today) {
      toast.error('Travel date must be today or in the future.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    onRouteSelect({ start: startPoint, end: endPoint, date, startTime, endTime });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="travel-date">Travel Date</Label>
          <Input
            id="travel-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Restrict to today or future
          />
        </div>
        <div>
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={handleSelect} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        Find Buses <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}