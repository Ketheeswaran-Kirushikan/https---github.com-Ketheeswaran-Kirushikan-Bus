import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { Ticket } from '@/types/schema';
import { format } from 'date-fns';

export async function GET(request: Request, { params }: { params: { ticketId: string } }) {
  const { ticketId } = params;

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Fetch the ticket from MongoDB
    const ticket = await db.collection('tickets').findOne({ id: ticketId }) as Ticket | null;
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // LaTeX template for the ticket PDF
    const latexTemplate = `
\\documentclass[a4paper,10pt]{article}

% Including necessary packages
\\usepackage{geometry}
\\usepackage{titling}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage{fancyhdr}
\\usepackage{tcolorbox}

% Setting page margins
\\geometry{margin=0.5in}

% Defining colors
\\definecolor{primary}{RGB}{0, 128, 128}
\\definecolor{secondary}{RGB}{128, 128, 128}
\\definecolor{background}{RGB}{240, 255, 255}

% Customizing title
\\pretitle{\\begin{center}\\Large\\bfseries\\color{primary}}
\\posttitle{\\end{center}}

% Removing page numbers
\\pagestyle{empty}

% Custom header and footer
\\fancypagestyle{ticketstyle}{
  \\fancyhf{}
  \\fancyhead[C]{\\small Lanka Bus Ticket}
  \\fancyfoot[C]{\\small Thank you for choosing Lanka Bus Ticket!}
}

% Starting document
\\begin{document}

% Applying custom style
\\thispagestyle{ticketstyle}

% Creating a ticket card with border and background
\\begin{tcolorbox}[colback=background, colframe=primary, boxrule=1pt, arc=5mm, width=\\textwidth, boxsep=5mm]

% Adding ticket ID
\\begin{center}
  \\color{secondary}
  \\small Ticket ID: ${ticket.id}
\\end{center}

\\vspace{0.5cm}

% Adding ticket details
\\section*{Ticket Details}
\\begin{description}[leftmargin=0.5cm, labelwidth=2.5cm, labelsep=0.3cm, font=\\normalfont\\color{secondary}]
  \\item[Passenger:] ${ticket.userName}
  \\item[NIC:] ${ticket.nic}
  \\item[Route:] ${ticket.startPoint} to ${ticket.endPoint}
  \\item[Bus:] ${ticket.busName} (${ticket.busType})
  \\item[Travel Date:] ${format(new Date(ticket.route.date), 'PPP')}
  \\item[Departure:] ${ticket.departureTime}
  \\item[Seats:] ${ticket.seatNumbers.join(', ')}
  \\item[Total Price:] LKR ${ticket.totalPrice.toLocaleString()}
  \\item[Booking Confirmed On:] ${format(ticket.bookingDate, 'PPP p')}
\\end{description}

\\end{tcolorbox}

% Ending document
\\end{document}
`;

    // Return the LaTeX content with Content-Type set to text/latex
    return new NextResponse(latexTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/latex',
        'Content-Disposition': `inline; filename="LankaBusTicket_${ticket.id}.pdf"`, // Changed to inline
      },
    });
  } catch (error) {
    console.error('Error generating ticket PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}