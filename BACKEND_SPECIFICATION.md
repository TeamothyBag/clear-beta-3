# Cleared Mind Wellness App - Comprehensive Backend Specification

## Executive Summary

This document provides a complete backend specification for the Cleared Mind mental health and wellness application. The frontend is a React/TypeScript progressive web app that requires a robust, secure, and HIPAA-compliant backend to handle sensitive health data, user authentication, crisis management, and wellness tracking features.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Core Database Models](#core-database-models)
3. [Authentication & Security](#authentication--security)
4. [API Endpoints](#api-endpoints)
5. [Real-time Features](#real-time-features)
6. [Crisis Management System](#crisis-management-system)
7. [Data Privacy & Compliance](#data-privacy--compliance)
8. [External Integrations](#external-integrations)
9. [Infrastructure Requirements](#infrastructure-requirements)
10. [Deployment Architecture](#deployment-architecture)

## System Architecture

### Technology Stack Recommendation
- **Runtime**: Node.js with Express.js or Python with FastAPI
- **Database**: PostgreSQL with Redis for caching and sessions
- **Authentication**: JWT with refresh tokens, OAuth2 for social login
- **File Storage**: AWS S3 or Google Cloud Storage
- **Real-time**: Socket.io or WebSockets
- **Monitoring**: Winston/Morgan for logging, DataDog/New Relic for monitoring
- **Security**: Helmet.js, CORS, rate limiting, data encryption

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │  Admin Panel    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│                       Load Balancer                             │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway / Auth Layer                     │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Service   │    │ Wellness Service│    │ Crisis Service  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│               Primary Database (PostgreSQL)                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│               Redis Cache & Session Store                       │
└─────────────────────────────────────────────────────────────────┘
```

## Core Database Models

### 1. Users & Authentication

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- nullable for social auth only users
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    location VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP,
    privacy_policy_accepted_at TIMESTAMP,
    hipaa_authorization_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### user_social_accounts
```sql
CREATE TABLE user_social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- google, facebook, apple
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_social_user_id ON user_social_accounts(user_id);
```

#### user_sessions
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info JSONB, -- browser, OS, IP, etc.
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
```

### 2. Mood Tracking System

#### mood_entries
```sql
CREATE TABLE mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood_value INTEGER NOT NULL CHECK (mood_value >= 1 AND mood_value <= 10),
    notes TEXT,
    logged_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_logged_at ON mood_entries(logged_at);
CREATE INDEX idx_mood_entries_user_logged ON mood_entries(user_id, logged_at);
```

#### mood_factors
```sql
CREATE TABLE mood_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mood_entry_id UUID NOT NULL REFERENCES mood_entries(id) ON DELETE CASCADE,
    factor_type VARCHAR(50) NOT NULL, -- sleep, exercise, stress, social, weather, medication, work
    factor_value INTEGER, -- 1-5 scale for quantifiable factors
    factor_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mood_factors_entry_id ON mood_factors(mood_entry_id);
CREATE INDEX idx_mood_factors_type ON mood_factors(factor_type);
```

### 3. Meditation & Mindfulness System

#### meditation_sessions
```sql
CREATE TABLE meditation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- breathing, mindfulness, loving-kindness, body-scan
    duration_minutes INTEGER NOT NULL,
    completed_duration_minutes INTEGER NOT NULL,
    guided_session_id UUID, -- reference to guided session if applicable
    ambient_sound VARCHAR(50), -- rain, forest, ocean, birds, silence
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meditation_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX idx_meditation_sessions_started_at ON meditation_sessions(started_at);
CREATE INDEX idx_meditation_sessions_type ON meditation_sessions(session_type);
```

#### guided_meditation_content
```sql
CREATE TABLE guided_meditation_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    meditation_type VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL, -- beginner, intermediate, advanced
    audio_url TEXT,
    thumbnail_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    download_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    tags JSONB, -- array of tags
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guided_content_type ON guided_meditation_content(meditation_type);
CREATE INDEX idx_guided_content_difficulty ON guided_meditation_content(difficulty_level);
```

### 4. Wellness Scheduling System

#### appointments
```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    appointment_type VARCHAR(50) NOT NULL, -- therapy, medical, yoga, etc.
    provider_name VARCHAR(255),
    provider_contact JSONB, -- phone, email, website
    location TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    meeting_link TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no-show
    notes TEXT,
    reminder_settings JSONB, -- when to send reminders
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
```

#### wellness_habits
```sql
CREATE TABLE wellness_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    habit_type VARCHAR(50) NOT NULL, -- mindfulness, exercise, sleep, nutrition, selfcare
    target_frequency VARCHAR(20) NOT NULL, -- daily, weekly, weekdays
    target_time TIME, -- preferred time of day
    reminder_enabled BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wellness_habits_user_id ON wellness_habits(user_id);
CREATE INDEX idx_wellness_habits_type ON wellness_habits(habit_type);
```

#### habit_completions
```sql
CREATE TABLE habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES wellness_habits(id) ON DELETE CASCADE,
    completed_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_habit_completions_completed_at ON habit_completions(completed_at);
```

### 5. Goal Tracking & Achievements

#### wellness_goals
```sql
CREATE TABLE wellness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- mindfulness, physical, emotional, rest
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    unit VARCHAR(50) NOT NULL, -- days, sessions, hours, etc.
    target_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    achieved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wellness_goals_user_id ON wellness_goals(user_id);
CREATE INDEX idx_wellness_goals_category ON wellness_goals(category);
```

#### achievements
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    criteria JSONB NOT NULL, -- conditions for earning
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
```

#### user_achievements
```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
```

### 6. User Preferences & Settings

#### user_preferences
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_meditation BOOLEAN DEFAULT TRUE,
    notification_mood BOOLEAN DEFAULT TRUE,
    notification_appointments BOOLEAN DEFAULT TRUE,
    notification_achievements BOOLEAN DEFAULT FALSE,
    notification_updates BOOLEAN DEFAULT FALSE,
    privacy_data_sharing BOOLEAN DEFAULT FALSE,
    privacy_analytics BOOLEAN DEFAULT TRUE,
    privacy_marketing BOOLEAN DEFAULT FALSE,
    meditation_default_duration INTEGER DEFAULT 5,
    meditation_preferred_time TIME,
    mood_reminder_time TIME,
    settings JSONB, -- flexible settings storage
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id)
);
```

### 7. Crisis Support System

#### crisis_contacts
```sql
CREATE TABLE crisis_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL, -- emergency, therapist, family, friend
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    relationship VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_crisis_contacts_user_id ON crisis_contacts(user_id);
```

#### crisis_incidents
```sql
CREATE TABLE crisis_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    severity_level INTEGER NOT NULL CHECK (severity_level >= 1 AND severity_level <= 5),
    resource_used VARCHAR(100), -- which crisis resource was accessed
    follow_up_needed BOOLEAN DEFAULT TRUE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE INDEX idx_crisis_incidents_user_id ON crisis_incidents(user_id);
CREATE INDEX idx_crisis_incidents_created_at ON crisis_incidents(created_at);
```

### 8. Content & Resources

#### wellness_content
```sql
CREATE TABLE wellness_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- article, video, audio, exercise
    category VARCHAR(50) NOT NULL, -- sleep, nutrition, exercise, mindfulness
    content TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    author VARCHAR(255),
    reading_time_minutes INTEGER,
    is_premium BOOLEAN DEFAULT FALSE,
    tags JSONB,
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wellness_content_type ON wellness_content(content_type);
CREATE INDEX idx_wellness_content_category ON wellness_content(category);
```

### 9. Analytics & Insights

#### user_analytics_events
```sql
CREATE TABLE user_analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON user_analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON user_analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON user_analytics_events(created_at);
```

## Authentication & Security

### 1. Authentication Flow

#### Registration Process
1. **Email/Password Registration**
   - Email validation and verification
   - Password strength requirements (min 8 chars, complexity)
   - HIPAA consent and terms acceptance
   - Welcome email with verification link

2. **Social Authentication (OAuth2)**
   - Google OAuth2 integration
   - Facebook OAuth2 integration
   - Apple Sign-In integration
   - Account linking for existing users

3. **Multi-Factor Authentication (Optional)**
   - SMS-based 2FA
   - TOTP app support (Google Authenticator, Authy)
   - Recovery codes generation

#### JWT Token Strategy
```javascript
// Access Token (15 minutes)
{
  "iss": "cleared-mind-api",
  "sub": "user-uuid",
  "aud": "cleared-mind-app",
  "exp": 1234567890,
  "iat": 1234567890,
  "user_id": "uuid",
  "email": "user@example.com",
  "roles": ["user"],
  "permissions": ["read:profile", "write:mood", "read:content"]
}

// Refresh Token (30 days)
{
  "iss": "cleared-mind-api",
  "sub": "user-uuid",
  "type": "refresh",
  "exp": 1234567890,
  "session_id": "session-uuid"
}
```

### 2. Security Measures

#### Password Security
- bcrypt hashing with salt rounds 12+
- Password history tracking (prevent reuse of last 5)
- Account lockout after 5 failed attempts
- Password reset with secure tokens (30-minute expiry)

#### Data Encryption
- Passwords: bcrypt hashing
- PII: AES-256 encryption at rest
- API communication: TLS 1.3
- Database: Transparent Data Encryption (TDE)

#### Rate Limiting
```javascript
const rateLimits = {
  authentication: "5 requests per 15 minutes",
  passwordReset: "3 requests per hour",
  moodEntry: "20 requests per hour",
  fileUpload: "10 requests per hour",
  crisisSupport: "unlimited", // no limits on crisis features
  general: "100 requests per 15 minutes"
};
```

### 3. Role-Based Access Control (RBAC)

#### User Roles
- **user**: Standard app user
- **therapist**: Licensed mental health professional
- **admin**: System administrator
- **support**: Customer support agent

#### Permission Matrix
```javascript
const permissions = {
  user: [
    "read:own_profile", "write:own_profile",
    "read:own_mood", "write:own_mood",
    "read:own_sessions", "write:own_sessions",
    "read:content", "read:achievements",
    "write:crisis_incident"
  ],
  therapist: [
    "read:client_profiles", "read:client_mood",
    "read:client_sessions", "write:therapy_notes",
    "read:content", "write:content"
  ],
  admin: [
    "read:all", "write:all", "delete:all",
    "manage:users", "manage:content"
  ]
};
```

## API Endpoints

### Authentication Endpoints

```typescript
// Auth routes
POST   /api/auth/register           // User registration
POST   /api/auth/login              // User login
POST   /api/auth/refresh            // Refresh access token
POST   /api/auth/logout             // Logout (invalidate tokens)
POST   /api/auth/forgot-password    // Password reset request
POST   /api/auth/reset-password     // Password reset with token
POST   /api/auth/verify-email       // Email verification
POST   /api/auth/resend-verification // Resend verification email

// Social auth routes
POST   /api/auth/google             // Google OAuth callback
POST   /api/auth/facebook           // Facebook OAuth callback
POST   /api/auth/apple              // Apple Sign-In callback

// 2FA routes
POST   /api/auth/2fa/enable         // Enable 2FA
POST   /api/auth/2fa/verify         // Verify 2FA token
POST   /api/auth/2fa/disable        // Disable 2FA
GET    /api/auth/2fa/recovery-codes // Get recovery codes
```

### User Profile Endpoints

```typescript
// Profile management
GET    /api/users/profile           // Get current user profile
PUT    /api/users/profile           // Update user profile
DELETE /api/users/profile           // Delete user account
POST   /api/users/profile/avatar    // Upload profile avatar
DELETE /api/users/profile/avatar    // Remove profile avatar

// User preferences
GET    /api/users/preferences       // Get user preferences
PUT    /api/users/preferences       // Update preferences
GET    /api/users/settings          // Get all settings
PUT    /api/users/settings          // Update settings

// Privacy & consent
POST   /api/users/consent/hipaa     // Record HIPAA consent
POST   /api/users/consent/terms     // Record terms acceptance
GET    /api/users/data-export       // Request data export
```

### Mood Tracking Endpoints

```typescript
// Mood entries
GET    /api/mood/entries            // Get mood entries (with pagination)
POST   /api/mood/entries            // Create new mood entry
GET    /api/mood/entries/:id        // Get specific mood entry
PUT    /api/mood/entries/:id        // Update mood entry
DELETE /api/mood/entries/:id        // Delete mood entry

// Mood analytics
GET    /api/mood/insights           // Get mood insights and patterns
GET    /api/mood/trends             // Get mood trends over time
GET    /api/mood/factors/analysis   // Analyze mood factors correlation

// Mood factors
GET    /api/mood/factors            // Get available factor types
POST   /api/mood/factors            // Add factor to mood entry
PUT    /api/mood/factors/:id        // Update mood factor
DELETE /api/mood/factors/:id        // Delete mood factor
```

### Meditation Endpoints

```typescript
// Meditation sessions
GET    /api/meditation/sessions     // Get user's meditation history
POST   /api/meditation/sessions     // Start/create meditation session
PUT    /api/meditation/sessions/:id // Update session (complete, add notes)
DELETE /api/meditation/sessions/:id // Delete session

// Guided content
GET    /api/meditation/guided       // Get available guided sessions
GET    /api/meditation/guided/:id   // Get specific guided session
POST   /api/meditation/guided/:id/start // Track guided session start
GET    /api/meditation/guided/categories // Get meditation categories

// Meditation progress
GET    /api/meditation/progress     // Get meditation statistics
GET    /api/meditation/streaks      // Get current streaks
GET    /api/meditation/achievements // Get meditation achievements
```

### Wellness Scheduling Endpoints

```typescript
// Appointments
GET    /api/schedule/appointments   // Get user appointments
POST   /api/schedule/appointments   // Create new appointment
GET    /api/schedule/appointments/:id // Get appointment details
PUT    /api/schedule/appointments/:id // Update appointment
DELETE /api/schedule/appointments/:id // Cancel appointment

// Habits
GET    /api/schedule/habits         // Get user habits
POST   /api/schedule/habits         // Create new habit
GET    /api/schedule/habits/:id     // Get habit details
PUT    /api/schedule/habits/:id     // Update habit
DELETE /api/schedule/habits/:id     // Delete habit

// Habit tracking
POST   /api/schedule/habits/:id/complete // Mark habit complete
GET    /api/schedule/habits/:id/completions // Get habit completion history
GET    /api/schedule/habits/today   // Get today's habits status
```

### Goals & Achievements Endpoints

```typescript
// Wellness goals
GET    /api/goals                   // Get user goals
POST   /api/goals                   // Create new goal
GET    /api/goals/:id               // Get goal details
PUT    /api/goals/:id               // Update goal
DELETE /api/goals/:id               // Delete goal
POST   /api/goals/:id/progress      // Update goal progress

// Achievements
GET    /api/achievements            // Get available achievements
GET    /api/achievements/earned     // Get user's earned achievements
GET    /api/achievements/progress   // Get progress toward achievements
POST   /api/achievements/:id/claim  // Claim achievement reward
```

### Crisis Support Endpoints

```typescript
// Crisis incidents
POST   /api/crisis/incidents        // Log crisis incident
GET    /api/crisis/incidents        // Get user's crisis history
PUT    /api/crisis/incidents/:id    // Update incident (follow-up)

// Crisis contacts
GET    /api/crisis/contacts         // Get emergency contacts
POST   /api/crisis/contacts         // Add emergency contact
PUT    /api/crisis/contacts/:id     // Update emergency contact
DELETE /api/crisis/contacts/:id     // Remove emergency contact

// Crisis resources
GET    /api/crisis/resources        // Get crisis support resources
GET    /api/crisis/resources/local  // Get location-based resources
POST   /api/crisis/resources/used   // Track resource usage
```

### Content & Resources Endpoints

```typescript
// Wellness content
GET    /api/content                 // Get wellness content (paginated)
GET    /api/content/:id             // Get specific content
GET    /api/content/categories      // Get content categories
GET    /api/content/recommended     // Get personalized recommendations
POST   /api/content/:id/view        // Track content view
POST   /api/content/:id/rating      // Rate content

// Educational resources
GET    /api/resources/sleep         // Get sleep-related resources
GET    /api/resources/nutrition     // Get nutrition resources
GET    /api/resources/exercise      // Get exercise resources
```

### Analytics & Insights Endpoints

```typescript
// User analytics
POST   /api/analytics/events        // Track user events
GET    /api/analytics/dashboard     // Get dashboard insights
GET    /api/analytics/wellness-score // Get overall wellness score

// Health insights
GET    /api/insights/mood-patterns  // Get mood pattern analysis
GET    /api/insights/meditation-impact // Meditation impact on mood
GET    /api/insights/habit-correlation // Habit correlation with wellness
GET    /api/insights/recommendations // Personalized recommendations
```

### Administrative Endpoints

```typescript
// User management (admin only)
GET    /api/admin/users             // Get all users (paginated)
GET    /api/admin/users/:id         // Get user details
PUT    /api/admin/users/:id/status  // Update user status
GET    /api/admin/users/stats       // Get user statistics

// Content management
GET    /api/admin/content           // Get all content
POST   /api/admin/content           // Create content
PUT    /api/admin/content/:id       // Update content
DELETE /api/admin/content/:id       // Delete content

// System monitoring
GET    /api/admin/health            // System health check
GET    /api/admin/metrics           // System metrics
GET    /api/admin/logs              // Access logs (filtered)
```

## Real-time Features

### WebSocket Events

```typescript
// Client -> Server events
interface ClientEvents {
  'meditation:start': { sessionId: string, type: string, duration: number };
  'meditation:pause': { sessionId: string };
  'meditation:complete': { sessionId: string, notes?: string };
  'mood:updated': { entryId: string, value: number };
  'crisis:initiated': { severity: number, location?: string };
  'habit:completed': { habitId: string, timestamp: string };
}

// Server -> Client events
interface ServerEvents {
  'meditation:reminder': { message: string, sessionType: string };
  'mood:reminder': { message: string };
  'appointment:reminder': { appointment: Appointment, minutesUntil: number };
  'achievement:earned': { achievement: Achievement };
  'crisis:response': { resources: CrisisResource[], urgency: string };
  'wellness:insight': { insight: string, data: any };
}
```

### Real-time Notifications

```typescript
// Push notification service integration
const notificationTypes = {
  MEDITATION_REMINDER: {
    title: "Time for mindfulness",
    body: "Your daily meditation session awaits",
    icon: "meditation",
    actions: [
      { action: "start", title: "Start Now" },
      { action: "snooze", title: "Remind me in 15 mins" }
    ]
  },
  MOOD_CHECK_IN: {
    title: "How are you feeling?",
    body: "Take a moment to check in with yourself",
    icon: "mood",
    actions: [
      { action: "quick", title: "Quick Check-in" },
      { action: "detailed", title: "Detailed Entry" }
    ]
  },
  APPOINTMENT_REMINDER: {
    title: "Upcoming Appointment",
    body: "You have a {type} session in {time}",
    icon: "calendar",
    actions: [
      { action: "view", title: "View Details" },
      { action: "navigate", title: "Get Directions" }
    ]
  }
};
```

## Crisis Management System

### Emergency Response Protocol

```typescript
interface CrisisProtocol {
  severity: 1 | 2 | 3 | 4 | 5; // 1=low, 5=immediate danger
  
  responses: {
    1: { // Low - feeling down
      resources: ["self-help", "guided-meditation", "breathing-exercises"];
      escalation: "monitor";
      followUp: "24-hours";
    };
    2: { // Mild distress
      resources: ["crisis-text-line", "guided-sessions", "support-groups"];
      escalation: "therapist-referral";
      followUp: "12-hours";
    };
    3: { // Moderate crisis
      resources: ["crisis-hotline", "online-counseling", "emergency-contacts"];
      escalation: "immediate-support";
      followUp: "6-hours";
    };
    4: { // Severe crisis
      resources: ["988-lifeline", "crisis-chat", "emergency-services"];
      escalation: "professional-intervention";
      followUp: "2-hours";
    };
    5: { // Immediate danger
      resources: ["911", "988", "local-emergency"];
      escalation: "emergency-services";
      followUp: "immediate";
    };
  };
}
```

### Crisis Data Handling

```typescript
// Crisis incidents require special data handling
interface CrisisIncident {
  id: string;
  userId: string;
  severity: number;
  triggers?: string[];
  resourcesProvided: string[];
  professionalContactMade: boolean;
  followUpScheduled: Date;
  resolvedAt?: Date;
  
  // Encrypted sensitive data
  notes: string; // encrypted
  locationWhenReported?: string; // encrypted
  emergencyContactsNotified: string[]; // encrypted
}

// Crisis data retention policy
const crisisDataRetention = {
  incidents: "7 years", // HIPAA requirement
  followUps: "7 years",
  resourceUsage: "anonymized after 2 years",
  emergencyContacts: "until user deletion"
};
```

## Data Privacy & Compliance

### HIPAA Compliance Requirements

#### Technical Safeguards
1. **Access Control**
   - Unique user identification
   - Emergency access procedures
   - Automatic logoff after 15 minutes
   - Encryption and decryption capabilities

2. **Audit Controls**
   - Hardware, software, and procedural mechanisms
   - Record access to PHI
   - Failed login attempts tracking
   - Data modification logs

3. **Integrity**
   - PHI must not be improperly altered or destroyed
   - Checksums and digital signatures
   - Version control for medical records

4. **Person or Entity Authentication**
   - Verify user identity before access
   - Multi-factor authentication for admin access
   - Regular password updates

5. **Transmission Security**
   - End-to-end encryption for PHI
   - TLS 1.3 for all API communications
   - Secure file transfer protocols

#### Administrative Safeguards
```typescript
interface HIPAACompliance {
  businessAssociateAgreements: {
    cloudProviders: ["AWS", "Google Cloud"];
    thirdPartyServices: ["Stripe", "Twilio", "SendGrid"];
    requirements: "BAA signed for all PHI access";
  };
  
  minimumNecessary: {
    userAccess: "role-based permissions";
    dataSharing: "opt-in only";
    analytics: "aggregated and anonymized";
  };
  
  dataRetention: {
    userProfiles: "account lifetime + 7 years";
    healthData: "7 years from last activity";
    analyticsData: "2 years, then anonymized";
    backups: "encrypted, 7 year retention";
  };
  
  breachNotification: {
    timeframe: "60 days maximum";
    authorities: ["HHS", "state authorities"];
    userNotification: "individual notice required";
    documentation: "incident response plan";
  };
}
```

### Data Encryption Strategy

```typescript
// Encryption configuration
const encryptionConfig = {
  atRest: {
    algorithm: "AES-256-GCM",
    keyManagement: "AWS KMS / Google Cloud KMS",
    fields: [
      "users.phone",
      "users.date_of_birth", 
      "users.bio",
      "mood_entries.notes",
      "appointments.notes",
      "crisis_incidents.notes"
    ]
  },
  
  inTransit: {
    protocol: "TLS 1.3",
    certificates: "Let's Encrypt / AWS Certificate Manager",
    perfectForwardSecrecy: true
  },
  
  keyRotation: {
    frequency: "quarterly",
    automation: true,
    auditLog: true
  }
};
```

### Privacy Controls

```typescript
interface PrivacySettings {
  dataMinimization: {
    collectOnlyNecessary: true;
    purposeBasedCollection: true;
    consentGranularity: "feature-level";
  };
  
  userRights: {
    accessData: "API endpoint for data export";
    rectifyData: "profile editing capabilities";
    eraseData: "account deletion with 30-day grace";
    portability: "JSON/CSV export format";
    objectProcessing: "opt-out mechanisms";
  };
  
  consentManagement: {
    recordConsent: "timestamped database entries";
    withdrawConsent: "granular opt-out options";
    consentProof: "audit trail required";
  };
}
```

## External Integrations

### Third-Party Services

#### 1. Payment Processing (Stripe)
```typescript
interface StripeIntegration {
  subscriptions: {
    premium: {
      price: "$9.99/month";
      features: ["unlimited guided sessions", "advanced analytics", "priority support"];
    };
    therapy: {
      price: "$49.99/session";
      features: ["therapist sessions", "session notes", "progress tracking"];
    };
  };
  
  webhooks: [
    "payment_intent.succeeded",
    "customer.subscription.updated",
    "invoice.payment_failed"
  ];
  
  security: {
    webhookSigning: true;
    idempotencyKeys: true;
    encryptedCustomerData: true;
  };
}
```

#### 2. Communication Services

**Twilio Integration**
```typescript
interface TwilioServices {
  sms: {
    purposes: ["2FA", "appointment reminders", "crisis alerts"];
    compliance: "opt-in required for all";
    rateLimiting: "max 5 SMS per day per user";
  };
  
  voice: {
    crisisHotline: "automated routing to crisis counselors";
    appointmentReminders: "voice call reminders";
    emergencyContacts: "automated crisis notifications";
  };
}
```

**SendGrid Integration**
```typescript
interface EmailServices {
  transactional: [
    "welcome emails",
    "password reset",
    "appointment confirmations",
    "weekly progress reports"
  ];
  
  compliance: {
    unsubscribeLinks: "required in all emails";
    privacyPolicy: "linked in footer";
    bounceHandling: "automatic list cleanup";
  };
}
```

#### 3. Geolocation Services
```typescript
interface LocationServices {
  crisisResources: {
    provider: "Google Places API";
    purpose: "locate nearby crisis centers";
    caching: "24-hour cache for performance";
  };
  
  therapistFinder: {
    provider: "Psychology Today API";
    filters: ["insurance", "specialties", "distance"];
    privacy: "user location not stored";
  };
}
```

#### 4. Analytics & Monitoring

**Application Monitoring**
```typescript
interface MonitoringServices {
  errorTracking: {
    service: "Sentry";
    configuration: "scrub PII from error reports";
    alerting: "immediate for P1 issues";
  };
  
  performanceMonitoring: {
    service: "New Relic / DataDog";
    metrics: ["response time", "throughput", "error rate"];
    dashboards: "real-time system health";
  };
  
  logManagement: {
    service: "CloudWatch / Stackdriver";
    retention: "90 days for app logs, 7 years for audit logs";
    analysis: "automated anomaly detection";
  };
}
```

### API Rate Limiting & Quotas

```typescript
const apiQuotas = {
  freeUsers: {
    moodEntries: "10 per day",
    meditationSessions: "unlimited",
    appointmentBookings: "3 per month",
    crisisResources: "unlimited"
  },
  
  premiumUsers: {
    moodEntries: "unlimited",
    meditationSessions: "unlimited", 
    appointmentBookings: "unlimited",
    guidedSessions: "unlimited access"
  },
  
  rateLimits: {
    perUser: "100 requests per 15 minutes",
    perIP: "1000 requests per hour",
    crisis: "unlimited (no rate limiting)",
    authentication: "5 attempts per 15 minutes"
  }
};
```

## Infrastructure Requirements

### Server Requirements

#### Production Environment
```yaml
webServers:
  count: 3
  specs:
    cpu: "8 vCPU"
    memory: "16 GB"
    storage: "100 GB SSD"
    os: "Ubuntu 22.04 LTS"
  
databaseServers:
  primary:
    specs:
      cpu: "16 vCPU"
      memory: "64 GB"
      storage: "1 TB SSD (IOPS: 3000)"
    backup:
      frequency: "every 6 hours"
      retention: "30 days point-in-time recovery"
  
  replica:
    count: 2
    specs:
      cpu: "8 vCPU"
      memory: "32 GB"
      storage: "1 TB SSD"
    purpose: "read replicas for analytics"

cacheServers:
  redis:
    count: 3 (cluster mode)
    specs:
      cpu: "4 vCPU"
      memory: "16 GB"
      storage: "50 GB SSD"
    purpose: "sessions, rate limiting, caching"
```

#### Scaling Strategy
```typescript
const scalingConfig = {
  horizontalScaling: {
    triggers: ["CPU > 70%", "Memory > 80%", "Response time > 500ms"];
    minInstances: 2;
    maxInstances: 20;
    scaleUpCooldown: "5 minutes";
    scaleDownCooldown: "15 minutes";
  };
  
  databaseScaling: {
    readReplicas: "auto-scale based on read load";
    connectionPooling: "PgBouncer with 100 connections per pool";
    queryOptimization: "automated slow query detection";
  };
  
  contentDelivery: {
    cdn: "CloudFlare / CloudFront";
    staticAssets: "meditation audio, images, videos";
    edgeLocations: "global distribution";
  };
}
```

### Security Infrastructure

```yaml
networkSecurity:
  vpc:
    privateSubnets: "database and cache servers"
    publicSubnets: "load balancers only"
    natGateway: "outbound internet access"
  
  loadBalancer:
    type: "Application Load Balancer"
    sslTermination: true
    wafEnabled: true
    ddosProtection: true
  
  firewall:
    inboundRules:
      - port: 443 (HTTPS)
      - port: 80 (HTTP redirect)
    outboundRules:
      - restrictedToNecessaryServices: true
  
  monitoring:
    intrusionDetection: "AWS GuardDuty / Google Cloud Security"
    vulnerabilityScanning: "automated weekly scans"
    securityAudits: "quarterly penetration testing"
```

### Backup & Disaster Recovery

```typescript
const backupStrategy = {
  databases: {
    frequency: "continuous backup with 6-hour snapshots";
    retention: "30 days point-in-time recovery";
    crossRegion: "daily backups to secondary region";
    testing: "monthly restore tests";
  };
  
  applicationData: {
    userUploads: "real-time replication to S3";
    configFiles: "version controlled in Git";
    secrets: "backed up to secure key management";
  };
  
  disasterRecovery: {
    rto: "4 hours" // Recovery Time Objective
    rpo: "1 hour"  // Recovery Point Objective
    failoverRegion: "automated failover capability";
    drTesting: "quarterly disaster recovery drills";
  }
};
```

## Deployment Architecture

### Production Deployment

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  web:
    image: cleared-mind-api:latest
    replicas: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=cleared_mind
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: |
          npm install
          npm run test:unit
          npm run test:integration
          npm run test:security
  
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Security Audit
        run: npm audit --audit-level high
      - name: SAST Scan
        uses: securecodewarrior/github-action-add-sarif@v1
  
  deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          docker build -t cleared-mind-api:${{ github.sha }} .
          docker push $ECR_REGISTRY/cleared-mind-api:${{ github.sha }}
          aws ecs update-service --service cleared-mind-prod
```

### Environment Configuration

```typescript
// config/environments.ts
const environments = {
  development: {
    database: {
      host: "localhost",
      port: 5432,
      ssl: false,
      logQueries: true
    },
    redis: {
      host: "localhost",
      port: 6379
    },
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"]
    }
  },
  
  production: {
    database: {
      host: process.env.DB_HOST,
      port: 5432,
      ssl: true,
      connectionPooling: {
        min: 10,
        max: 50,
        acquireTimeoutMillis: 60000
      }
    },
    redis: {
      cluster: true,
      nodes: process.env.REDIS_CLUSTER_NODES.split(',')
    },
    cors: {
      origin: ["https://app.clearedmind.com"]
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // requests per window
    }
  }
};
```

### Monitoring & Alerting

```typescript
const monitoringConfig = {
  healthChecks: {
    endpoints: [
      "/health",
      "/health/database", 
      "/health/redis",
      "/health/external-services"
    ],
    interval: "30 seconds",
    timeout: "10 seconds"
  },
  
  alerts: {
    criticalAlerts: [
      "API response time > 2 seconds",
      "Error rate > 1%",
      "Database connection failures",
      "Memory usage > 90%",
      "Disk space < 10%"
    ],
    
    businessAlerts: [
      "Crisis incident reported",
      "User unable to access crisis resources",
      "Payment processing failures",
      "Unusual authentication patterns"
    ]
  },
  
  metrics: {
    application: [
      "request throughput",
      "response times",
      "error rates",
      "active users"
    ],
    
    business: [
      "daily active users",
      "meditation sessions completed",
      "mood entries created",
      "crisis incidents handled"
    ]
  }
};
```

### Performance Optimization

```typescript
const performanceConfig = {
  caching: {
    strategy: "Redis + CDN",
    policies: {
      userProfile: "1 hour",
      meditationContent: "24 hours", 
      wellnessContent: "12 hours",
      crisisResources: "1 hour"
    }
  },
  
  databaseOptimization: {
    indexing: "automated index recommendations",
    queryOptimization: "EXPLAIN plan analysis",
    connectionPooling: "PgBouncer configuration",
    readReplicas: "route read queries to replicas"
  },
  
  apiOptimization: {
    compression: "gzip for responses > 1KB",
    pagination: "cursor-based for large datasets",
    fieldSelection: "GraphQL-style field filtering",
    batching: "support batch operations"
  }
};
```

## Implementation Timeline & Milestones

### Phase 1: Core Infrastructure (4 weeks)
- [ ] Database schema implementation
- [ ] Authentication system with JWT
- [ ] Basic CRUD APIs for users
- [ ] Security middleware implementation
- [ ] Basic deployment pipeline

### Phase 2: Wellness Features (6 weeks)
- [ ] Mood tracking system
- [ ] Meditation session management
- [ ] Basic scheduling functionality
- [ ] User preferences and settings
- [ ] Push notification system

### Phase 3: Advanced Features (4 weeks)
- [ ] Crisis support system
- [ ] Achievement and goals tracking
- [ ] Analytics and insights API
- [ ] Content management system
- [ ] Real-time features with WebSocket

### Phase 4: Compliance & Production (3 weeks)
- [ ] HIPAA compliance implementation
- [ ] Security audit and penetration testing
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Monitoring and alerting setup

### Phase 5: Integrations & Polish (3 weeks)
- [ ] Third-party service integrations
- [ ] Advanced analytics
- [ ] Admin panel development
- [ ] Load testing and optimization
- [ ] Documentation completion

---

## Conclusion

This comprehensive backend specification provides a complete roadmap for implementing a secure, scalable, and HIPAA-compliant backend for the Cleared Mind wellness application. The architecture prioritizes user privacy, data security, and crisis management while supporting a rich feature set for mental health and wellness tracking.

Key implementation priorities:
1. **Security First**: HIPAA compliance and data protection
2. **Crisis Management**: Robust crisis support systems
3. **Scalability**: Designed for growth and high availability
4. **User Experience**: Fast, reliable API responses
5. **Monitoring**: Comprehensive observability and alerting

The backend should be implemented using modern best practices with a focus on maintainability, testing, and documentation to ensure long-term success of the platform.