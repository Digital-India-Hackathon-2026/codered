// LifeLens - CodeRed Hackathon 2026`n# LifeLens - Architecture Documentation

## Overview

LifeLens is an AI-powered health monitoring mobile application built with React Native. It provides real-time health tracking, AI-driven symptom analysis, medication management, and personalized health insights.

## Tech Stack

### Frontend
- **Framework**: React Native 0.73+
- **Language**: TypeScript 5.x
- **Navigation**: React Navigation 6.x
- **State Management**: React Context + Custom Hooks
- **Storage**: AsyncStorage for local persistence
- **Health Data**: Android Health Connect API
- **Styling**: StyleSheet (React Native)

### Backend
- **API Server**: FastAPI (Python)
- **AI Engine**: Custom LLM-based health analysis
- **Database**: MongoDB
- **Authentication**: JWT + OTP verification
- **Real-time**: Server-Sent Events (SSE) for chat streaming

### Infrastructure
- **Hosting**: AWS EC2 / ECS
- **CDN**: CloudFront
- **Storage**: S3 for reports and images
- **Monitoring**: CloudWatch
- **CI/CD**: GitHub Actions

## Application Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  Mobile App                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Screens    â”‚  Components  â”‚  Navigation         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Context    â”‚  Hooks       â”‚  Services           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  API Layer  â”‚  Storage     â”‚  Health Connect     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚              â”‚              â”‚
         â–¼              â–¼              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  FastAPI    â”‚  â”‚ AsyncStoreâ”‚  â”‚ Health Connectâ”‚
â”‚  Backend    â”‚  â”‚  (Local)  â”‚  â”‚    (Device)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Backend Services                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Auth    â”‚  Health  â”‚    AI    â”‚   Reports      â”‚
â”‚  Service â”‚  Service â”‚  Engine  â”‚   Service      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Data Layer                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚   MongoDB    â”‚      S3      â”‚    Redis Cache    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Directory Structure

```
src/
â”œâ”€â”€ api/              # API client and service definitions
â”‚   â”œâ”€â”€ client.ts     # Axios/fetch configuration
â”‚   â””â”€â”€ services.ts   # API endpoint functions
â”œâ”€â”€ components/       # Reusable UI components
â”‚   â”œâ”€â”€ chat/         # Chat-specific components
â”‚   â””â”€â”€ UI.tsx        # Common UI elements
â”œâ”€â”€ constants/        # App-wide constants and config
â”‚   â””â”€â”€ index.ts      # Thresholds, colors, settings
â”œâ”€â”€ context/          # React Context providers
â”‚   â””â”€â”€ AuthContext.tsx
â”œâ”€â”€ helpers/          # Utility functions
â”‚   â””â”€â”€ healthUtils.ts
â”œâ”€â”€ hooks/            # Custom React hooks
â”‚   â””â”€â”€ useHealthData.ts
â”œâ”€â”€ navigation/       # Navigation configuration
â”‚   â””â”€â”€ AppNavigator.tsx
â”œâ”€â”€ screens/          # Screen components
â”‚   â”œâ”€â”€ auth/         # Login, Register, OTP
â”‚   â”œâ”€â”€ chat/         # AI Chat interface
â”‚   â”œâ”€â”€ home/         # Dashboard
â”‚   â”œâ”€â”€ insights/     # Health insights
â”‚   â”œâ”€â”€ medications/  # Medication management
â”‚   â”œâ”€â”€ profile/      # User profile
â”‚   â”œâ”€â”€ reports/      # Health reports
â”‚   â”œâ”€â”€ timeline/     # Health timeline
â”‚   â””â”€â”€ vitals/       # Vital signs tracking
â”œâ”€â”€ services/         # Device services
â”‚   â””â”€â”€ healthConnect.ts
â”œâ”€â”€ theme/            # Theme configuration
â”‚   â””â”€â”€ index.ts
â”œâ”€â”€ types/            # TypeScript type definitions
â”‚   â””â”€â”€ index.ts
â””â”€â”€ utils/            # General utilities
    â””â”€â”€ helpers.ts
```

