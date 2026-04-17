# Church Check-in System

A simple check-in system for church music presentation events built with Next.js, React, Firebase, and deployed on Vercel.

## Features

- Simple check-in form for attendees (full name, centre number, phone number)
- Support for caregivers to add children's information (name and age)
- Real-time admin dashboard with metrics
- Export check-in data to Excel spreadsheet
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Charts**: Recharts
- **Excel Export**: xlsx library
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone or Download the Project

Place the `church-checkin` folder in your desired location.

### 2. Install Dependencies

Navigate to the project directory and install dependencies:

```bash
cd church-checkin
npm install
```

### 3. Set up Firebase

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Go to Project Settings > General > Your apps > Add app (Web app)
4. Copy the Firebase config

### 4. Environment Variables

Create a `.env.local` file in the root directory with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Vercel at [https://vercel.com](https://vercel.com)
3. Add the environment variables in Vercel's dashboard
4. Deploy!

## Usage

### Check-in Process

1. Attendees visit `/checkin`
2. Fill in their full name, centre number, and phone number
3. If caring for children, check the box and add each child's name and age
4. Submit the form

### Admin Dashboard

1. Visit `/admin`
2. View real-time metrics:
   - Total check-ins
   - Total children
   - Unique centres
   - Check-ins by centre (bar chart)
   - Children age groups (pie chart)
3. View recent check-ins table
4. Export all data to Excel

## API Endpoints

- `POST /api/checkin` - Submit a check-in
- `GET /api/export` - Export check-ins to Excel

## Project Structure

```
church-checkin/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkin/
│   │   │   │   └── route.ts
│   │   │   └── export/
│   │   │       └── route.ts
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── checkin/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── firebase.ts
│   └── types/
│       └── index.ts
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── .eslintrc.json
```

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License