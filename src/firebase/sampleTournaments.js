// Sample tournament documents for Firestore
// Collection: 'tournaments'

const sampleTournaments = [
  {
    // Completed Tournament Example
    title: "University of Florida Dye Tournament Spring 2025",
    date: "2025-01-19", // Store dates in ISO format for proper sorting
    time: "12:00 PM",
    location: "Beta",
    imageUrl: "/tournament-images/uf.jpg",
    status: "completed",
    type: "dye", // dye, blackjack, poker, etc.
    winner: "John Smith",
    runnerUp: "Jane Doe",
    chapter: "Beta Theta Pi",
    createdAt: new Date(), // Firestore timestamp
    updatedAt: new Date()
  },
  {
    // Upcoming Tournament Example
    title: "U MIAMI ET DYE TOURNAMENT SPRING 2025",
    date: "2025-01-15",
    time: "2:00 PM",
    location: "UMiami",
    imageUrl: "/tournament-images/umiami.jpg",
    status: "upcoming",
    type: "dye",
    chapter: "Sigma Chi",
    registrationDeadline: "2025-01-14",
    maxParticipants: 64,
    currentParticipants: 45,
    entryFee: "25",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    // Scheduled Tournament Example
    title: "SDSU ET Dye Tournament Fall 2024",
    date: "2024-12-07",
    time: "1:00 PM",
    location: "SDSU",
    imageUrl: "/tournament-images/sdsu.jpg",
    status: "scheduled",
    type: "dye",
    chapter: "Sigma Alpha Epsilon",
    registrationDeadline: "2024-12-06",
    maxParticipants: 32,
    currentParticipants: 0,
    entryFee: "20",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/*
Firestore Collection Structure:

tournaments/
  ├── [tournament_id]/
  │   ├── title: string
  │   ├── date: string (ISO format)
  │   ├── time: string
  │   ├── location: string
  │   ├── imageUrl: string
  │   ├── status: string (completed | upcoming | scheduled)
  │   ├── type: string
  │   ├── chapter: string
  │   ├── winner?: string (only for completed tournaments)
  │   ├── runnerUp?: string (only for completed tournaments)
  │   ├── registrationDeadline?: string (for upcoming/scheduled)
  │   ├── maxParticipants?: number (for upcoming/scheduled)
  │   ├── currentParticipants?: number (for upcoming/scheduled)
  │   ├── entryFee?: string (for upcoming/scheduled)
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp

Notes:
1. Use Firestore's timestamp type for dates when adding documents
2. Store image URLs in Storage and reference them in documents
3. Consider adding indexes for frequently queried fields (status, date)
4. Add security rules to control read/write access
*/

export default sampleTournaments;