## Core Features

### 1. AI Health Chat
- Real-time streaming responses via SSE
- Diagnostic questionnaires (MCQ + text)
- Permission-based health assessments
- Summary reports with severity levels
- Chat history and thread management

### 2. Vital Signs Monitoring
- Heart Rate tracking (manual + device)
- Blood Pressure monitoring
- SpO2 (Oxygen Saturation)
- Body Temperature
- Respiratory Rate
- Blood Glucose levels
- Automatic abnormality detection
- Historical trend analysis

### 3. Medication Management
- Add/edit/delete medications
- Dosage and frequency tracking
- Time-based reminders
- Adherence scoring
- Missed dose alerts
- Prescription history

### 4. Health Reports
- Upload medical documents (PDF, images)
- AI-powered report summarization
- OCR text extraction
- Categorized storage
- Doctor and hospital tagging

### 5. Health Timeline
- Chronological health events
- Symptom logging
- Diagnosis records
- Medication changes
- Lab results
- Doctor visits

### 6. Health Insights
- AI-generated health recommendations
- Vital sign trend analysis
- Medication adherence tracking
- Lifestyle suggestions
- Anomaly detection alerts
- Weekly health summaries

## Data Flow

### Authentication Flow
1. User enters phone number
2. OTP sent via SMS
3. User verifies OTP
4. JWT tokens issued (access + refresh)
5. Tokens stored in AsyncStorage
6. Auto-refresh on expiry

### Chat Flow
1. User sends message
2. Request sent to AI endpoint
3. SSE stream initiated
4. Chunks received and displayed
5. Response type determined (chat/diagnostic/summary)
6. Appropriate UI component rendered

### Vitals Flow
1. Manual entry or Health Connect sync
2. Threshold validation
3. Abnormality flagging
4. Local storage update
5. Backend sync
6. Insight generation

## Security Measures

- JWT-based authentication with short-lived tokens
- OTP verification for login
- HTTPS for all API communication
- No sensitive data in local storage (only tokens)
- Health data encrypted at rest
- HIPAA-compliant data handling
- Session management with auto-logout

## Performance Optimizations

- FlatList with virtualization for long lists
- Memoized components with React.memo
- Debounced search inputs
- Lazy loading for screens
- Image compression for uploads
- Cached API responses
- Background sync for health data

## Testing Strategy

- Unit tests for utilities and helpers
- Component tests for UI elements
- Integration tests for API flows
- E2E tests for critical user journeys
- Health threshold validation tests
- Medication scheduling tests

## Deployment

### Android
- Target SDK: 34 (Android 14)
- Min SDK: 26 (Android 8.0)
- Health Connect integration
- Play Store distribution

### iOS
- Target: iOS 15+
- HealthKit integration (planned)
- App Store distribution

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/send-otp | Send OTP to phone |
| POST | /api/auth/verify-otp | Verify OTP and get tokens |
| GET | /api/profile | Get user profile |
| PUT | /api/profile | Update user profile |
| GET | /api/vitals | Get vital readings |
| POST | /api/vitals | Add vital reading |
| GET | /api/medications | Get medications |
| POST | /api/medications | Add medication |
| GET | /api/reports | Get health reports |
| POST | /api/reports/upload | Upload report |
| GET | /api/timeline | Get timeline events |
| POST | /api/timeline | Add timeline event |
| POST | /api/ai/chat/stream | AI chat (SSE) |
| GET | /api/ai/threads | Get chat threads |
| GET | /api/insights | Get health insights |

## Environment Variables

```env
API_BASE_URL=https://askfirst.co/api
AI_BASE_URL=https://askfirst.co/api/ai
HEALTH_CONNECT_ENABLED=true
SENTRY_DSN=<dsn>
ANALYTICS_KEY=<key>
```

