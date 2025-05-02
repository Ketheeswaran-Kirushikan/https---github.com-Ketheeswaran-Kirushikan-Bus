'use client';

import React, { useState, useEffect } from 'react';
import RouteSelection from './RouteSelection';
import BusSelection from './BusSelection';
import SeatSelection from './SeatSelection';
import PaymentSimulation from './PaymentSimulation';
import TicketDisplay from './TicketDisplay';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Route, Bus, Seat, Ticket } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

// Mock data (replace with API calls later)
const locations = ["Colombo", "Kandy", "Galle", "Jaffna", "Anuradhapura", "Trincomalee", "Nuwara Eliya", "Matara"];
const availableBuses: Bus[] = [
  { id: 'B001', name: 'Lanka Express', type: 'Luxury', departureTime: '08:00 AM', arrivalTime: '11:00 AM', price: 1500, totalSeats: 40 },
  { id: 'B002', name: 'Intercity AC', type: 'Semi-Luxury', departureTime: '09:30 AM', arrivalTime: '01:00 PM', price: 1200, totalSeats: 50 },
  { id: 'B003', name: 'Highway Rider', type: 'Normal', departureTime: '10:00 AM', arrivalTime: '02:30 PM', price: 800, totalSeats: 55 },
];

type BookingStep = 'route' | 'bus' | 'seat' | 'payment' | 'ticket';

export default function BookingPage() {
  const { user } = useAppContext();
  const [step, setStep] = useState<BookingStep>('route');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [unavailableSeats, setUnavailableSeats] = useState<number[]>([]); // Mock unavailable seats

  useEffect(() => {
    // Simulate fetching unavailable seats when a bus is selected
    if (selectedBus) {
      // In a real app, fetch this from the backend based on selectedBus.id and date
      const mockUnavailable = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, () =>
        Math.floor(Math.random() * selectedBus.totalSeats) + 1
      );
      setUnavailableSeats([...new Set(mockUnavailable)]); // Ensure unique seat numbers
    } else {
      setUnavailableSeats([]);
    }
     setSelectedSeats([]); // Reset seats when bus changes
  }, [selectedBus]);

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setStep('bus');
  };

  const handleBusSelect = (bus: Bus) => {
    setSelectedBus(bus);
    setStep('seat');
  };

  const handleSeatSelect = (seats: Seat[]) => {
    setSelectedSeats(seats);
    setStep('payment');
  };

  const handlePaymentConfirm = () => {
    if (!selectedRoute || !selectedBus || selectedSeats.length === 0 || !user) {
      // Should not happen if flow is correct, but good to check
      console.error("Missing booking details");
      return;
    }
    const newTicket: Ticket = {
      id: `TKT-${Date.now()}`, // Simple unique ID
      userName: user.userName,
      nic: user.nic,
      startPoint: selectedRoute.start,
      endPoint: selectedRoute.end,
      busName: selectedBus.name,
      busType: selectedBus.type,
      departureTime: selectedBus.departureTime,
      arrivalTime: selectedBus.arrivalTime,
      seatNumbers: selectedSeats.map(s => s.number),
      totalPrice: selectedBus.price * selectedSeats.length,
      bookingDate: new Date(),
    };
    setTicket(newTicket);
    setStep('ticket');
  };

  const handleBack = () => {
    switch (step) {
      case 'bus':
        setSelectedRoute(null);
        setStep('route');
        break;
      case 'seat':
        setSelectedBus(null);
        setSelectedSeats([]);
        setStep('bus');
        break;
      case 'payment':
        setSelectedSeats([]);
        setStep('seat');
        break;
       case 'ticket': // Allow going back from ticket to modify maybe? Or just restart?
        // For now, let's go back to payment, though maybe restarting is better.
        setTicket(null);
        setStep('payment');
        // Or restart completely:
        // handleRestart();
        break;
      default:
        break;
    }
  };

  const handleRestart = () => {
    setStep('route');
    setSelectedRoute(null);
    setSelectedBus(null);
    setSelectedSeats([]);
    setTicket(null);
    setUnavailableSeats([]);
  }

  const progressValue = {
    route: 0,
    bus: 25,
    seat: 50,
    payment: 75,
    ticket: 100,
  }[step];

  const stepTitles: Record<BookingStep, string> = {
    route: 'Select Your Route',
    bus: 'Choose Your Bus',
    seat: 'Select Your Seat(s)',
    payment: 'Confirm & Pay',
    ticket: 'Your Ticket',
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          {step !== 'route' && (
             <Button variant="ghost" size="icon" onClick={handleBack} className="text-primary hover:bg-accent/20">
               <ArrowLeft className="h-5 w-5" />
             </Button>
          )}
          <CardTitle className="text-2xl font-bold text-primary flex-grow text-center">{stepTitles[step]}</CardTitle>
           {/* Add a spacer if back button exists to keep title centered */}
          {step !== 'route' && <div className="w-9 h-9"></div>}
        </div>
        {step !== 'ticket' && <Progress value={progressValue} className="w-full h-2" />}
      </CardHeader>
      <CardContent>
        {step === 'route' && <RouteSelection locations={locations} onRouteSelect={handleRouteSelect} />}
        {step === 'bus' && selectedRoute && <BusSelection route={selectedRoute} buses={availableBuses} onBusSelect={handleBusSelect} />}
        {step === 'seat' && selectedBus && <SeatSelection bus={selectedBus} selectedSeats={selectedSeats} unavailableSeats={unavailableSeats} onSeatSelect={handleSeatSelect} />}
        {step === 'payment' && selectedBus && selectedSeats.length > 0 && (
          <PaymentSimulation bus={selectedBus} seats={selectedSeats} onConfirm={handlePaymentConfirm} />
        )}
        {step === 'ticket' && ticket && <TicketDisplay ticket={ticket} onRestart={handleRestart} />}
      </CardContent>
    </Card>
  );
}
