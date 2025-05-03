'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Bus, Seat } from '@/types/schema';
import { ArrowRight, Sofa } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';

interface SeatSelectionProps {
  bus: Bus;
  selectedSeats: Seat[];
  unavailableSeats: number[]; // Array of seat numbers that are already booked
  onSeatSelect: (seats: Seat[]) => void;
}

export default function SeatSelection({ bus, selectedSeats, unavailableSeats, onSeatSelect }: SeatSelectionProps) {
  const [currentSelection, setCurrentSelection] = useState<Seat[]>(selectedSeats);

  const handleSeatClick = (seatNumber: number) => {
    if (unavailableSeats.includes(seatNumber)) {
      toast.warning(`Seat ${seatNumber} is already booked.`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return; // Cannot select unavailable seats
    }

    const isSelected = currentSelection.some(seat => seat.number === seatNumber);

    if (isSelected) {
      setCurrentSelection(currentSelection.filter(seat => seat.number !== seatNumber));
    } else {
      setCurrentSelection([...currentSelection, { number: seatNumber, price: bus.price }]);
    }
  };

  const handleConfirmSeats = () => {
    if (currentSelection.length === 0) {
      toast.error('Please select at least one seat.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    onSeatSelect(currentSelection);
  };

  const renderSeats = () => {
    const seatsLayout = [];
    const seatsPerRow = 4; // Layout: 2 seats, aisle, 2 seats
    const totalRows = Math.ceil(bus.totalSeats / seatsPerRow);
    const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

    for (let row = 0; row < totalRows; row++) {
      const rowContent = [];
      // Add Row Label
      rowContent.push(
        <div key={`label-${row}`} className="w-4 sm:w-6 text-center text-xs sm:text-sm font-medium text-muted-foreground flex items-center justify-center">
          {rowLetters[row % rowLetters.length]}
        </div>
      );

      const rowSeats = [];
      for (let seatIndex = 0; seatIndex < seatsPerRow; seatIndex++) {
        const seatNumber = row * seatsPerRow + seatIndex + 1;
        if (seatNumber > bus.totalSeats) {
          if (seatIndex === 2) {
            rowSeats.push(<div key={`empty-aisle-${row}-${seatIndex}`} className="w-6 sm:w-8"></div>);
          }
          rowSeats.push(<div key={`empty-${row}-${seatIndex}`} className="seat invisible"></div>);
          continue;
        }

        const isSelected = currentSelection.some(seat => seat.number === seatNumber);
        const isUnavailable = unavailableSeats.includes(seatNumber);
        const seatClass = cn(
          'seat',
          isUnavailable ? 'seat-unavailable' : (isSelected ? 'seat-selected' : 'seat-available')
        );

        if (seatIndex === 2) {
          rowSeats.push(<div key={`aisle-${row}`} className="w-6 sm:w-8"></div>);
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
            title={`Seat ${seatNumber}${isUnavailable ? ' (Unavailable)' : ''}`}
          >
            <Sofa className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        );
      }
      rowContent.push(
        <div key={`seats-${row}`} className="flex justify-center items-center gap-1 sm:gap-2">
          {rowSeats}
        </div>
      );

      seatsLayout.push(
        <div key={`row-${row}`} className="flex justify-start items-center gap-2 sm:gap-4">
          {rowContent}
        </div>
      );
    }
    return seatsLayout;
  };

  const totalPrice = currentSelection.reduce((sum, seat) => sum + seat.price, 0);
  const availableSeatCount = bus.totalSeats - unavailableSeats.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-semibold text-lg text-primary">Select your seat</h3>
        <p className="text-sm text-muted-foreground">{availableSeatCount} seats available</p>
      </div>

      <div className="p-4 border rounded-lg bg-secondary/30">
        <ScrollArea className="h-[350px] sm:h-[400px] w-full pr-4 mb-4">
          <div className="flex flex-col items-center gap-2">
            {renderSeats()}
          </div>
        </ScrollArea>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm border-t pt-4">
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border seat-available"><Sofa className="w-3 h-3"/></div> Available</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border seat-selected"><Sofa className="w-3 h-3"/></div> Selected</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border seat-unavailable"><Sofa className="w-3 h-3"/></div> Unavailable</div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">
          Selected: <Badge variant="secondary">{currentSelection.map(s => s.number).sort((a, b) => a - b).join(', ') || 'None'}</Badge>
        </p>
        <p className="text-xl font-bold text-primary">
          Total Price: LKR {totalPrice.toLocaleString()}
        </p>
      </div>

      <Button onClick={handleConfirmSeats} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        Next <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}