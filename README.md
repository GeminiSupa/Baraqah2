# Shadi Khana Abadi - Muslim Matrimony Platform

A respectful matrimony platform for the Muslim community, emphasizing privacy, authenticity, and family-oriented matchmaking (not dating/hookup).

## Features

- **Secure Authentication**: Email/phone verification with ID document verification
- **Profile Management**: Comprehensive profiles with Muslim cultural preferences, optional photos
- **Approval-Based Messaging**: Users must approve message requests before conversations can begin
- **Content Filtering**: Automatic filtering of personal contact information (phone numbers, emails, URLs)
- **Privacy Controls**: Configurable photo and profile visibility settings
- **Disclaimer & Safety**: Clear disclaimers about platform limitations and user responsibility

## Tech Stack

- **Frontend**: Next.js 14+ with React (App Router), TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd "/Users/apple/Desktop/Shadi khana abadi"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Supabase credentials:

```env
# Database - Supabase PostgreSQL
# Get your database password from Supabase Dashboard > Settings > Database
# Replace [YOUR-DATABASE-PASSWORD] with your actual Supabase database password
DATABASE_URL="postgresql://postgres:[YOUR-DATABASE-PASSWORD]@db.gnyzefdmxlrhfmbaafln.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Supabase (Optional - for future features)
NEXT_PUBLIC_SUPABASE_URL="https://gnyzefdmxlrhfmbaafln.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueXplZmRteGxyaGZtYmFhZmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTAwNTMsImV4cCI6MjA4NDI2NjA1M30.6eT0lf5RoB1HoVcGwFpDZdDF7M119vX456PAO70oq8w"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueXplZmRteGxyaGZtYmFhZmxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY5MDA1MywiZXhwIjoyMDg0MjY2MDUzfQ.IzqX0jnj5DW5iO6P1GFmvRoDFbDqWuaCNWw5ekl9hio"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880
```

**Important**: 
- Replace `[YOUR-DATABASE-PASSWORD]` with your actual Supabase database password
- To find your database password: Go to Supabase Dashboard > Settings > Database > Connection String
- Or reset it in Supabase Dashboard > Settings > Database > Reset Database Password

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma db push
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The project uses Prisma ORM with PostgreSQL. The schema includes:

- **User**: Authentication and verification status
- **Profile**: User profiles with cultural preferences
- **Photo**: Optional profile photos
- **MessageRequest**: Message request approval system
- **Message**: In-app messages between users

Run `npx prisma studio` to view and manage database records.

## Project Structure

```
/
├── app/                    # Next.js App Router pages and API routes
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions and configurations
├── prisma/               # Prisma schema and migrations
└── public/               # Static files and uploads
```

## Key Features Implementation

### Authentication Flow
1. User registers with email/phone
2. Email/phone verification (OTP - TODO: implement actual OTP sending)
3. ID document upload for identity verification
4. Admin reviews and verifies ID documents
5. Profile creation after ID verification

### Messaging System
1. User A sends a message request to User B
2. User B receives notification and can approve/reject
3. Only after approval, both users can message each other
4. All messages are filtered for personal contact information

### Privacy & Safety
- Automatic content filtering blocks phone numbers, emails, and external URLs
- Clear disclaimers about platform limitations
- Privacy settings for photos and profiles
- Secure storage of ID documents

## Important Notes

- **Photos are optional** - Users can create profiles without photos
- **ID Verification required** - Users must verify identity before profile activation
- **Approval-based messaging** - All messaging requires explicit approval
- **Content filtering** - Personal contact information is automatically filtered
- **Disclaimer** - Platform includes disclaimers about responsibility for offline interactions

## Development

- Run `npm run dev` for development server
- Run `npm run build` for production build
- Run `npm run lint` to check code quality
- Run `npx prisma studio` to manage database

## Production Deployment

For production deployment:

1. Set up PostgreSQL database (Supabase recommended)
2. Configure environment variables in production environment
3. Run database migrations: `npx prisma migrate deploy`
4. Build the application: `npm run build`
5. Deploy to Vercel or your preferred hosting platform

## Security Considerations

- All sensitive data should be encrypted
- ID documents stored securely with restricted access
- HTTPS-only communication in production
- Regular security audits recommended
- Implement proper OTP verification for email/phone
- Add admin role-based access control

## License

This project is for matrimony/matchmaking purposes only. Not for dating or hookup.
