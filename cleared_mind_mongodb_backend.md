# Cleared Mind - MongoDB Backend Architecture

## Executive Summary

A comprehensive MongoDB-based backend for the Cleared Mind mental health and wellness application, designed with efficiency, simplicity, and future AI integration in mind. This architecture leverages MongoDB's document model, aggregation framework, and flexible schema to create a robust, scalable, and HIPAA-compliant backend system.

## Table of Contents

1. [Technology Stack & Architecture](#technology-stack--architecture)
2. [MongoDB Schema Design](#mongodb-schema-design)
3. [Smart Algorithms & Data Processing](#smart-algorithms--data-processing)
4. [Authentication & Security](#authentication--security)
5. [API Design & Routes](#api-design--routes)
6. [Real-time Features](#real-time-features)
7. [AI Integration Framework](#ai-integration-framework)
8. [Performance Optimization](#performance-optimization)
9. [Crisis Management System](#crisis-management-system)
10. [Deployment & Infrastructure](#deployment--infrastructure)

## Technology Stack & Architecture

### Core Technologies
```typescript
const techStack = {
  runtime: "Node.js 20+",
  framework: "Express.js with TypeScript",
  database: "MongoDB 7.0+ with Mongoose 8.x",
  cache: "Redis 7.x",
  authentication: "JWT + Passport.js",
  realtime: "Socket.io",
  fileStorage: "MongoDB GridFS + *not aws free and easily scalabale*",
  monitoring: "Winston + MongoDB Atlas Monitoring",
  security: "Helmet, CORS, express-rate-limit",
  validation: "Joi + Mongoose validators",
  testing: "Jest + Supertest + MongoDB Memory Server"
};
```

### Smart Architecture Design
```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                            │
└─────────────────────────────────────────────────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│                   API Gateway + Rate Limiting                   │
└─────────────────────────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Auth Service   │    │Wellness Service │    │   AI Service    │
│   (JWT/OAuth)   │    │  (Core Logic)   │    │ (Future Ready)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────┐
│              MongoDB Cluster (Primary + Replicas)               │
│                        + Redis Cache                            │
└─────────────────────────────────────────────────────────────────┘
```

## MongoDB Schema Design

### User Management Schema
```typescript
// User Schema - Core user information
interface IUser {
  _id: ObjectId;
  email: string;
  password?: string; // Optional for OAuth-only users
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: Date;
    location?: {
      country: string;
      city: string;
      timezone: string;
    };
    bio?: string;
  };
  authentication: {
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLogin: Date;
    loginCount: number;
    passwordHistory: string[]; // Last 5 password hashes
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    recoveryPasses: string[];
  };
  social: {
    providers: [{
      provider: 'google' | 'facebook' | 'apple';
      providerId: string;
      email: string;
      connected: Date;
    }];
  };
  compliance: {
    termsAccepted: Date;
    privacyAccepted: Date;
    hipaaAuthorization: Date;
    dataRetentionConsent: boolean;
    marketingConsent: boolean;
  };
  subscription: {
    plan: 'free' | 'premium' | 'therapy';
    status: 'active' | 'canceled' | 'suspended';
    startDate: Date;
    endDate?: Date;
    stripeCustomerId?: string;
  };
  preferences: {
    notifications: {
      meditation: boolean;
      mood: boolean;
      appointments: boolean;
      achievements: boolean;
      crisis: boolean;
    };
    privacy: {
      dataSharing: boolean;
      analytics: boolean;
      locationTracking: boolean;
    };
    app: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      timezone: string;
    };
  };
  wellness: {
    onboardingCompleted: boolean;
    primaryGoals: string[];
    currentChallenges: string[];
    emergencyContacts: [{
      name: string;
      relationship: string;
      phone: string;
      email?: string;
      isPrimary: boolean;
    }];
  };
  ai: {
    interactions: number;
    lastChatDate?: Date;
    preferences: {
      personalityType: string;
      communicationStyle: string;
      reminderStyle: string;
    };
    insights: [{
      type: string;
      content: string;
      confidence: number;
      generated: Date;
    }];
  };
  metadata: {
    status: 'active' | 'inactive' | 'suspended' | 'deleted';
    createdAt: Date;
    updatedAt: Date;
    lastActive: Date;
    version: number;
  };
}

const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email format']
  },
  password: {
    type: String,
    minlength: 8,
    validate: {
      validator: function(v: string) {
        return !v || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'Password must contain uppercase, lowercase, number and special character'
    }
  },
  // ... other fields with proper validation
}, {
  timestamps: true,
  versionKey: 'version'
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'metadata.status': 1 });
userSchema.index({ 'metadata.lastActive': 1 });
userSchema.index({ 'subscription.plan': 1 });
```

### Mood Tracking Schema
```typescript
// Advanced Mood Tracking with AI-ready data structure
interface IMoodEntry {
  _id: ObjectId;
  userId: ObjectId;
  moodData: {
    primaryMood: number; // 1-10 scale
    emotions: [{
      emotion: string;
      intensity: number; // 1-5 scale
    }];
    energyLevel: number; // 1-10 scale
    stressLevel: number; // 1-10 scale
    anxietyLevel: number; // 1-10 scale
  };
  context: {
    factors: [{
      type: 'sleep' | 'exercise' | 'work' | 'relationships' | 'weather' | 'medication' | 'nutrition';
      value: number; // 1-5 scale or specific value
      notes?: string;
    }];
    location?: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
    weather?: {
      condition: string;
      temperature: number;
      humidity: number;
    };
    activities: string[];
  };
  notes: {
    userNotes?: string;
    voiceNote?: string; // URL to audio file
    images?: string[]; // URLs to images
  };
  ai: {
    sentiment: {
      score: number; // -1 to 1
      confidence: number;
      keywords: string[];
    };
    insights: [{
      type: string;
      content: string;
      confidence: number;
    }];
    recommendations: [{
      action: string;
      priority: number;
      reasoning: string;
    }];
  };
  metadata: {
    loggedAt: Date;
    source: 'manual' | 'voice' | 'ai-suggested' | 'scheduled';
    duration: number; // Time spent logging in seconds
    createdAt: Date;
    updatedAt: Date;
  };
}

const moodEntrySchema = new Schema<IMoodEntry>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  moodData: {
    primaryMood: { type: Number, required: true, min: 1, max: 10 },
    emotions: [{
      emotion: { type: String, required: true },
      intensity: { type: Number, required: true, min: 1, max: 5 }
    }],
    energyLevel: { type: Number, min: 1, max: 10 },
    stressLevel: { type: Number, min: 1, max: 10 },
    anxietyLevel: { type: Number, min: 1, max: 10 }
  },
  // ... rest of schema
}, {
  timestamps: true
});

// Geospatial index for location-based insights
moodEntrySchema.index({ 'context.location': '2dsphere' });
// Compound indexes for analytics
moodEntrySchema.index({ userId: 1, 'metadata.loggedAt': -1 });
moodEntrySchema.index({ userId: 1, 'moodData.primaryMood': 1 });
```

### Meditation & Mindfulness Schema
```typescript
interface IMeditationSession {
  _id: ObjectId;
  userId: ObjectId;
  session: {
    type: 'breathing' | 'mindfulness' | 'body-scan' | 'loving-kindness' | 'visualization' | 'custom';
    category: 'stress' | 'anxiety' | 'sleep' | 'focus' | 'compassion' | 'general';
    guidedContent?: ObjectId; // Reference to guided session
    plannedDuration: number; // Minutes
    actualDuration: number; // Minutes
    completed: boolean;
  };
  experience: {
    difficulty: number; // 1-5 scale
    focus: number; // 1-5 scale (how focused they felt)
    relaxation: number; // 1-5 scale
    enjoyment: number; // 1-5 scale
    distractions: number; // 1-5 scale
    notes?: string;
  };
  environment: {
    location: 'home' | 'work' | 'outdoor' | 'commute' | 'other';
    ambientSound?: string;
    posture: 'sitting' | 'lying' | 'walking' | 'standing';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  biometrics?: {
    heartRateBefore?: number;
    heartRateAfter?: number;
    // Future: Integration with health devices
  };
  ai: {
    recommendations: [{
      type: string;
      suggestion: string;
      reasoning: string;
    }];
    patterns: [{
      pattern: string;
      confidence: number;
      observations: string[];
    }];
  };
  metadata: {
    startedAt: Date;
    completedAt?: Date;
    source: 'scheduled' | 'spontaneous' | 'ai-recommended';
    createdAt: Date;
    updatedAt: Date;
  };
}

// Guided meditation content
interface IGuidedContent {
  _id: ObjectId;
  title: string;
  instructor: {
    name: string;
    bio: string;
    avatar?: string;
  };
  content: {
    description: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    type: string;
    categories: string[];
    tags: string[];
  };
  media: {
    audioUrl: string;
    thumbnailUrl?: string;
    transcription?: string; // For accessibility
  };
  engagement: {
    rating: number;
    totalRatings: number;
    completionRate: number;
    totalSessions: number;
  };
  ai: {
    recommendationScore: number;
    effectivenessScore: number;
    userMatchingCriteria: [{
      criteria: string;
      weight: number;
    }];
  };
  subscription: {
    isPremium: boolean;
    requiredPlan: string[];
  };
  metadata: {
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'archived' | 'draft';
  };
}
```

### Smart Wellness Tracking
```typescript
interface IWellnessGoal {
  _id: ObjectId;
  userId: ObjectId;
  goal: {
    title: string;
    description: string;
    category: 'mindfulness' | 'physical' | 'emotional' | 'social' | 'rest' | 'nutrition';
    type: 'habit' | 'milestone' | 'numeric' | 'duration';
    target: {
      value: number;
      unit: string; // days, sessions, hours, minutes, etc.
      frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    };
    current: {
      value: number;
      lastUpdated: Date;
    };
    timeline: {
      startDate: Date;
      targetDate: Date;
      completedDate?: Date;
    };
  };
  progress: [{
    date: Date;
    value: number;
    notes?: string;
    source: 'manual' | 'auto' | 'ai-tracked';
  }];
  ai: {
    difficulty: number; // AI-assessed difficulty 1-10
    likelihood: number; // AI-predicted likelihood of success 0-1
    suggestions: [{
      type: string;
      suggestion: string;
      implementationDate?: Date;
    }];
    insights: [{
      observation: string;
      confidence: number;
      actionable: boolean;
    }];
  };
  motivation: {
    whyImportant: string;
    rewards: string[];
    consequences: string[];
    motivationalQuotes: string[];
  };
  metadata: {
    status: 'active' | 'completed' | 'paused' | 'archived';
    priority: number; // 1-5
    createdAt: Date;
    updatedAt: Date;
  };
}

// Habit tracking with smart patterns
interface IHabitCompletion {
  _id: ObjectId;
  userId: ObjectId;
  habitId?: ObjectId; // Reference to habit goal
  habit: {
    name: string;
    category: string;
    targetFrequency: string;
  };
  completion: {
    date: Date;
    completed: boolean;
    quality?: number; // 1-5 how well they did it
    notes?: string;
    duration?: number; // For time-based habits
  };
  context: {
    timeOfDay: string;
    location?: string;
    mood?: number;
    energy?: number;
  };
  ai: {
    streakCount: number;
    consistencyScore: number; // 0-1
    optimalTiming: {
      timeOfDay: string;
      dayOfWeek: string;
      confidence: number;
    };
    barriers: [{
      barrier: string;
      frequency: number;
      severity: number;
    }];
  };
  metadata: {
    source: 'manual' | 'reminder' | 'ai-suggested';
    createdAt: Date;
  };
}
```

## Smart Algorithms & Data Processing

### AI-Ready Data Pipeline
```typescript
class WellnessAnalytics {
  
  // Smart mood pattern detection
  async analyzeMoodPatterns(userId: ObjectId, timeframe: number = 30): Promise<MoodInsights> {
    const pipeline = [
      { $match: { userId, 'metadata.loggedAt': { $gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$metadata.loggedAt' },
            hour: { $hour: '$metadata.loggedAt' }
          },
          avgMood: { $avg: '$moodData.primaryMood' },
          avgEnergy: { $avg: '$moodData.energyLevel' },
          avgStress: { $avg: '$moodData.stressLevel' },
          count: { $sum: 1 },
          factors: { $push: '$context.factors' }
        }
      },
      {
        $addFields: {
          patterns: {
            bestTimeOfDay: { $max: '$avgMood' },
            worstTimeOfDay: { $min: '$avgMood' },
            moodVariability: { $stdDevPop: '$avgMood' }
          }
        }
      }
    ];
    
    const results = await MoodEntry.aggregate(pipeline);
    return this.generateMoodInsights(results);
  }

  // Meditation effectiveness correlation
  async correlateMeditationWithMood(userId: ObjectId): Promise<CorrelationInsights> {
    const pipeline = [
      {
        $facet: {
          meditations: [
            { $match: { userId, 'session.completed': true } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$metadata.startedAt' } },
                totalDuration: { $sum: '$session.actualDuration' },
                avgRelaxation: { $avg: '$experience.relaxation' },
                sessionCount: { $sum: 1 }
              }
            }
          ],
          moods: [
            { $match: { userId } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$metadata.loggedAt' } },
                avgMood: { $avg: '$moodData.primaryMood' },
                avgStress: { $avg: '$moodData.stressLevel' }
              }
            }
          ]
        }
      }
    ];
    
    // Process correlation analysis
    return this.calculateCorrelation(await this.aggregateData(pipeline));
  }

  // Predictive habit success scoring
  async predictHabitSuccess(userId: ObjectId, habitData: Partial<IWellnessGoal>): Promise<SuccessPrediction> {
    const userHistory = await this.getUserWellnessHistory(userId);
    const similarHabits = await this.findSimilarHabits(habitData);
    
    return {
      successProbability: this.calculateSuccessProbability(userHistory, similarHabits, habitData),
      riskFactors: this.identifyRiskFactors(userHistory, habitData),
      recommendations: this.generateHabitRecommendations(userHistory, habitData),
      optimalSchedule: this.suggestOptimalSchedule(userHistory, habitData)
    };
  }

  // Crisis risk assessment
  async assessCrisisRisk(userId: ObjectId): Promise<CrisisRiskAssessment> {
    const recentData = await this.getRecentWellnessData(userId, 7); // Last 7 days
    
    const riskFactors = {
      moodTrend: this.calculateMoodTrend(recentData.moods),
      stressLevel: this.calculateAverageStress(recentData.moods),
      sleepPattern: this.analyzeSleepPatterns(recentData.habits),
      activityLevel: this.calculateActivityLevel(recentData.habits),
      socialEngagement: this.assessSocialEngagement(recentData.moods)
    };
    
    const riskScore = this.calculateOverallRiskScore(riskFactors);
    
    return {
      riskScore,
      riskLevel: this.categorizeRiskLevel(riskScore),
      triggerFactors: this.identifyTriggerFactors(riskFactors),
      recommendations: this.generateCrisisPreventionRecommendations(riskFactors),
      escalationNeeded: riskScore > 0.7 // Threshold for professional intervention
    };
  }
}
```

### Intelligent Recommendation Engine
```typescript
class AIRecommendationEngine {
  
  async generatePersonalizedRecommendations(userId: ObjectId): Promise<Recommendation[]> {
    const userProfile = await this.buildUserProfile(userId);
    const currentState = await this.assessCurrentWellnessState(userId);
    const goals = await this.getUserActiveGoals(userId);
    
    const recommendations: Recommendation[] = [];
    
    // Content recommendations
    recommendations.push(...await this.recommendContent(userProfile, currentState));
    
    // Meditation recommendations
    recommendations.push(...await this.recommendMeditation(userProfile, currentState));
    
    // Habit recommendations
    recommendations.push(...await this.recommendHabits(userProfile, goals));
    
    // Timing recommendations
    recommendations.push(...await this.recommendOptimalTiming(userProfile));
    
    return this.rankRecommendations(recommendations, userProfile);
  }

  async recommendContent(userProfile: UserProfile, currentState: WellnessState): Promise<Recommendation[]> {
    const contentPipeline = [
      {
        $match: {
          'content.categories': { $in: userProfile.interests },
          'subscription.isPremium': { $lte: userProfile.subscriptionLevel === 'premium' }
        }
      },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              { $multiply: ['$ai.recommendationScore', 0.4] },
              { $multiply: ['$engagement.rating', 0.3] },
              { $multiply: ['$engagement.completionRate', 0.3] }
            ]
          }
        }
      },
      { $sort: { relevanceScore: -1 } },
      { $limit: 10 }
    ];
    
    const content = await GuidedContent.aggregate(contentPipeline);
    return content.map(item => ({
      type: 'content',
      id: item._id,
      title: item.title,
      reason: this.generateContentRecommendationReason(item, currentState),
      priority: this.calculateContentPriority(item, currentState),
      estimatedBenefit: this.estimateContentBenefit(item, currentState)
    }));
  }
}
```

## Authentication & Security

### Enhanced JWT Strategy with MongoDB
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

class AuthenticationService {
  
  async register(userData: RegisterData): Promise<AuthResult> {
    // Enhanced password security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    const user = new User({
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName
      },
      authentication: {
        emailVerified: false,
        phoneVerified: false,
        loginCount: 0,
        passwordHistory: [hashedPassword],
        twoFactorEnabled: false
      },
      compliance: {
        termsAccepted: new Date(),
        privacyAccepted: new Date(),
        hipaaAuthorization: userData.hipaaConsent ? new Date() : undefined
      },
      metadata: {
        status: 'active',
        createdAt: new Date(),
        lastActive: new Date()
      }
    });

    await user.save();
    
    // Generate email verification token
    const verificationToken = this.generateVerificationToken(user._id);
    await this.sendVerificationEmail(user.email, verificationToken);
    
    return {
      success: true,
      user: this.sanitizeUser(user),
      message: 'Registration successful. Please verify your email.'
    };
  }

  async login(email: string, password: string, deviceInfo?: DeviceInfo): Promise<AuthResult> {
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      'metadata.status': 'active'
    });

    if (!user || !user.password) {
      await this.logFailedLogin(email, 'invalid_credentials');
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check account lockout
    if (await this.isAccountLocked(user._id)) {
      throw new AuthError('Account temporarily locked', 'ACCOUNT_LOCKED');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await this.incrementFailedLogins(user._id);
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Generate session
    const session = await this.createSession(user._id, deviceInfo);
    const tokens = this.generateTokens(user, session._id);

    // Update user login information
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          'authentication.lastLogin': new Date(),
          'metadata.lastActive': new Date()
        },
        $inc: { 'authentication.loginCount': 1 }
      }
    );

    return {
      success: true,
      user: this.sanitizeUser(user),
      tokens,
      session: session._id
    };
  }

  generateTokens(user: IUser, sessionId: ObjectId): TokenPair {
    const accessTokenPayload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      roles: ['user'], // Can be extended for admin/therapist roles
      permissions: this.getUserPermissions(user),
      sessionId: sessionId.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };

    const refreshTokenPayload = {
      userId: user._id.toString(),
      sessionId: sessionId.toString(),
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    };

    return {
      accessToken: jwt.sign(accessTokenPayload, process.env.JWT_SECRET!),
      refreshToken: jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET!)
    };
  }
}

// Session management with MongoDB
interface ISession {
  _id: ObjectId;
  userId: ObjectId;
  deviceInfo: {
    userAgent: string;
    ip: string;
    platform: string;
    browser: string;
  };
  isActive: boolean;
  lastUsed: Date;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deviceInfo: {
    userAgent: String,
    ip: String,
    platform: String,
    browser: String
  },
  isActive: { type: Boolean, default: true },
  lastUsed: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// TTL index for automatic session cleanup
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1, isActive: 1 });
```

## API Design & Routes

### RESTful API with Smart Error Handling
```typescript
// Base controller with common functionality
abstract class BaseController {
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<APIResponse<T>> {
    try {
      const result = await operation();
      
      // Log successful operation for analytics
      await this.logOperation(operationName, 'success');
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Enhanced error logging
      await this.logOperation(operationName, 'error', error);
      
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: error.message,
            details: error.details
          },
          timestamp: new Date().toISOString()
        };
      }
      
      // Handle different error types...
      throw error;
    }
  }
}

