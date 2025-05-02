
'use client';

import React, { useRef } from 'react';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Ticket } from '@/types/booking';
import { format } from 'date-fns';

interface TicketDisplayProps {
  ticket: Ticket;
  onRestart: () => void;
}

export default function TicketDisplay({ ticket, onRestart }: TicketDisplayProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  /**
   * Generates a multi-line string representation of the ticket details for the QR code.
   * Using newlines (\n) instead of semicolons might improve readability for some scanners,
   * but semicolon separation is more common for structured data within QR codes.
   *
   * Note: The effectiveness of newline separation depends on the QR scanner application.
   * Some might interpret it correctly, others might treat it as a single block of text.
   */
  const generateQRData = (ticketData: Ticket): string => {
    const dataLines = [
      `Passenger: ${ticketData.userName}`,
      `NIC: ${ticketData.nic}`,
      `Route: ${ticketData.startPoint} to ${ticketData.endPoint}`,
      `Bus: ${ticketData.busName} (${ticketData.busType})`,
      `Departure: ${ticketData.departureTime}`,
      `Seats: ${ticketData.seatNumbers.join(',')}`,
      `Price: LKR ${ticketData.totalPrice.toLocaleString()}`,
      `Booked: ${format(ticketData.bookingDate, 'yyyy-MM-dd HH:mm')}`,
      `TicketID: ${ticketData.id}`
    ];
    // Join with newline characters. Consider using '; ' for broader compatibility.
    return dataLines.join('\n');
  };


  const downloadQRCode = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `LankaBusTicket_${ticket.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const qrData = generateQRData(ticket);
  // Log the data being encoded into the QR code for debugging purposes.
  // Check the console to ensure the format is as expected.
  console.log("Generated QR Data:\n", qrData);

  return (
    <div className="space-y-6 flex flex-col items-center">
      <Card className="w-full max-w-md shadow-lg border-primary border-2">
        <CardHeader className="text-center bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-2xl">Your Bus Ticket</CardTitle>
          <CardDescription className="text-primary-foreground/80">Ticket ID: {ticket.id}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="text-center" ref={qrCodeRef}>
            <QRCode
              value={qrData}
              size={192} // Adjust size as needed
              level={'M'} // Error correction level: L, M, Q, H
              includeMargin={true}
              className="inline-block border-4 border-secondary p-1 rounded-md"
            />
             <p className="text-xs text-muted-foreground mt-2">Scan this code for ticket details</p>
          </div>

          <div className="space-y-2 text-sm border-t pt-4">
             <p><strong className="text-muted-foreground w-24 inline-block">Passenger:</strong> {ticket.userName}</p>
             <p><strong className="text-muted-foreground w-24 inline-block">NIC:</strong> {ticket.nic}</p>
             <p><strong className="text-muted-foreground w-24 inline-block">Route:</strong> {ticket.startPoint} to {ticket.endPoint}</p>
             <p><strong className="text-muted-foreground w-24 inline-block">Bus:</strong> {ticket.busName} ({ticket.busType})</p>
             <p><strong className="text-muted-foreground w-24 inline-block">Departure:</strong> {ticket.departureTime}</p>
             <p><strong className="text-muted-foreground w-24 inline-block">Seats:</strong> {ticket.seatNumbers.join(', ')}</p>
             <p><strong className="text-muted-foreground w-24 inline-block">Total Price:</strong> LKR {ticket.totalPrice.toLocaleString()}</p>
             <p><strong className="text-muted-foreground w-24 inline-block">Booked On:</strong> {format(ticket.bookingDate, 'PPP p')}</p>
          </div>

        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button onClick={downloadQRCode} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Download className="mr-2 h-4 w-4" /> Download QR Code
        </Button>
         <Button onClick={onRestart} variant="outline" className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" /> Book Another Ticket
        </Button>
      </div>
       <p className="text-sm text-muted-foreground text-center mt-4">Thank you for choosing Lanka Bus Ticket!</p>
    </div>
  );
}
