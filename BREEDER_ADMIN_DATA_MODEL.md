# Breeder Admin Portal - Data Model

## Firestore Collections Structure

### Dogs Collection
**Path:** `/dogs/{dogId}`

```javascript
{
  id: "dog_uuid",
  role: "dam" | "sire" | "both",
  name: "Champion Name",
  callName: "Friendly Name",
  sex: "male" | "female",
  dateOfBirth: timestamp,
  color: "wheaten, brindle, etc",

  // Registry
  registryIds: {
    akc: "PR12345678",
    ukc: "UC123456",
    iwca: "IWCA1234"
  },

  // Pedigree
  pedigreeUrl: "url_to_pedigree_pdf",
  sireId: "parent_dog_id",
  damId: "parent_dog_id",
  coi: 0.08, // coefficient of inbreeding

  // Health Tests
  healthTests: {
    ofa: {
      hips: { result: "Excellent", date: timestamp, certNumber: "IW-1234E24M-VPI" },
      elbows: { result: "Normal", date: timestamp, certNumber: "IW-1234E24-VPI" },
      heart: { result: "Normal", date: timestamp, certNumber: "IW-CA1234/24M/C-VPI" }
    },
    pennhip: { score: 0.35, date: timestamp },
    embark: {
      url: "embark_results_url",
      clearFor: ["DM", "vWD1", "etc"],
      carrier: [],
      atRisk: []
    },
    cerf: { result: "Normal", date: timestamp, expiresAt: timestamp },
    baer: { result: "Bilateral", date: timestamp }
  },

  // Awards & Titles
  titles: {
    prefix: ["CH", "GCH"],
    suffix: ["CGC", "TDI"]
  },
  awards: [
    { name: "Best in Show", event: "IWCA National", date: timestamp, photo: "url" }
  ],

  // Breeding Records (if dam)
  breedingRecords: [
    {
      heatCycleStart: timestamp,
      progesteroneTests: [
        { date: timestamp, level: 5.2, notes: "Not ready" },
        { date: timestamp, level: 8.5, notes: "Breed tomorrow" }
      ],
      breedingType: "natural" | "AI" | "surgical_AI",
      breedingDates: [timestamp, timestamp],
      sireId: "dog_id",
      studContract: "url_to_contract",
      whelpDate: timestamp,
      litterId: "litter_id"
    }
  ],

  // Media
  photos: [
    { url: "photo_url", caption: "Stack photo", isPrimary: true, uploadedAt: timestamp }
  ],
  videos: [
    { url: "video_url", caption: "Movement", uploadedAt: timestamp }
  ],

  // Status
  status: "active" | "retired" | "deceased",
  isPublic: true, // show on public website

  // Meta
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "user_id"
}
```

### Litters Collection
**Path:** `/litters/{litterId}`