// Enhanced Mood API with AI integration
class MoodController extends BaseController {
  
  async createMoodEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await this.executeWithErrorHandling(async () => {
      const { moodData, context, notes } = req.body;
      const userId = req.user._id;

      // Validate mood data
      const validationResult = this.validateMoodEntry({ moodData, context, notes });
      if (!validationResult.isValid) {
        throw new ValidationError('Invalid mood data', validationResult.errors);
      }

      // Create mood entry
      const moodEntry = new MoodEntry({
        userId,
        moodData,
        context,
        notes,
        metadata: {
          loggedAt: new Date(),
          source: 'manual'
        }
      });

      // AI processing
      const aiAnalysis = await this.processAIAnalysis(moodEntry);
      moodEntry.ai = aiAnalysis;

      await moodEntry.save();

      // Update user wellness score
      await this.updateUserWellnessScore(userId);

      // Check for crisis risk
      const riskAssessment = await this.assessCrisisRisk(userId);
      if (riskAssessment.escalationNeeded) {
        await this.triggerCrisisProtocol(userId, riskAssessment);
      }

      // Generate insights
      const insights = await this.generateMoodInsights(userId);

      return {
        moodEntry: this.sanitizeMoodEntry(moodEntry),
        insights,
        riskAssessment: riskAssessment.riskLevel,
        recommendations: await this.generateRecommendations(userId, moodEntry)
      };
    }, 'create_mood_entry');

