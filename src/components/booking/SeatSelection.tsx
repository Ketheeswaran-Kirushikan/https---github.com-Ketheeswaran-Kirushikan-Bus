'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Bus, Seat } from '@/types/booking';
import { ArrowRight, Sofa } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SeatSelectionProps {
  bus: Bus;
  selectedSeats: Seat[];
  unavailableSeats: number[]; // Array of seat numbers that are already booked
  onSeatSelect: (seats: Seat[]) => void;
}

export default function SeatSelection({ bus, selectedSeats, unavailableSeats, onSeatSelect }: SeatSelectionProps) {
  const { toast } = useToast();
  const [currentSelection, setCurrentSelection] = useState<Seat[]>(selectedSeats);

  const handleSeatClick = (seatNumber: number) => {
    if (unavailableSeats.includes(seatNumber)) {
      return; // Cannot select unavailable seats
    }

    const isSelected = currentSelection.some(seat => seat.number === seatNumber);

    if (isSelected) {
      setCurrentSelection(currentSelection.filter(seat => seat.number !== seatNumber));
    } else {
       // Limit selection if needed, e.g., max 5 seats
      // if (currentSelection.length >= 5) {
      //   toast({ variant: "destructive", title: "Selection Limit", description: "You can select a maximum of 5 seats." });
      //   return;
      // }
      setCurrentSelection([...currentSelection, { number: seatNumber, price: bus.price }]);
    }
  };

   const handleConfirmSeats = () => {
    if (currentSelection.length === 0) {
      toast({ variant: "destructive", title: "No Seats Selected", description: "Please select at least one seat." });
      return;
    }
    onSeatSelect(currentSelection);
  };

  const renderSeats = () => {
    const seats = [];
    // Basic grid layout - adjust rows/cols based on bus type or layout preference
    const cols = 4;
    const rows = Math.ceil(bus.totalSeats / cols);

    for (let i = 1; i <= bus.totalSeats; i++) {
       const isSelected = currentSelection.some(seat => seat.number === i);
       const isUnavailable = unavailableSeats.includes(i);
       const seatClass = cn(
        'seat',
        isUnavailable ? 'seat-unavailable' : (isSelected ? 'seat-selected' : 'seat-available')
      );

      seats.push(
        <div
          key={i}
          className={seatClass}
          onClick={() => handleSeatClick(i)}
          role="checkbox"
          aria-checked={isSelected}
          aria-disabled={isUnavailable}
          tabIndex={isUnavailable ? -1 : 0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSeatClick(i); }}
        >
          <Sofa className="h-5 w-5" />
          <span className="absolute text-xs font-medium" style={{ top: '1px', left: '2px' }}>{i}</span>
        </div>
      );
    }
    // Add aisle spacing visually if needed (e.g., using grid gaps or empty divs)
    // This example uses a simple grid.
    return seats;
  };

  const totalPrice = currentSelection.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-secondary">
        <h3 className="font-semibold text-lg mb-4 text-center text-secondary-foreground">Select Your Seats</h3>
        <div className="grid grid-cols-5 gap-2 justify-center max-w-xs mx-auto">
          {/* Simple 4-column layout with potential aisle */}
          {renderSeats()}
        </div>
         <div className="flex justify-center space-x-4 mt-4 text-sm">
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-card border"></div> Available</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-primary border border-primary"></div> Selected</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-muted border border-muted"></div> Unavailable</div>
         </div>
      </div>

      <div className="text-center space-y-2">
         <p className="text-lg font-semibold">
            Selected Seats: {currentSelection.map(s => s.number).join(', ') || 'None'}
         </p>
         <p className="text-xl font-bold text-primary">
            Total Price: LKR {totalPrice.toLocaleString()}
         </p>
      </div>

      <Button onClick={handleConfirmSeats} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

