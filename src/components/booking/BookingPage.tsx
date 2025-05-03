'use client';

import React, { useState, useEffect } from 'react';
import RouteSelection from './RouteSelection';
import BusSelection from './BusSelection';
import SeatSelection from './SeatSelection';
import PaymentSimulation from './PaymentSimulation';
import TicketDisplay from './TicketDisplay';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Route, Bus, Seat, Ticket } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'react-toastify';

const locations = ["Colombo", "Kandy", "Galle", "Jaffna", "Anuradhapura", "Trincomalee", "Nuwara Eliya", "Matara"];

type BookingStep = 'route' | 'bus' | 'seat' | 'payment' | 'ticket';

export default function BookingPage() {
  const { user } = useAppContext();
  const [step, setStep] = useState<BookingStep>('route');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [unavailableSeats, setUnavailableSeats] = useState<number[]>([]);
  const [allBuses, setAllBuses] = useState<Bus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://172.20.10.2:9002/api/buses');
      if (!response.ok) {
        throw new Error('Failed to fetch buses');
      }
      const data: Bus[] = await response.json();
      setAllBuses(data);
    } catch (error: any) {
      console.error('Error fetching buses:', error);
      setError(error.message || 'Failed to load buses');
      toast.error(error.message || 'Failed to load buses', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available buses when the component mounts
  useEffect(() => {
    fetchBuses();
  }, []);

  // Filter buses based on selected route, date, and time range
  useEffect(() => {
    if (!selectedRoute) {
      setFilteredBuses([]);
      return;
    }

    const { start, end, date, startTime, endTime } = selectedRoute;

    const matchingBuses = allBuses.filter((bus) => {
      // Match start and end points
      if (bus.startPoint !== start || bus.endPoint !== end) {
        return false;
      }

      // Bus departureTime is time-only (e.g., "07:30:00Z")
      const busTime = bus.departureTime.split(':').slice(0, 2).join(':'); // e.g., "07:30"

      // Match the time range (compare as strings in HH:mm format)
      return busTime >= startTime && busTime <= endTime;
    });

    setFilteredBuses(matchingBuses);
    if (matchingBuses.length === 0) {
      toast.info('No buses available for this route and time range. Please select a different route or time.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  }, [selectedRoute, allBuses]);

  // Set unavailable seats based on the selected bus's seat data
  useEffect(() => {
    if (!selectedBus || !selectedBus.seats) {
      setUnavailableSeats([]);
      setSelectedSeats([]);
      return;
    }

    // Extract unavailable seats from the bus's seat data
    const bookedSeats = selectedBus.seats
      .filter(seat => !seat.isAvailable)
      .map(seat => seat.number);
    setUnavailableSeats(bookedSeats);
    setSelectedSeats([]);
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
    if (seats.length === 0) {
      toast.error('Please select at least one seat before proceeding.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setSelectedSeats(seats);
    setStep('payment');
  };

  const handlePaymentConfirm = async () => {
    if (!user || !user.id || !selectedRoute || !selectedBus || selectedSeats.length === 0) {
      const missingFields = [];
      if (!user || !user.id) missingFields.push('user (or user.id)');
      if (!selectedRoute) missingFields.push('route');
      if (!selectedBus) missingFields.push('bus');
      if (selectedSeats.length === 0) missingFields.push('seats');
      toast.error(`Missing required fields: ${missingFields.join(', ')}`, {
        position: 'top-right',
        autoClose: 3000,
      });
      if (!user || !user.id) {
        // Redirect to login if user is missing or invalid
        window.location.href = '/auth';
      }
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: user.id,
        busId: selectedBus.id,
        route: selectedRoute,
        seatCount: selectedSeats.length,
      };
      console.log('Sending booking payload:', payload);

      const response = await fetch('http://172.20.10.2:9002/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Booking response status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setTicket(data);
      toast.success('Booking Confirmed! Your ticket has been generated.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setStep('ticket');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to confirm booking', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
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
      case 'ticket':
        setTicket(null);
        setStep('payment');
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
  };

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

  if (!user) {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">
            Please Log In
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">You need to be logged in to book a ticket.</p>
          <Button onClick={() => window.location.href = '/auth'} className="bg-primary text-primary-foreground">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          {step !== 'route' && <div className="w-9 h-9"></div>}
        </div>
        {step !== 'ticket' && <Progress value={progressValue} className="w-full h-2" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchBuses} className="bg-primary text-primary-foreground">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : (
          <>
            {step === 'route' && <RouteSelection locations={locations} onRouteSelect={handleRouteSelect} />}
            {step === 'bus' && selectedRoute && <BusSelection route={selectedRoute} buses={filteredBuses} onBusSelect={handleBusSelect} />}
            {step === 'seat' && selectedBus && (
              <SeatSelection
                bus={selectedBus}
                selectedSeats={selectedSeats}
                unavailableSeats={unavailableSeats}
                onSeatSelect={handleSeatSelect}
              />
            )}
            {step === 'payment' && selectedBus && selectedSeats.length > 0 && (
              <PaymentSimulation bus={selectedBus} seats={selectedSeats} onConfirm={handlePaymentConfirm} />
            )}
            {step === 'ticket' && ticket && <TicketDisplay ticket={ticket} onRestart={handleRestart} />}
          </>
        )}
      </CardContent>
    </Card>
  );
}