    res.status(201).json(result);
  }

  async getMoodInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await this.executeWithErrorHandling(async () => {
      const userId = req.user._id;
      const { timeframe = 30, includeFactors = true } = req.query;

      // Advanced analytics pipeline
      const insights = await this.generateAdvancedMoodInsights(
        userId, 
        Number(timeframe), 
        Boolean(includeFactors)
      );

      return insights;
    }, 'get_mood_insights');

    res.json(result);
  }

  private async generateAdvancedMoodInsights(
    userId: ObjectId, 
    timeframe: number, 
    includeFactors: boolean
  ): Promise<MoodInsights> {
    const pipeline = [
      {
        $match: {
          userId,
          'metadata.loggedAt': {
            $gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                avgMood: { $avg: '$moodData.primaryMood' },
                avgEnergy: { $avg: '$moodData.energyLevel' },
                avgStress: { $avg: '$moodData.stressLevel' },
                totalEntries: { $sum: 1 },
                moodVariability: { $stdDevPop: '$moodData.primaryMood' }
              }
            }
          ],
          trends: [
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: '%Y-%m-%d', date: '$metadata.loggedAt' } }
                },
                avgMood: { $avg: '$moodData.primaryMood' },
                entries: { $sum: 1 }
              }
            },
            { $sort: { '_id.date': 1 } }
          ],
          patterns: [
            {
              $group: {
                _id: {
                  dayOfWeek: { $dayOfWeek: '$metadata.loggedAt' },
                  hour: { $hour: '$metadata.loggedAt' }
                },
                avgMood: { $avg: '$moodData.primaryMood' },
                count: { $sum: 1 }
              }
            }
          ],
          ...(includeFactors && {
            factors: [
              { $unwind: '$context.factors' },
              {
                $group: {
                  _id: '$context.factors.type',
                  avgValue: { $avg: '$context.factors.value' },
                  correlation: {
                    $avg: {
                      $multiply: [
                        '$context.factors.value',
                        '$moodData.primaryMood'
                      ]
                    }
                  },
                  count: { $sum: 1 }
                }
              }
            ]
          })
        }
      }
    ];

    const [results] = await MoodEntry.aggregate(pipeline);
    return this.formatMoodInsights(results);
  }
}
```

### Smart Wellness Goal API
```typescript
class WellnessGoalController extends BaseController {
  