```javascript
{
  id: "litter_uuid",

  // Parents
  damId: "dog_id",
  sireId: "dog_id",

  // Dates
  breedDate: timestamp,
  dueDate: timestamp, // 63 days from breed
  whelpDate: timestamp,
  goHomeDate: timestamp, // typically 8-10 weeks from whelp

  // Litter Info
  litterSize: 8,
  males: 4,
  females: 4,
  theme: "Greek Gods", // naming theme
  nameSeries: "G Litter",

  // Registry
  registryIds: {
    akc: "AKC_LITTER_ID",
    ukc: "UKC_LITTER_ID"
  },

  // Status workflow
  status: "planned" | "confirmed" | "whelped" | "vet_cleared" | "ready" | "completed",

  // Tasks & Schedule
  tasks: [
    {
      id: "task_uuid",
      type: "deworming" | "vaccination" | "vet_check" | "microchip" | "baer" | "temperament",
      title: "First Deworming",
      dueDate: timestamp, // auto-calculated based on whelp date
      completedDate: timestamp,
      completedBy: "user_id",
      notes: "Panacur 2ml per pup",
      status: "pending" | "completed" | "skipped"
    }
  ],

  // Microchips
  microchipBatch: {
    start: "982000123456789",
    end: "982000123456799",
    assigned: 8
  },

  // Pricing
  pricing: {
    pet: 2500,
    show: 3500,
    breeding: 4000,
    coOwn: 2000,
    guardian: 0
  },

  // Financial tracking
  revenue: {
    deposits: 16000, // 8 x $2000
    finalPayments: 4000,
    total: 20000
  },
  expenses: {
    studFee: 2000,
    vetCare: 1200,
    healthTests: 800,
    food: 600,
    registrations: 400,
    microchips: 240,
    total: 5240
  },
  profit: 14760,

  // Meta
  isPublic: false, // show on website
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Puppies Collection
**Path:** `/puppies/{puppyId}`

```javascript
{
  id: "puppy_uuid",
  litterId: "litter_id",

  // Basic Info
  name: "Zeus", // from theme
  callName: "Zeus",
  sex: "male" | "female",
  color: "wheaten",
  markings: "small white chest spot",
  collarColor: "blue", // for identification

  // Identification
  microchip: "982000123456789",
  tattoo: "optional",
  akc: "PR12345678", // once registered

  // Physical
  weightLog: [
    { date: timestamp, weightGrams: 450, weekNumber: 0, notes: "Birth weight" },
    { date: timestamp, weightGrams: 900, weekNumber: 1 },
    { date: timestamp, weightGrams: 1800, weekNumber: 2 }
  ],

  // Health Records
  healthLog: {
    dewormings: [
      { date: timestamp, product: "Panacur", dose: "2ml", lotNumber: "LOT123", adminBy: "user_id" }
    ],
    vaccinations: [
      {
        date: timestamp,
        vaccine: "DHPP",
        manufacturer: "Nobivac",
        lotNumber: "LOT456",
        vetName: "Dr. Smith",
        dueNext: timestamp
      }
    ],
    vetExams: [
      { date: timestamp, vet: "Dr. Smith", findings: "Healthy", weight: 4500, cleared: true }
    ],
    medications: [
      { date: timestamp, medication: "Antibiotic", reason: "Umbilical infection", duration: "7 days" }
    ]
  },

  // Temperament
  temperament: {
    volhardScore: {
      socialAttraction: 3,
      following: 3,
      restraint: 2,
      socialDominance: 3,
      elevation: 3,
      retrieving: 4,
      touchSensitivity: 3,
      soundSensitivity: 3,
      sightSensitivity: 3,
      stability: 3,
      overall: "Moderate to high energy, confident, good for active family or performance"
    },
    notes: "Outgoing, loves people, first to greet visitors",
    matchTags: ["active", "service-prospect", "performance", "family"]
  },

  // Media
  photos: [
    {
      url: "photo_url",
      watermarkedUrl: "watermarked_url",
      weekNumber: 0,
      caption: "Birth",
      uploadedAt: timestamp
    }
  ],
  videos: [],

  // Availability
  availability: "available" | "hold" | "deposit" | "sold" | "coOwn" | "guardian" | "keeper",
  priceTier: "pet" | "show" | "breeding" | "coOwn" | "guardian",
  price: 2500,

  // Sale Info
  applicantId: "applicant_id", // who has hold/deposit
  buyerId: "buyer_id", // final buyer
  orderId: "order_id",
  contractId: "contract_id",

  // Meta
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Applicants Collection
**Path:** `/applicants/{applicantId}`

```javascript
{
  id: "applicant_uuid",

  // Contact
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+1-555-1234",
  address: {
    street: "123 Main St",
    city: "Boston",
    state: "MA",
    zip: "02101",
    country: "USA"
  },

  // Application
  applicationDate: timestamp,
  applicationAnswers: {
    // Custom questions
    hasYard: true,
    fenceHeight: "6 feet",
    fenceType: "wooden",
    ownOrRent: "own",
    landlordApproval: null,
    priorBreedExperience: true,
    priorBreeds: ["Irish Wolfhound", "Great Dane"],
    currentPets: "2 cats, 1 dog",
    vetReference: {
      name: "Animal Hospital",
      phone: "+1-555-5678",
      verified: true,
      verifiedDate: timestamp
    },
    activityLevel: "Very Active - hiking, running",
    whyThisBreed: "Long answer...",
    trainingPlan: "Professional trainer + home practice",
    // ... 30+ more questions
  },

  // Scoring
  score: 85, // out of 100
  autoFlags: ["no_fence", "landlord_approval_needed"],

  // Status
  status: "submitted" | "under_review" | "approved" | "declined" | "waitlisted" | "reserved" | "purchased",
  reviewedBy: "user_id",
  reviewedDate: timestamp,
  reviewNotes: "Excellent fit, experienced with giant breeds",

  // Documents
  documents: [
    { type: "id_verification", url: "doc_url", uploadedAt: timestamp },
    { type: "proof_of_residence", url: "doc_url", uploadedAt: timestamp },
    { type: "landlord_approval", url: "doc_url", uploadedAt: timestamp }
  ],

  // Terms Acceptance
  termsAccepted: {
    spayNeuter: { accepted: true, date: timestamp },
    healthGuarantee: { accepted: true, date: timestamp },
    returnPolicy: { accepted: true, date: timestamp }
  },

  // Meta
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Waitlist Collection
**Path:** `/waitlist/{waitlistId}`

```javascript
{
  id: "waitlist_uuid",
  applicantId: "applicant_id",
  litterId: "litter_id", // specific litter or null for general waitlist

  // Preferences
  preferences: {
    sex: "male" | "female" | "either",
    color: "wheaten preferred",
    temperament: ["active", "outgoing"],
    purpose: "family pet" | "show" | "breeding" | "service" | "therapy" | "performance"
  },

  // Ranking
  rank: 1, // position in waitlist
  joinedDate: timestamp, // for tie-breaking

  // Deposit
  depositId: "payment_id",
  depositAmount: 500,
  depositDate: timestamp,
  isRefundable: true,
  refundableUntil: timestamp,

  // Pick Status
  pickOrder: 3, // assigned pick position for this litter
  pickDate: timestamp, // scheduled pick appointment
  selectedPuppyId: "puppy_id",
  pickCompleted: true,
  pickCompletedDate: timestamp,

  // Status
  status: "active" | "picking" | "selected" | "passed" | "removed" | "completed",

  // Meta
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Contracts Collection
**Path:** `/contracts/{contractId}`

```javascript
{
  id: "contract_uuid",
  buyerId: "applicant_id",
  puppyId: "puppy_id",
  orderId: "order_id",

  // Contract Type
  type: "pet" | "show" | "breeding" | "coOwn" | "guardian",

  // Terms
  terms: {
    spayNeuter: {
      required: true,
      byAge: "24 months",
      proof: "vet letter or certificate"
    },
    registration: "limited" | "full",
    healthGuarantee: {
      duration: "2 years",
      covers: ["genetic defects", "hip dysplasia"],
      requires: "annual vet exams"
    },
    returnClause: {
      firstRightOfRefusal: true,
      lifetime: true
    },
    coOwnTerms: null, // if type === "coOwn"
    guardianTerms: null // if type === "guardian"
  },

  // Document
  templateUsed: "pet_contract_v2",
  generatedPdf: "url_to_generated_pdf",

  // E-signature
  signature: {
    buyerSigned: true,
    buyerSignedDate: timestamp,
    buyerSignature: "data:image/png;base64...",
    buyerIp: "192.168.1.1",

    breederSigned: true,
    breederSignedDate: timestamp,
    breederSignature: "data:image/png;base64...",
    breederName: "Breeder Name"
  },

  // Status
  status: "draft" | "sent" | "signed" | "completed" | "breached" | "terminated",

  // Meta
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Orders Collection
**Path:** `/orders/{orderId}`

```javascript
{
  id: "order_uuid",
  buyerId: "applicant_id",
  puppyId: "puppy_id",

  // Items
  items: [
    { type: "puppy", puppyId: "puppy_id", name: "Zeus", price: 2500 },
    { type: "starter_kit", name: "Puppy Starter Kit", price: 150 },
    { type: "crate", name: "XXL Crate", price: 200 }
  ],

  // Pricing
  subtotal: 2850,
  tax: 185.25, // calculated based on pickup state
  total: 3035.25,

  // Payments
  payments: [
    {
      id: "payment_uuid",
      type: "deposit",
      amount: 500,
      method: "stripe",
      stripeId: "ch_xxxxx",
      status: "succeeded",
      date: timestamp
    },
    {
      id: "payment_uuid",
      type: "milestone",
      amount: 1000,
      method: "check",
      checkNumber: "1234",
      status: "cleared",
      date: timestamp
    },
    {
      id: "payment_uuid",
      type: "final",
      amount: 1535.25,
      method: "cash",
      status: "received",
      date: timestamp,
      receiptUrl: "receipt_pdf_url"
    }
  ],

  // Refunds
  refunds: [],

  // Status
  paymentStatus: "pending" | "partial" | "paid" | "refunded",
  orderStatus: "pending" | "confirmed" | "ready" | "completed" | "cancelled",

  // Documents
  documents: [
    { type: "contract", contractId: "contract_id", url: "url" },
    { type: "health_certificate", url: "url", expiresAt: timestamp },
    { type: "vaccine_record", url: "url" },
    { type: "go_home_packet", url: "url" }
  ],

  // Meta
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Appointments Collection
**Path:** `/appointments/{appointmentId}`

```javascript
{
  id: "appointment_uuid",
  type: "vet" | "pickup" | "pick_day" | "vaccination" | "health_certificate",

  // Related entities
  puppyId: "puppy_id", // optional, may be for whole litter
  litterId: "litter_id",
  buyerId: "applicant_id", // for pickup appointments

  // Scheduling
  datetime: timestamp,
  duration: 30, // minutes
  location: "Clinic Name" or "Home",

  // Details
  title: "8-week Vet Check",
  notes: "Bring all puppies, request health certificates for 4 going home this week",

  // Checklist (for pickup)
  checklist: {
    idVerified: true,
    finalPaymentReceived: true,
    contractSigned: true,
    healthCertProvided: true,
    microchipPaperworkProvided: true,
    goHomePacketProvided: true,
    puppy Handed Over: true
  },

  // Results (for vet)
  results: {
    findings: "All puppies healthy, cleared for go-home",
    weight: 4500,
    invoiceUrl: "vet_invoice_url"
  },

  // Status
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show",

  // Meta
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "user_id"
}
```

### Media Collection
**Path:** `/media/{mediaId}`

```javascript
{
  id: "media_uuid",

  // What it's attached to
  subjectType: "dog" | "litter" | "puppy",
  subjectId: "subject_uuid",

  // File info
  url: "original_url",
  watermarkedUrl: "watermarked_url", // auto-generated
  thumbnailUrl: "thumb_url",

  type: "photo" | "video",
  mimeType: "image/jpeg",
  size: 2048576, // bytes

  // Metadata
  caption: "8-week stack photo",
  tags: ["week_8", "stack", "conformation"],
  weekNumber: 8, // for puppy growth tracking
  isPrimary: false, // primary photo for this subject

  // Privacy
  isPublic: false, // show on public website
  isWatermarked: true,
  rightClickBlock: true,

  // Meta
  uploadedAt: timestamp,
  uploadedBy: "user_id"
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner() {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
    }

    function isBreedingManager() {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'breeding_manager'];
    }

    function isStaff() {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'breeding_manager', 'kennel_tech', 'sales'];
    }

    // Dogs - only breeding managers can edit
    match /dogs/{dogId} {
      allow read: if isStaff();
      allow create, update, delete: if isBreedingManager();
    }

    // Litters - staff can read, breeding managers can edit
    match /litters/{litterId} {
      allow read: if isStaff();
      allow create, update, delete: if isBreedingManager();
    }

    // Puppies - staff can read, breeding managers can edit
    match /puppies/{puppyId} {
      allow read: if isStaff();
      allow create, update, delete: if isBreedingManager();
    }

    // Applicants - anyone can create (public form), staff can read/update
    match /applicants/{applicantId} {
      allow create: if true; // public application form
      allow read: if isStaff();
      allow update, delete: if isStaff();
    }

    // Waitlist - staff only
    match /waitlist/{waitlistId} {
      allow read, write: if isStaff();
    }

    // Contracts - staff only
    match /contracts/{contractId} {
      allow read, write: if isStaff();
    }

    // Orders - staff only
    match /orders/{orderId} {
      allow read, write: if isStaff();
    }

    // Appointments - staff can read, breeding managers can write
    match /appointments/{appointmentId} {
      allow read: if isStaff();
      allow create, update, delete: if isBreedingManager();
    }

    // Media - staff can read, breeding managers can write
    match /media/{mediaId} {
      allow read: if isStaff();
      allow create, update, delete: if isBreedingManager();
    }

    // Contact submissions (existing)
    match /contact-submissions/{submission} {
      allow create: if true;
      allow read, update, delete: if isAuthenticated();
    }
  }
}
```

## Key Workflows

### 1. Planned Litter → Applications Open
1. Create litter with status="planned"
2. Optionally mark as public on website
3. Applications flow to `/applicants` collection
4. Review and approve applicants
5. Approved applicants moved to `/waitlist` for this litter

### 2. Whelped → Health Schedule
1. Update litter status="whelped", set whelpDate
2. Auto-create tasks array with deworming/vaccine schedule
3. Create 8-12 puppy records
4. Assign microchips from batch
5. Start weekly weight logs and photo galleries

### 3. Matching & Deposits
1. Run temperament tests at 7-8 weeks
2. Match puppies to waitlist based on preferences + temperament
3. Notify top of waitlist via email
4. Collect deposits, link to `/payments` in orders
5. Update waitlist status="selected", puppy availability="deposit"

### 4. Pick Day
1. Create appointments for pick day time slots
2. Top of waitlist picks first
3. Update selectedPuppyId in waitlist record
4. Move to next in waitlist
5. Once all picked, generate contracts

### 5. Go-home
1. Generate contract PDFs, send for e-sign
2. Schedule pickup appointments
3. Get health certificates from vet (within 10 days of go-home)
4. Collect final payments
5. Print go-home packet (contract, vaccine record, feeding plan, AKC forms)
6. Register microchip or provide transfer paperwork
7. Check off pickup checklist
8. Update order status="completed", puppy availability="sold"

### 6. Post-sale
1. Trigger automated email sequence (24h, 7d, 30d check-ins)
2. Send vaccine reminder emails based on puppy DOB
3. Request review/testimonial at 60 days
4. Invite to alumni gallery

## MVP Features (First Release)

1. **Dogs CRUD** - dam/sire profiles with health tests and photos
2. **Litters CRUD** - whelp dates, status tracking, task timeline
3. **Puppies CRUD** - profiles, health logs, weight tracking, photos
4. **Applications** - custom form with scoring and auto-flags
5. **Waitlist** - preferences, ranking, deposit tracking
6. **Contracts** - template generation with e-sign (DocuSign or HelloSign API)
7. **Orders** - payment tracking (deposit, milestone, final)
8. **Appointments** - pickup scheduling with checklist
9. **Go-home Packet** - PDF generator with puppy-specific data
10. **Dashboard** - overview stats and quick actions

## Later Enhancements

- Pedigree/COI calculator
- Embark DNA import API
- Flight nanny integration
- Buyer portal (view their puppy, album, messages)
- Training course content
- Accounting sync (QuickBooks)
- CRM integrations (Klaviyo for email automation)
- Mobile kennel app for weight/med entries
