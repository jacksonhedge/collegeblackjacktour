// Event Schema Documentation for CCL Tournament Management

export const eventSchema = {
  // Basic Event Information
  id: 'string', // Auto-generated
  title: 'string', // e.g., "UC San Diego Spring Tournament 2025"
  date: 'timestamp',
  time: 'string', // e.g., "1:00 PM"
  location: 'string', // e.g., "Sigma Nu House"
  backgroundImage: 'string', // URL to tournament image
  status: 'upcoming' | 'active' | 'completed' | 'cancelled',
  
  // College & Fraternity Information
  collegeId: 'string', // Reference to college document
  collegeName: 'string', // Display name
  fraternityId: 'string', // Reference to fraternity document
  fraternityName: 'string', // e.g., "Sigma Nu"
  
  // Sales & Contact Information
  salesContact: {
    name: 'string', // Fraternity contact person
    email: 'string',
    phone: 'string',
    role: 'string', // e.g., "Social Chair", "President"
  },
  ccRepresentative: {
    name: 'string', // CCL staff member managing this event
    email: 'string',
    phone: 'string',
  },
  
  // Registration & Access
  registrationPassword: 'string', // Password for event sign-up
  googleFormUrl: 'string', // Link to Google Form for registration
  registrationDeadline: 'timestamp',
  
  // Participant Management
  maxParticipants: 'number',
  currentParticipants: 'number',
  participants: [
    {
      id: 'string',
      name: 'string',
      email: 'string',
      phone: 'string',
      registeredAt: 'timestamp',
      checkedIn: 'boolean',
      checkedInAt: 'timestamp',
      // Data from Google Form
      googleFormData: {
        age: 'number',
        year: 'string', // Freshman, Sophomore, etc.
        experience: 'string', // Beginner, Intermediate, Advanced
        dietary: 'string',
        emergencyContact: 'string',
        // Additional custom fields from form
      }
    }
  ],
  
  // Tournament Details
  entryFee: 'number',
  prizePool: 'number',
  prizeStructure: {
    first: 'number',
    second: 'number',
    third: 'number',
    other: [] // Additional prizes
  },
  
  // Bracket Information
  bracketHQUrl: 'string', // Link to bracket.hq tournament
  bracketId: 'string', // Bracket.hq tournament ID
  bracketStatus: 'not_created' | 'created' | 'in_progress' | 'completed',
  
  // Financial Tracking
  revenue: {
    entryFees: 'number',
    sponsorships: 'number',
    other: 'number',
    total: 'number'
  },
  expenses: {
    venue: 'number',
    prizes: 'number',
    supplies: 'number',
    staff: 'number',
    other: 'number',
    total: 'number'
  },
  
  // Results (for completed events)
  results: {
    winner: {
      name: 'string',
      email: 'string',
      prize: 'number'
    },
    runnerUp: {
      name: 'string',
      email: 'string',
      prize: 'number'
    },
    thirdPlace: {
      name: 'string',
      email: 'string',
      prize: 'number'
    }
  },
  
  // Admin Notes & Tracking
  notes: 'string', // Internal notes
  createdBy: 'string', // User ID who created the event
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  
  // Display Settings
  showOnLandingPage: 'boolean', // Whether to display on main page
  featured: 'boolean', // Feature prominently
  displayOrder: 'number' // Manual sorting order
};

// Sales Pipeline Schema
export const salesPipelineSchema = {
  id: 'string',
  collegeName: 'string',
  fraternityName: 'string',
  status: 'prospect' | 'contacted' | 'negotiating' | 'confirmed' | 'declined',
  
  contact: {
    name: 'string',
    email: 'string',
    phone: 'string',
    role: 'string',
    bestTimeToContact: 'string'
  },
  
  interactions: [
    {
      date: 'timestamp',
      type: 'email' | 'phone' | 'meeting' | 'text',
      notes: 'string',
      nextAction: 'string',
      completedBy: 'string' // Staff member
    }
  ],
  
  eventDetails: {
    proposedDate: 'timestamp',
    estimatedAttendance: 'number',
    venueConfirmed: 'boolean',
    specialRequests: 'string'
  },
  
  assignedTo: 'string', // CCL staff member
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};