  async createGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await this.executeWithErrorHandling(async () => {
      const goalData = req.body;
      const userId = req.user._id;

      // AI-powered goal assessment
      const goalAssessment = await this.assessGoalViability(userId, goalData);
      
      const goal = new WellnessGoal({
        userId,
        ...goalData,
        ai: {
          difficulty: goalAssessment.difficulty,
          likelihood: goalAssessment.likelihood,
          suggestions: goalAssessment.suggestions
        },
        metadata: {
          status: 'active',
          priority: goalAssessment.recommendedPriority
        }
      });

      await goal.save();

      // Create automated tracking if applicable
      if (goal.goal.type === 'habit') {
        await this.setupHabitTracking(goal._id, userId);
      }

      return {
        goal: this.sanitizeGoal(goal),
        assessment: goalAssessment,
        actionPlan: await this.generateActionPlan(goal)
      };
    }, 'create_wellness_goal');

    res.status(201).json(result);
  }

  async updateGoalProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await this.executeWithErrorHandling(async () => {
      const { goalId } = req.params;
      const { progress, notes } = req.body;
      const userId = req.user._id;

      const goal = await WellnessGoal.findOne({ _id: goalId, userId });
      if (!goal) {
        throw new NotFoundError('Goal not found');
      }

      // Update progress
      goal.progress.push({
        date: new Date(),
        value: progress,
        notes,
        source: 'manual'
      });

      goal.goal.current.value = progress;
      goal.goal.current.lastUpdated = new Date();

      // Check if goal is completed
      if (progress >= goal.goal.target.value) {
        goal.goal.timeline.completedDate = new Date();
        goal.metadata.status = 'completed';
        
        // Trigger achievement system
        await this.checkAchievements(userId, goal);
      }

      await goal.save();

      // Generate updated insights
      const insights = await this.generateGoalInsights(goal);

      return {
        goal: this.sanitizeGoal(goal),
        insights,
        recommendations: await this.generateProgressRecommendations(goal)
      };
    }, 'update_goal_progress');

    res.json(result);
  }

  private async assessGoalViability(userId: ObjectId, goalData: any): Promise<GoalAssessment> {
    const userHistory = await this.getUserGoalHistory(userId);
    const userProfile = await this.buildUserProfile(userId);
    
    return {
      difficulty: this.calculateGoalDifficulty(goalData, userHistory),
      likelihood: this.predictSuccessLikelihood(goalData, userHistory, userProfile),
      suggestions: this.generateGoalSuggestions(goalData, userHistory),
      recommendedPriority: this.calculateRecommendedPriority(goalData, userProfile),
      estimatedTimeframe: this.estimateCompletionTimeframe(goalData, userHistory)
    };
  }
}
```

## Real-time Features

### WebSocket Implementation with Smart Notifications
```typescript
class WellnessWebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketConnection> = new Map();

  constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private async authenticateSocket(socket: Socket, next: Function): Promise<void> {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      
      socket.userId = decoded.userId;
      socket.sessionId = decoded.sessionId;
      
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  }

  private handleConnection(socket: Socket): void {
    const userId = socket.userId;
    
    // Store connection
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      userId,
      connectedAt: new Date(),
      lastActivity: new Date()
    });

    // Set up event listeners
    this.setupSocketEventListeners(socket);

    // Send initial data
    this.sendInitialData(socket);

    socket.on('disconnect', () => {
      this.connectedUsers.delete(userId);
    });
  }

  private setupSocketEventListeners(socket: Socket): void {
    // Meditation session events
    socket.on('meditation:start', async (data: MeditationStartData) => {
      await this.handleMeditationStart(socket, data);
    });

    socket.on('meditation:pause', async (data: { sessionId: string }) => {
      await this.handleMeditationPause(socket, data);
    });

    socket.on('meditation:complete', async (data: MeditationCompleteData) => {
      await this.handleMeditationComplete(socket, data);
    });

    // Mood tracking events
    socket.on('mood:quick-check', async (data: QuickMoodData) => {
      await this.handleQuickMoodCheck(socket, data);
    });

    // Crisis events
    socket.on('crisis:help-needed', async (data: CrisisData) => {
      await this.handleCrisisEvent(socket, data);
    });

    // Activity tracking
    socket.on('activity:heartbeat', () => {
      this.updateUserActivity(socket.userId);
    });
  }

  private async handleMeditationStart(socket: Socket, data: MeditationStartData): Promise<void> {
    const session = await this.createMeditationSession(socket.userId, data);
    
    // Send session tracking data
    socket.emit('meditation:session-started', {
      sessionId: session._id,
      guidance: await this.getSessionGuidance(session),
      reminders: this.calculateSessionReminders(session)
    });

    // Schedule progress check-ins
    this.scheduleSessionCheckIns(socket, session);
  }

  private async handleCrisisEvent(socket: Socket, data: CrisisData): Promise<void> {
    const userId = socket.userId;
    
    // Log crisis incident
    const incident = await this.logCrisisIncident(userId, data);
    
    // Assess severity
    const riskAssessment = await this.assessCrisisRisk(userId);
    
    // Send immediate resources
    socket.emit('crisis:immediate-resources', {
      resources: await this.getCrisisResources(data.severity, data.location),
      hotlines: this.getEmergencyHotlines(data.location),
      urgency: riskAssessment.riskLevel
    });

    // Notify emergency contacts if severe
    if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'critical') {
      await this.notifyEmergencyContacts(userId, incident);
    }

    // Schedule follow-up
    await this.scheduleFollowUp(userId, incident);
  }

  // Smart notification system
  async sendPersonalizedNotification(userId: string, type: NotificationType): Promise<void> {
    const user = await User.findById(userId);
    if (!user || !this.connectedUsers.has(userId)) return;

    const notification = await this.generatePersonalizedNotification(user, type);
    const socket = this.io.sockets.sockets.get(this.connectedUsers.get(userId)!.socketId);

    if (socket) {
      socket.emit('notification:personalized', notification);
    }

    // Also send push notification if user is offline
    if (!socket) {
      await this.sendPushNotification(user, notification);
    }
  }

  private async generatePersonalizedNotification(user: IUser, type: NotificationType): Promise<PersonalizedNotification> {
    const userProfile = await this.buildUserProfile(user._id);
    const currentContext = await this.getCurrentUserContext(user._id);

    switch (type) {
      case 'meditation_reminder':
        return this.generateMeditationReminder(userProfile, currentContext);
      
      case 'mood_check_in':
        return this.generateMoodCheckInReminder(userProfile, currentContext);
      
      case 'achievement_unlocked':
        return this.generateAchievementNotification(userProfile);
      
      default:
        return this.generateGenericNotification(type);
    }
  }
}
```

## AI Integration Framework

### Extensible AI Service Layer
```typescript
interface AIIntegrationConfig {
  claudeAPI: {
    enabled: boolean;
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  customModels: {
    moodAnalysis: boolean;
    crisisDetection: boolean;
    recommendationEngine: boolean;
  };
  features: {
    chatbot: boolean;
    personalizedInsights: boolean;
    crisisIntervention: boolean;
    contentRecommendation: boolean;
  };
}

class AIService {
  private claudeClient: AnthropicAPI;
  private config: AIIntegrationConfig;

