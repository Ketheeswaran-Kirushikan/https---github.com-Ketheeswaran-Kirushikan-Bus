'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Bus, Seat } from '@/types/booking';
import { ArrowRight, Sofa } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    const seatsLayout = [];
    const seatsPerRow = 4; // Layout: 2 seats, aisle, 2 seats
    const totalRows = Math.ceil(bus.totalSeats / seatsPerRow);

    for (let row = 0; row < totalRows; row++) {
      const rowSeats = [];
      for (let seatIndex = 0; seatIndex < seatsPerRow; seatIndex++) {
        const seatNumber = row * seatsPerRow + seatIndex + 1;
        if (seatNumber > bus.totalSeats) break; // Stop if we exceed total seats

        const isSelected = currentSelection.some(seat => seat.number === seatNumber);
        const isUnavailable = unavailableSeats.includes(seatNumber);
        const seatClass = cn(
          'seat', // Base class for styling
          isUnavailable ? 'seat-unavailable' : (isSelected ? 'seat-selected' : 'seat-available')
        );

        // Add aisle space visually after the second seat in the row
        if (seatIndex === 2) {
          rowSeats.push(<div key={`aisle-${row}`} className="w-6 sm:w-8"></div>); // Aisle spacer
        }

        rowSeats.push(
          <div
            key={seatNumber}
            className={seatClass}
            onClick={() => handleSeatClick(seatNumber)}
            role="checkbox"
            aria-checked={isSelected}
            aria-disabled={isUnavailable}
            tabIndex={isUnavailable ? -1 : 0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSeatClick(seatNumber); }}
          >
            <Sofa className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] sm:text-xs font-medium">{seatNumber}</span>
          </div>
        );
      }
      seatsLayout.push(
        <div key={`row-${row}`} className="flex justify-center items-center gap-1 sm:gap-2">
          {rowSeats}
        </div>
      );
    }
    return seatsLayout;
  };


  const totalPrice = currentSelection.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-secondary">
        <h3 className="font-semibold text-lg mb-4 text-center text-secondary-foreground">Select Your Seats</h3>
        {/* Seat Layout Area */}
        <ScrollArea className="h-[300px] sm:h-[350px] w-full pr-4">
          <div className="flex flex-col items-center gap-2">
            {renderSeats()}
          </div>
        </ScrollArea>

        {/* Legend */}
         <div className="flex justify-center space-x-4 mt-4 text-sm">
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-card border"></div> Available</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-primary border border-primary"></div> Selected</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-muted border border-muted"></div> Unavailable</div>
         </div>
      </div>

      <div className="text-center space-y-2">
         <p className="text-lg font-semibold">
            Selected Seats: {currentSelection.map(s => s.number).sort((a, b) => a - b).join(', ') || 'None'}
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
