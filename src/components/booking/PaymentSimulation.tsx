'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import type { Bus, Seat } from '@/types/booking';

interface PaymentSimulationProps {
  bus: Bus;
  seats: Seat[];
  onConfirm: () => void;
}

export default function PaymentSimulation({ bus, seats, onConfirm }: PaymentSimulationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
  const seatNumbers = seats.map(s => s.number).join(', ');

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Wait a moment to show success, then proceed
      setTimeout(() => {
        onConfirm();
      }, 1500);
    }, 2000); // Simulate 2 seconds processing time
  };

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Booking Summary</CardTitle>
          <CardDescription>Please review your booking details before confirming.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bus:</span>
            <span className="font-medium">{bus.name} ({bus.type})</span>
          </div>
           <div className="flex justify-between">
            <span className="text-muted-foreground">Departure:</span>
            <span className="font-medium">{bus.departureTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Seats:</span>
            <span className="font-medium">{seatNumbers} ({seats.length} seat{seats.length > 1 ? 's' : ''})</span>
          </div>
          <div className="flex justify-between border-t pt-3 mt-3">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-lg font-bold text-primary">LKR {totalPrice.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

       <div className="text-center">
         {isProcessing ? (
            <Button disabled className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </Button>
         ) : isSuccess ? (
            <Button disabled className="w-full bg-green-600 text-white">
              <CheckCircle className="mr-2 h-4 w-4" />
              Payment Successful! Generating Ticket...
            </Button>
         ) : (
            <Button onClick={handleConfirmPayment} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Confirm Payment (Simulated)
            </Button>
         )}
       </div>
       <p className="text-xs text-muted-foreground text-center">
         Note: This is a simulated payment. No real transaction will occur.
       </p>
    </div>
  );
}