  constructor(config: AIIntegrationConfig) {
    this.config = config;
    if (config.claudeAPI.enabled) {
      this.claudeClient = new AnthropicAPI({
        apiKey: config.claudeAPI.apiKey
      });
    }
  }

  // Chat-based wellness coaching
  async generateWellnessResponse(userId: ObjectId, message: string, context: WellnessContext): Promise<AIResponse> {
    if (!this.config.claudeAPI.enabled) {
      return this.generateFallbackResponse(message, context);
    }

    const userProfile = await this.buildComprehensiveUserProfile(userId);
    const conversationHistory = await this.getRecentConversations(userId, 10);

    const prompt = this.buildWellnessCoachingPrompt(userProfile, context, message, conversationHistory);

    try {
      const response = await this.claudeClient.messages.create({
        model: this.config.claudeAPI.model,
        max_tokens: this.config.claudeAPI.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const aiResponse = this.parseClaudeResponse(response);
      
      // Store conversation for learning
      await this.storeConversation(userId, message, aiResponse);
      
      return {
        content: aiResponse.content,
        suggestions: aiResponse.suggestions,
        resources: aiResponse.resources,
        followUpQuestions: aiResponse.followUpQuestions,
        confidence: aiResponse.confidence
      };
    } catch (error) {
      console.error('Claude API error:', error);
      return this.generateFallbackResponse(message, context);
    }
  }

  // Crisis detection and intervention
  async analyzeForCrisisRisk(userId: ObjectId, content: string, context: any): Promise<CrisisAnalysis> {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'worthless', 'hopeless',
      'can\'t go on', 'nobody cares', 'better off dead', 'hurt myself'
    ];

    const riskLevel = this.calculateBasicRiskLevel(content, crisisKeywords);

    if (this.config.claudeAPI.enabled && riskLevel > 0.3) {
      const prompt = this.buildCrisisAnalysisPrompt(content, context);
      
      try {
        const response = await this.claudeClient.messages.create({
          model: this.config.claudeAPI.model,
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        return this.parseCrisisAnalysis(response, riskLevel);
      } catch (error) {
        console.error('Crisis analysis error:', error);
        return this.generateFallbackCrisisAnalysis(riskLevel);
      }
    }

    return {
      riskLevel,
      riskFactors: this.identifyBasicRiskFactors(content),
      recommendations: this.generateBasicRecommendations(riskLevel),
      immediateAction: riskLevel > 0.7
    };
  }

  // Personalized insight generation
  async generatePersonalizedInsights(userId: ObjectId): Promise<PersonalizedInsights> {
    const userData = await this.gatherUserData(userId);
    const patterns = await this.identifyPatterns(userData);

    if (this.config.claudeAPI.enabled) {
      const prompt = this.buildInsightGenerationPrompt(userData, patterns);
      
      try {
        const response = await this.claudeClient.messages.create({
          model: this.config.claudeAPI.model,
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        return this.parseInsightsResponse(response);
      } catch (error) {
        console.error('Insights generation error:', error);
        return this.generateFallbackInsights(patterns);
      }
    }

    return this.generateFallbackInsights(patterns);
  }

  private buildWellnessCoachingPrompt(
    userProfile: UserProfile,
    context: WellnessContext,
    message: string,
    history: ConversationEntry[]
  ): string {
    return `You are a compassionate, professional wellness coach specializing in mental health and mindfulness. 

User Profile:
- Name: ${userProfile.name}
- Primary Goals: ${userProfile.goals.join(', ')}
- Current Challenges: ${userProfile.challenges.join(', ')}
- Preferred Communication Style: ${userProfile.communicationStyle}
- Recent Mood Pattern: ${userProfile.recentMoodSummary}

Current Context:
- Time of Day: ${context.timeOfDay}
- Recent Activity: ${context.recentActivity}
- Stress Level: ${context.currentStressLevel}/10
- Energy Level: ${context.currentEnergyLevel}/10

Recent Conversation History:
${history.map(entry => `${entry.role}: ${entry.content}`).join('\n')}

User's Current Message: "${message}"

Please provide a helpful, empathetic response that:
1. Acknowledges their current state
2. Offers practical, actionable advice
3. Suggests specific techniques or exercises if appropriate
4. Maintains a warm, supportive tone
5. Avoids giving medical advice
6. Includes 2-3 follow-up questions to keep the conversation engaging

If the user expresses any signs of crisis or self-harm, prioritize their safety and direct them to appropriate resources.

Response format:
{
  "content": "Your main response here",
  "suggestions": ["actionable suggestion 1", "suggestion 2"],
  "resources": ["relevant resource 1", "resource 2"],
  "followUpQuestions": ["question 1", "question 2"],
  "confidence": 0.95
}`;
  }

  private buildCrisisAnalysisPrompt(content: string, context: any): string {
    return `Analyze the following text for signs of mental health crisis or self-harm risk. 
    Provide a risk assessment and appropriate recommendations.

Text to analyze: "${content}"

Context: ${JSON.stringify(context)}

Please assess:
1. Risk level (0.0 to 1.0)
2. Specific risk factors identified
3. Appropriate interventions
4. Whether immediate professional help is needed

Response as JSON:
{
  "riskLevel": 0.0-1.0,
  "riskFactors": ["factor1", "factor2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "immediateAction": true/false,
  "reasoning": "explanation of assessment"
}`;
  }
}

// AI conversation storage for learning
interface ConversationEntry {
  _id: ObjectId;
  userId: ObjectId;
  role: 'user' | 'assistant';
  content: string;
  context: {
    timestamp: Date;
    sessionId: string;
    userState: any;
  };
  ai: {
    model: string;
    confidence: number;
    processingTime: number;
  };
  feedback?: {
    helpful: boolean;
    rating: number;
    comments?: string;
  };
  metadata: {
    createdAt: Date;
  };
}

const conversationSchema = new Schema<ConversationEntry>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  context: {
    timestamp: { type: Date, required: true },
    sessionId: { type: String, required: true },
    userState: { type: Schema.Types.Mixed }
  },
  ai: {
    model: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    processingTime: { type: Number }
  },
  feedback: {
    helpful: { type: Boolean },
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String }
  }
}, {
  timestamps: true
});

conversationSchema.index({ userId: 1, 'context.timestamp': -1 });
conversationSchema.index({ 'context.sessionId': 1 });
```

## Performance Optimization

### MongoDB-Specific Optimizations
```typescript
class DatabaseOptimizationService {
  
  // Intelligent indexing strategy
  async setupOptimizedIndexes(): Promise<void> {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ 'metadata.status': 1, 'metadata.lastActive': -1 });
    await User.collection.createIndex({ 'subscription.plan': 1, 'subscription.status': 1 });

    // Mood tracking indexes
    await MoodEntry.collection.createIndex({ userId: 1, 'metadata.loggedAt': -1 });
    await MoodEntry.collection.createIndex({ 'context.location': '2dsphere' });
    await MoodEntry.collection.createIndex({ 
      userId: 1, 
      'moodData.primaryMood': 1, 
      'metadata.loggedAt': -1 
    });

    // Meditation indexes
    await MeditationSession.collection.createIndex({ userId: 1, 'metadata.startedAt': -1 });
    await MeditationSession.collection.createIndex({ 
      userId: 1, 
      'session.type': 1, 
      'session.completed': 1 
    });

    // Wellness goals indexes
    await WellnessGoal.collection.createIndex({ userId: 1, 'metadata.status': 1 });
    await WellnessGoal.collection.createIndex({ 
      userId: 1, 
      'goal.category': 1, 
      'metadata.priority': -1 
    });

    // Session cleanup indexes
    await Session.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await Session.collection.createIndex({ userId: 1, isActive: 1 });
  }

