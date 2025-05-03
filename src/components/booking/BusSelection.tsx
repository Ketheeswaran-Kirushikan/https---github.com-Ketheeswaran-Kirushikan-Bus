'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Sofa, Tag, ArrowRight, Route as RouteIcon } from 'lucide-react';
import type { Route, Bus } from '@/types/schema';

interface BusSelectionProps {
  route: Route;
  buses: Bus[];
  onBusSelect: (bus: Bus) => void;
}

export default function BusSelection({ route, buses, onBusSelect }: BusSelectionProps) {
  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4 p-2 rounded-md bg-secondary">
        <p className="text-lg font-medium text-secondary-foreground">
          Showing buses for: <RouteIcon className="inline-block h-5 w-5 mx-1" /> <span className="font-semibold">{route.start}</span> to <span className="font-semibold">{route.end}</span>
        </p>
      </div>

      {buses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {buses.map((bus) => (
            <Card key={bus.id} className="shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-lg text-primary">{bus.name}</CardTitle>
                <CardDescription>{bus.type}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{bus.departureTime} - {bus.arrivalTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sofa className="h-4 w-4 text-muted-foreground" />
                  <span>{bus.totalSeats} Seats</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{formatPrice(bus.price)} per seat</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => onBusSelect(bus)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Select Seats <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No buses available for this route at the moment.</p>
      )}
    </div>
  );
}