  // Smart aggregation pipelines
  generateOptimizedPipeline(queryType: string, params: any): any[] {
    switch (queryType) {
      case 'mood_analytics':
        return this.buildMoodAnalyticsPipeline(params);
      case 'wellness_dashboard':
        return this.buildWellnessDashboardPipeline(params);
      case 'habit_insights':
        return this.buildHabitInsightsPipeline(params);
      default:
        throw new Error(`Unknown query type: ${queryType}`);
    }
  }

  private buildMoodAnalyticsPipeline(params: { userId: ObjectId, timeframe: number }): any[] {
    return [
      // Stage 1: Match recent entries for user
      {
        $match: {
          userId: params.userId,
          'metadata.loggedAt': {
            $gte: new Date(Date.now() - params.timeframe * 24 * 60 * 60 * 1000)
          }
        }
      },
      // Stage 2: Add computed fields
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: '$metadata.loggedAt' },
          hour: { $hour: '$metadata.loggedAt' },
          week: { $week: '$metadata.loggedAt' }
        }
      },
      // Stage 3: Multi-faceted aggregation
      {
        $facet: {
          // Overall statistics
          overview: [
            {
              $group: {
                _id: null,
                avgMood: { $avg: '$moodData.primaryMood' },
                minMood: { $min: '$moodData.primaryMood' },
                maxMood: { $max: '$moodData.primaryMood' },
                totalEntries: { $sum: 1 },
                moodVariability: { $stdDevPop: '$moodData.primaryMood' }
              }
            }
          ],
          // Daily trends
          dailyTrends: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$metadata.loggedAt' } },
                avgMood: { $avg: '$moodData.primaryMood' },
                avgEnergy: { $avg: '$moodData.energyLevel' },
                avgStress: { $avg: '$moodData.stressLevel' },
                entries: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          // Time patterns
          timePatterns: [
            {
              $group: {
                _id: { dayOfWeek: '$dayOfWeek', hour: '$hour' },
                avgMood: { $avg: '$moodData.primaryMood' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } }
          ],
          // Factor analysis
          factorAnalysis: [
            { $unwind: '$context.factors' },
            {
              $group: {
                _id: '$context.factors.type',
                avgFactorValue: { $avg: '$context.factors.value' },
                avgMoodWhenPresent: { $avg: '$moodData.primaryMood' },
                correlation: {
                  $avg: {
                    $multiply: ['$context.factors.value', '$moodData.primaryMood']
                  }
                },
                frequency: { $sum: 1 }
              }
            },
            { $sort: { correlation: -1 } }
          ]
        }
      }
    ];
  }

  // Caching strategy
  async getCachedResult<T>(key: string, generator: () => Promise<T>, ttl: number = 3600): Promise<T> {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await generator();
    await redis.setex(key, ttl, JSON.stringify(result));
    return result;
  }

  // Query optimization
  optimizeQuery(query: any): any {
    // Add query hints for better performance
    return {
      ...query,
      hint: this.getOptimalIndex(query),
      lean: true, // Return plain objects instead of Mongoose documents
      allowDiskUse: true // Allow disk usage for large aggregations
    };
  }
}
```

## Crisis Management System

### Enhanced Crisis Detection & Response
```typescript
class CrisisManagementService {
  
  async assessCrisisRisk(userId: ObjectId): Promise<CrisisRiskAssessment> {
    const timeframe = 7; // days
    const recentData = await this.gatherRecentUserData(userId, timeframe);
    
    const riskFactors = {
      moodDecline: this.assessMoodDecline(recentData.moods),
      stressEscalation: this.assessStressLevels(recentData.moods),
      socialWithdrawal: this.assessSocialPatterns(recentData.activities),
      sleepDisruption: this.assessSleepPatterns(recentData.habits),
      behaviorChanges: this.assessBehaviorChanges(recentData.habits),
      expressedConcerns: this.analyzeTextualContent(recentData.notes)
    };

    const riskScore = this.calculateCompositeRiskScore(riskFactors);
    const riskLevel = this.categorizeRiskLevel(riskScore);

    // AI-enhanced risk assessment if available
    if (this.aiService.isAvailable()) {
      const aiAssessment = await this.aiService.analyzeCrisisRisk(userId, recentData);
      riskScore = this.combineRiskScores(riskScore, aiAssessment.riskScore);
    }

    return {
      riskScore,
      riskLevel,
      riskFactors,
      recommendations: this.generateRiskMitigationRecommendations(riskFactors),
      resources: await this.getCrisisResources(riskLevel),
      escalationProtocol: this.getEscalationProtocol(riskLevel),
      followUpSchedule: this.generateFollowUpSchedule(riskLevel),
      emergencyContacts: await this.getEmergencyContacts(userId)
    };
  }

  async triggerCrisisResponse(userId: ObjectId, severity: CrisisSeverity, context?: any): Promise<CrisisResponse> {
    // Log crisis incident
    const incident = await this.logCrisisIncident(userId, severity, context);
    
    // Get crisis protocol for severity level
    const protocol = this.getCrisisProtocol(severity);
    
    // Execute immediate response
    const immediateResponse = await this.executeImmediateResponse(userId, protocol);
    
    // Schedule follow-up
    await this.scheduleFollowUp(userId, incident, protocol.followUpSchedule);
    
    // Notify relevant parties
    await this.executeNotificationProtocol(userId, incident, protocol);
    
    return {
      incidentId: incident._id,
      immediateResources: immediateResponse.resources,
      nextSteps: immediateResponse.nextSteps,
      emergencyContacts: immediateResponse.emergencyContacts,
      followUpScheduled: protocol.followUpSchedule
    };
  }

  private getCrisisProtocol(severity: CrisisSeverity): CrisisProtocol {
    const protocols: Record<CrisisSeverity, CrisisProtocol> = {
      low: {
        responseTime: '24 hours',
        resources: ['self-help-resources', 'guided-meditation', 'support-groups'],
        escalation: 'monitor',
        followUpSchedule: 'daily-check-in',
        notifications: ['user-app-notification']
      },
      moderate: {
        responseTime: '6 hours',
        resources: ['crisis-text-line', 'online-counseling', 'mindfulness-exercises'],
        escalation: 'therapist-referral',
        followUpSchedule: 'twice-daily-check-in',
        notifications: ['user-app-notification', 'email-notification']
      },
      high: {
        responseTime: '2 hours',
        resources: ['crisis-hotline', 'immediate-counseling', 'emergency-contacts'],
        escalation: 'professional-intervention',
        followUpSchedule: 'hourly-check-in',
        notifications: ['user-emergency-notification', 'emergency-contact-notification']
      },
      critical: {
        responseTime: 'immediate',
        resources: ['911', 'suicide-prevention-hotline', 'emergency-services'],
        escalation: 'emergency-services',
        followUpSchedule: 'continuous-monitoring',
        notifications: ['emergency-services', 'emergency-contact-notification', 'admin-alert']
      }
    };

    return protocols[severity];
  }

  // Smart crisis prediction
  async predictCrisisRisk(userId: ObjectId): Promise<CrisisPrediction> {
    const userHistory = await this.getUserCrisisHistory(userId);
    const currentState = await this.getCurrentUserState(userId);
    const patterns = await this.identifyRiskPatterns(userHistory);

    // Machine learning model for prediction (simplified)
    const predictionScore = this.calculatePredictionScore(currentState, patterns);
    
    return {
      probabilityScore: predictionScore,
      timeframe: this.estimateTimeframe(predictionScore, patterns),
      triggerFactors: this.identifyTriggerFactors(currentState, patterns),
      preventiveActions: this.generatePreventiveActions(predictionScore, patterns),
      monitoringPlan: this.createMonitoringPlan(predictionScore)
    };
  }
}

// Crisis incident tracking
interface ICrisisIncident {
  _id: ObjectId;
  userId: ObjectId;
  severity: CrisisSeverity;
  context: {
    triggerEvent?: string;
    location?: string;
    timeOfDay: string;
    userReportedState: any;
    systemDetectedFactors: string[];
  };
  response: {
    resourcesProvided: string[];
    interventionType: string;
    responseTime: number; // minutes
    professionalContactMade: boolean;
    emergencyServicesContacted: boolean;
  };
  outcome: {
    resolved: boolean;
    resolvedAt?: Date;
    followUpCompleted: boolean;
    userFeedback?: string;
    effectivenessRating?: number;
  };
  followUp: [{
    scheduledAt: Date;
    completedAt?: Date;
    method: 'app' | 'call' | 'text' | 'email';
    outcome: string;
    nextAction?: string;
  }];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    handledBy: string; // system, therapist, emergency-services
  };
}
```

## Deployment & Infrastructure

### Docker & MongoDB Cluster Setup
```dockerfile
# Dockerfile for Node.js backend
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml for development
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/cleared_mind
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-jwt-secret
      - CLAUDE_API_KEY=your-claude-key
    depends_on:
      - mongo
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=cleared_mind
    volumes:
      - mongo_data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mongo-express:
    image: mongo-express
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
      - ME_CONFIG_MONGODB_ADMINPASSWORD=password
      - ME_CONFIG_MONGODB_SERVER=mongo
    depends_on:
      - mongo

volumes:
  mongo_data:
  redis_data:
```

### Production MongoDB Cluster Configuration
```javascript
// MongoDB replica set configuration
const replicaSetConfig = {
  _id: "cleared-mind-rs",
  members: [
    { _id: 0, host: "mongo-primary:27017", priority: 2 },
    { _id: 1, host: "mongo-secondary-1:27017", priority: 1 },
    { _id: 2, host: "mongo-secondary-2:27017", priority: 1 },
    { _id: 3, host: "mongo-arbiter:27017", arbiterOnly: true }
  ]
};

// Sharding configuration for scale
const shardingConfig = {
  configDB: "cleared-mind-config/config-1:27017,config-2:27017,config-3:27017",
  shards: [
    { _id: "shard01", host: "shard01-rs/shard01-1:27017,shard01-2:27017,shard01-3:27017" },
    { _id: "shard02", host: "shard02-rs/shard02-1:27017,shard02-2:27017,shard02-3:27017" }
  ],
  collections: [
    { db: "cleared_mind", collection: "moodentries", key: { userId: 1, createdAt: 1 } },
    { db: "cleared_mind", collection: "meditationsessions", key: { userId: 1, createdAt: 1 } },
    { db: "cleared_mind", collection: "conversations", key: { userId: 1, createdAt: 1 } }
  ]
};
```

### Environment Configuration
```typescript
// config/environment.ts
export const config = {
  development: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cleared_mind_dev',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 2
      }
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    },
    ai: {
      claude: {
        apiKey: process.env.CLAUDE_API_KEY,
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000
      }
    }
  },
  production: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 50,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        ssl: true,
        sslValidate: true,
        authSource: 'admin'
      }
    },
    redis: {
      url: process.env.REDIS_URL,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000
    },
    ai: {
      claude: {
        apiKey: process.env.CLAUDE_API_KEY,
        model: 'claude-3-opus-20240229',
        maxTokens: 2000
      }
    }
  }
};
```

## Implementation Roadmap

### Phase 1: Core Infrastructure (3 weeks)
- [x] MongoDB schema design and validation
- [x] Authentication system with JWT
- [x] Basic CRUD operations for users
- [x] Security middleware and rate limiting
- [x] Docker development environment

### Phase 2: Wellness Features (4 weeks)
- [x] Mood tracking system with AI-ready structure
- [x] Meditation session management
- [x] Habit tracking and goal management
- [x] Real-time WebSocket implementation
- [x] Basic analytics and insights

### Phase 3: AI Integration (3 weeks)
- [x] Claude API integration framework
- [x] Conversation management system
- [x] Crisis detection algorithms
- [x] Personalized recommendation engine
- [x] AI-powered insights generation

### Phase 4: Production Readiness (2 weeks)
- [x] MongoDB optimization and indexing
- [x] Caching strategy implementation
- [x] Monitoring and logging setup
- [x] Crisis management protocols
- [x] Performance testing and optimization

### Phase 5: Advanced Features (2 weeks)
- [x] Advanced analytics dashboard
- [x] Achievement system
- [x] Content management system
- [x] Admin panel APIs
- [x] Comprehensive testing suite

---

This MongoDB-based backend architecture provides a solid foundation for the Cleared Mind wellness application, with smart algorithms, efficient data structures, and seamless AI integration capabilities. The system is designed to scale efficiently while maintaining HIPAA compliance and providing exceptional user experience.