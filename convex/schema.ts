// convex/schema.ts (исправленная версия с синхронизацией)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    bio: v.optional(v.string()),                    // Биография/О себе
    birthDate: v.optional(v.string()),              // Дата рождения
    location: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
    faceRecognitionEnabled: v.optional(v.boolean()),
    faceDescriptorUpdatedAt: v.optional(v.number()),
    preferences: v.optional(v.object({
      notifications: v.optional(v.object({
        email: v.optional(v.boolean()),
        push: v.optional(v.boolean()),
        sms: v.optional(v.boolean()),
      })),
      language: v.optional(v.string()),
      timezone: v.optional(v.string()),
      theme: v.optional(v.string()),
    })),

    googleId: v.optional(v.string()),
    githubId: v.optional(v.string()),
    avatar: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),

    emailNotifications: v.optional(v.boolean()),  // Дублирование для совместимости
    smsNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),

    // Дополнительные настройки
    showProfile: v.optional(v.boolean()),         // Показывать профиль другим
    allowMessages: v.optional(v.boolean()),       // Разрешить сообщения
    marketingEmails: v.optional(v.boolean()),

    phone: v.optional(v.string()),
    department: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_googleId", ["googleId"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("by_face_recognition", ["faceRecognitionEnabled"])
    .index("email_active", ["email", "isActive"])
    .index("role_active", ["role", "isActive"]),
  messages: defineTable({
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement"),
      v.literal("notification")
    ),
    subject: v.optional(v.string()),
    content: v.string(),
    senderId: v.id("users"),
    senderName: v.string(),
    recipientIds: v.array(v.id("users")),
    recipientNames: v.array(v.string()),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    ),
    readAt: v.record(v.string(), v.string()),
    isArchived: v.boolean(),
    scheduledAt: v.optional(v.number()), // Добавляем это поле
    metadata: v.optional(v.object({
      tags: v.optional(v.array(v.string())),
      relatedTo: v.optional(v.object({
        type: v.string(),
        id: v.string(),
        title: v.string(),
      })),
      templateInfo: v.optional(v.object({
        templateId: v.string(),
        templateName: v.string(),
        variables: v.record(v.string(), v.string()),
        batchId: v.string(),
      })),
      digestInfo: v.optional(v.object({
        type: v.string(),
        period: v.object({
          start: v.number(),
          end: v.number(),
        }),
        includedMessages: v.array(v.string()),
        stats: v.any(),
      })),
    })),
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_sender", ["senderId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_group", ["groupId"])
    .index("by_archived", ["isArchived"])
    .index("by_priority", ["priority"])
    .index("sender_type", ["senderId", "type"])
    .index("type_status", ["type", "status"])
    .index("archived_status", ["isArchived", "status"])
    .index("priority_status", ["priority", "status"]),

    bodyAnalyses: defineTable({
    userId: v.string(),
    bodyType: v.union(
      v.literal("ectomorph"),
      v.literal("mesomorph"),
      v.literal("endomorph"),
      v.literal("mixed")
    ),
    estimatedBodyFat: v.number(),
    estimatedMuscleMass: v.number(),
    posture: v.union(v.literal("good"), v.literal("fair"), v.literal("poor")),
    fitnessScore: v.number(),
    progressPotential: v.number(),
    problemAreas: v.array(
      v.object({
        area: v.union(
          v.literal("живот"),
          v.literal("бедра"),
          v.literal("руки"),
          v.literal("спина"),
          v.literal("грудь")
        ),
        severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
        recommendation: v.string(),
      })
    ),
    recommendations: v.object({
      primaryGoal: v.string(),
      secondaryGoals: v.array(v.string()),
      estimatedTimeToGoal: v.number(),
      weeklyTrainingHours: v.number(),
    }),
    currentVisualData: v.object({
      imageUrl: v.string(),
      analyzedImageUrl: v.optional(v.string()),
      bodyOutlineData: v.optional(v.any()),
    }),
    futureProjections: v.object({
      weeks4: v.object({
        estimatedWeight: v.number(),
        estimatedBodyFat: v.number(),
        estimatedMuscleMass: v.number(),
        confidenceLevel: v.number(),
      }),
      weeks8: v.object({
        estimatedWeight: v.number(),
        estimatedBodyFat: v.number(),
        estimatedMuscleMass: v.number(),
        confidenceLevel: v.number(),
      }),
      weeks12: v.object({
        estimatedWeight: v.number(),
        estimatedBodyFat: v.number(),
        estimatedMuscleMass: v.number(),
        confidenceLevel: v.number(),
      }),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Чекпоинты прогресса
  progressCheckpoints: defineTable({
    userId: v.string(),
    analysisId: v.id("bodyAnalyses"),
    weight: v.number(),
    bodyFat: v.number(),
    muscleMass: v.number(),
    photoUrl: v.string(),
    aiScore: v.number(),
    achievements: v.optional(v.array(v.string())),
    comparisonWithProjection: v.optional(v.object({
      onTrack: v.boolean(),
      deviationPercent: v.number(),
    })),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_analysis", ["analysisId"]),

  // Лидерборд трансформаций
  transformationLeaderboard: defineTable({
    userId: v.string(),
    userName: v.string(),
    userImageUrl: v.optional(v.string()),
    analysisId: v.id("bodyAnalyses"),
    startWeight: v.number(),
    currentWeight: v.number(),
    weightLost: v.number(),
    bodyFatLost: v.number(),
    muscleMassGained: v.number(),
    weeks: v.number(),
    score: v.number(),
    isActive: v.boolean(),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("score_active", ["isActive", "score"])
    .index("user_active", ["userId", "isActive"]),

  // Персонализированные планы
  personalizedPlans: defineTable({
    userId: v.string(),
    analysisId: v.id("bodyAnalyses"),
    recommendedTrainer: v.object({
      id: v.string(),
      name: v.string(),
      specialty: v.string(),
      matchScore: v.number(),
      reason: v.string(),
    }),
    trainingProgram: v.object({
      id: v.string(),
      name: v.string(),
      duration: v.number(),
      sessionsPerWeek: v.number(),
      focusAreas: v.array(v.string()),
    }),
    nutritionPlan: v.object({
      dailyCalories: v.number(),
      macros: v.object({
        protein: v.number(),
        carbs: v.number(),
        fats: v.number(),
      }),
    }),
    recommendedProducts: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        purpose: v.string(),
        timing: v.string(),
        monthlyBudget: v.number(),
        importance: v.union(
          v.literal("essential"),
          v.literal("recommended"),
          v.literal("optional")
        ),
      })
    ),
    membershipRecommendation: v.object({
      type: v.string(),
      reason: v.string(),
      features: v.array(v.string()),
      price: v.number(),
      savings: v.number(),
    }),
    projectedResults: v.object({
      week4: v.string(),
      week8: v.string(),
      week12: v.string(),
      successProbability: v.number(),
    }),
    createdAt: v.number(),
  }).index("by_analysis", ["analysisId"]),

  // Достижения пользователей
  userAchievements: defineTable({
    userId: v.string(),
    achievementId: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    unlockedAt: v.number(),
    reward: v.optional(v.object({
      type: v.union(
        v.literal("discount"),
        v.literal("product"),
        v.literal("session"),
        v.literal("badge")
      ),
      value: v.string(),
    })),
  })
    .index("by_user", ["userId"])
    .index("user_achievement", ["userId", "achievementId"]),

  // Бонусы пользователей
  userBonuses: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("discount"),
      v.literal("product"),
      v.literal("session"),
      v.literal("badge")
    ),
    value: v.string(),
    description: v.string(),
    isUsed: v.boolean(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  messageGroups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    memberIds: v.array(v.id("users")),
    memberNames: v.array(v.string()),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    groupType: v.union(
      v.literal("manual"),
      v.literal("auto"),
      v.literal("role-based")
    ),
    rules: v.optional(v.object({
      roles: v.optional(v.array(v.string())),
      departments: v.optional(v.array(v.string())),
      conditions: v.optional(v.array(v.string())),
    })),
    settings: v.optional(v.object({
      allowSelfJoin: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      maxMembers: v.optional(v.number()),
    })),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_creator", ["createdBy"])
    .index("by_type", ["groupType"])
    .index("by_active", ["isActive"])
    .index("creator_active", ["createdBy", "isActive"])
    .index("type_active", ["groupType", "isActive"])
  ,

  faceProfiles: defineTable({
    userId: v.id("users"),
    faceDescriptor: v.array(v.number()), // Дескриптор лица
    confidence: v.number(),
    registeredAt: v.number(),
    lastUsed: v.optional(v.number()),
    isActive: v.boolean(),
    metadata: v.optional(v.object({
      registrationMethod: v.string(),
      userAgent: v.optional(v.string()),
      deviceInfo: v.optional(v.string())
    }))
  })
    .index("by_user", ["userId"])
    .index("by_active", ["isActive"]),

  notificationTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push"),
      v.literal("in-app")
    ),
    subject: v.string(),
    content: v.string(),
    variables: v.array(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    category: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    settings: v.optional(v.object({
      allowScheduling: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      maxRecipients: v.optional(v.number()),
    })),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_creator", ["createdBy"])
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("by_category", ["category"])
    .index("creator_active", ["createdBy", "isActive"])
    .index("type_active", ["type", "isActive"])
    .index("category_active", ["category", "isActive"])
  ,

  drafts: defineTable({
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement")
    ),
    subject: v.optional(v.string()),
    content: v.string(),
    recipientIds: v.array(v.id("users")),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    createdBy: v.id("users"),
    scheduledAt: v.optional(v.number()),
    templateId: v.optional(v.id("notificationTemplates")),
    lastModified: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_creator", ["createdBy"])
    .index("by_type", ["type"])
    .index("creator_type", ["createdBy", "type"])
  ,

  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("success"),
      v.literal("order"),
      v.literal("payment"),
      v.literal("membership"),
      v.literal("training"),
      v.literal("system")
    ),
    recipientId: v.string(),
    recipientType: v.union(
      v.literal("user"),
      v.literal("super-admin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("trainer"),
      v.literal("member")
    ),
    relatedId: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    metadata: v.optional(v.object({
      sourceType: v.optional(v.string()),
      sourceId: v.optional(v.string()),
      data: v.optional(v.any()),
    })),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_read_status", ["isRead"])
    .index("by_created_at", ["createdAt"])
    .index("recipient_unread", ["recipientId", "isRead"])
    .index("recipient_type", ["recipientType"])
    .index("type_created", ["type", "createdAt"])
  ,

  products: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("supplements"),
      v.literal("drinks"),
      v.literal("snacks"),
      v.literal("merchandise")
    ),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    inStock: v.number(),
    minStock: v.number(),
    isActive: v.optional(v.boolean()),
    isPopular: v.boolean(),
    isDeleted: v.optional(v.boolean()),
    nutrition: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      sugar: v.optional(v.number()),
    })),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_category", ["category"])
    .index("by_popularity", ["isPopular"])
    .index("by_active", ["isActive"])
    .index("by_deleted", ["isDeleted"])
    .index("category_active", ["category", "isActive"])
    .index("active_popular", ["isActive", "isPopular"])
  ,

  orders: defineTable({
    userId: v.optional(v.string()),
    memberId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    memberEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    memberName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    userRole: v.optional(v.string()),
    items: v.array(v.object({
      productId: v.union(v.id("products"), v.string()),
      productName: v.string(),
      quantity: v.number(),
      price: v.number(),
      totalPrice: v.number(),
    })),
    totalAmount: v.number(),
    pickupType: v.string(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentIntentId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    orderTime: v.number(),
    estimatedReadyTime: v.optional(v.number()),
    completedTime: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_member", ["memberId"])
    .index("by_status", ["status"])
    .index("by_order_time", ["orderTime"])
    .index("by_payment_status", ["paymentStatus"])
    .index("user_status", ["userId", "status"])
    .index("member_status", ["memberId", "status"])
    .index("payment_status_order", ["paymentStatus", "orderTime"])
    .index("by_payment_intent", ["paymentIntentId"])
  ,

  schedule_events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("training"),
      v.literal("consultation"),
      v.literal("group"),
      v.literal("meeting"),
      v.literal("break"),
      v.literal("other")
    ),
    startTime: v.string(),
    endTime: v.string(),
    trainerId: v.id("users"),
    clientId: v.optional(v.id("users")),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no-show")
    ),
    recurring: v.optional(v.object({
      pattern: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
      interval: v.number(),
      endDate: v.optional(v.string()),
      daysOfWeek: v.optional(v.array(v.number())),
    })),
    createdAt: v.string(),
    createdBy: v.string(),
    updatedAt: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_start_time", ["startTime"])
    .index("by_type", ["type"])
    .index("trainer_start", ["trainerId", "startTime"])
    .index("trainer_status", ["trainerId", "status"])
  ,

  sessions: defineTable({
    userId: v.optional(v.id("users")),
    duration: v.optional(v.number()),
    pageViews: v.optional(v.number()),
    pages: v.optional(v.array(v.string())),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
  ,

  trainers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    password: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    specializations: v.array(v.string()),
    googleId: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    experience: v.optional(v.number()),
    certifications: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    workingHours: v.optional(v.union(
      v.object({
        monday: v.optional(v.object({ start: v.string(), end: v.string() })),
        tuesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        wednesday: v.optional(v.object({ start: v.string(), end: v.string() })),
        thursday: v.optional(v.object({ start: v.string(), end: v.string() })),
        friday: v.optional(v.object({ start: v.string(), end: v.string() })),
        saturday: v.optional(v.object({ start: v.string(), end: v.string() })),
        sunday: v.optional(v.object({ start: v.string(), end: v.string() })),
      }),
      v.object({
        start: v.string(),
        end: v.string(),
        days: v.array(v.number())
      })
    )),
    hourlyRate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    status: v.optional(v.string()),
    role: v.optional(v.string()),
    joinDate: v.optional(v.string()),
    totalClients: v.optional(v.number()),
    activeClients: v.optional(v.number()),
    totalWorkouts: v.optional(v.number()),
    monthlyRevenue: v.optional(v.number()),
    lastActivity: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_active", ["isActive"])
    .index("by_status", ["status"])
    .index("email_active", ["email", "isActive"])
  ,

  workouts: defineTable({
    trainerId: v.id("trainers"),
    userId: v.id("users"),
    type: v.string(),
    duration: v.optional(v.number()),
    price: v.optional(v.number()),
    status: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("trainer_user", ["trainerId", "userId"])
    .index("trainer_status", ["trainerId", "status"])
  ,
  accessLogs: defineTable({
    userId: v.optional(v.id("users")),
    success: v.boolean(),
    timestamp: v.number(),
    photoUrl: v.optional(v.string()),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_success", ["success"])
    .index("by_user", ["userId"])
    .index("user_success", ["userId", "success"])
  ,

  logs: defineTable({
    userId: v.string(),
    success: v.boolean(),
    deviceInfo: v.optional(v.string()),
    timestamp: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_success", ["success"])
    .index("user_success", ["userId", "success"])
  ,

  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    trainerId: v.string(),
    trainerName: v.string(),
    clientId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    status: v.string(),
    location: v.optional(v.string()),
    createdBy: v.string(),
    price: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    clientRating: v.optional(v.number()),
    clientReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_start_time", ["startTime"])
    .index("by_created_by", ["createdBy"])
    .index("by_type", ["type"])
    .index("trainer_status", ["trainerId", "status"])
    .index("trainer_start", ["trainerId", "startTime"])
  ,

  clients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    trainerId: v.optional(v.string()),
    trainerName: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("trial"), v.literal("inactive")),
    joinDate: v.string(),
    currentProgram: v.optional(v.string()),
    totalWorkouts: v.optional(v.number()),
    progress: v.optional(v.number()),
    lastWorkout: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    avatar: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_trainer", ["trainerId"])
    .index("by_status", ["status"])
    .index("by_phone", ["phone"])
    .index("trainer_status", ["trainerId", "status"])
  ,

  bookings: defineTable({
    memberId: v.id("members"),
    trainerId: v.id("trainers"),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    workoutType: v.string(),
    notes: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    status: v.string(),
    price: v.number(),
    memberRating: v.optional(v.number()),
    memberReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_member", ["memberId"])
    .index("by_trainer", ["trainerId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"])
    .index("by_workout_type", ["workoutType"])
    .index("member_status", ["memberId", "status"])
    .index("trainer_status", ["trainerId", "status"])
    .index("trainer_start", ["trainerId", "startTime"])
  ,

  visits: defineTable({
    memberId: v.id("members"),
    timestamp: v.number(),
    success: v.boolean(),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    visitType: v.string(),
    reason: v.optional(v.string()),
    duration: v.optional(v.number()),
    areas: v.optional(v.array(v.string())),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_member", ["memberId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_success", ["success"])
    .index("by_visit_type", ["visitType"])
    .index("member_success", ["memberId", "success"])
    .index("member_type", ["memberId", "visitType"])
  ,

  classes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    instructorId: v.id("trainers"),
    startTime: v.number(),
    endTime: v.number(),
    location: v.string(),
    capacity: v.number(),
    enrolled: v.array(v.id("members")),
    waitlist: v.optional(v.array(v.id("members"))),
    difficulty: v.string(),
    equipment: v.optional(v.array(v.string())),
    price: v.number(),
    isRecurring: v.boolean(),
    recurringPattern: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"])
    .index("by_difficulty", ["difficulty"])
    .index("by_recurring", ["isRecurring"])
    .index("instructor_status", ["instructorId", "status"])
    .index("instructor_start", ["instructorId", "startTime"])
  ,

  programBookings: defineTable({
    memberId: v.id("members"),
    programId: v.string(),
    programTitle: v.string(),
    sessionIndex: v.number(),
    sessionType: v.string(),
    instructor: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    price: v.number(),
    status: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_member", ["memberId"])
    .index("by_program", ["programId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"])
    .index("by_session_type", ["sessionType"])
    .index("member_status", ["memberId", "status"])
    .index("program_status", ["programId", "status"])
  ,

  securityResetTokens: defineTable({
    userId: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
    usedAt: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_user_type", ["userType"])
    .index("by_used", ["used"])
    .index("by_expires", ["expiresAt"])
    .index("user_type_used", ["userId", "userType", "used"]),

  // Заблокированные IP адреса
  blockedIpAddresses: defineTable({
    ipAddress: v.string(),
    reason: v.string(),
    blockedBy: v.string(), // ID администратора
    blockedAt: v.number(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
    unblockedBy: v.optional(v.string()),
    unblockedAt: v.optional(v.number()),
    expiredAt: v.optional(v.number()),
    attempts: v.optional(v.number()), // Количество попыток до блокировки
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_ip", ["ipAddress"])
    .index("by_active", ["isActive"])
    .index("by_blocked_by", ["blockedBy"])
    .index("by_expires", ["expiresAt"])
    .index("ip_active", ["ipAddress", "isActive"])
    .index("active_expires", ["isActive", "expiresAt"]),

  // Алерты безопасности
  securityAlerts: defineTable({
    type: v.string(), // failed_attempts, suspicious_ip, etc.
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    title: v.string(),
    description: v.string(),
    details: v.optional(v.any()),
    affectedUserId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    resolved: v.boolean(),
    resolvedBy: v.optional(v.string()),
    resolution: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_type", ["type"])
    .index("by_severity", ["severity"])
    .index("by_resolved", ["resolved"])
    .index("by_affected_user", ["affectedUserId"])
    .index("by_ip", ["ipAddress"])
    .index("by_created", ["createdAt"])
    .index("severity_resolved", ["severity", "resolved"])
    .index("type_resolved", ["type", "resolved"]),

  // Уведомления безопасности
  securityNotifications: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("security_alert"),
      v.literal("login_attempt"),
      v.literal("password_change"),
      v.literal("session_expired"),
      v.literal("suspicious_activity")
    ),
    title: v.string(),
    message: v.string(),
    details: v.optional(v.any()),
    read: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_read", ["read"])
    .index("by_created", ["createdAt"])
    .index("user_read", ["userId", "read"])
    .index("user_type", ["userId", "type"]),

  // Конфигурация безопасности
  securitySettings: defineTable({
    key: v.string(),
    value: v.any(),
    category: v.union(
      v.literal("authentication"),
      v.literal("session"),
      v.literal("password"),
      v.literal("monitoring"),
      v.literal("alerts")
    ),
    description: v.optional(v.string()),
    updatedBy: v.string(),
    updatedAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"]),

  // Статистика безопасности
  securityStats: defineTable({
    date: v.string(), // YYYY-MM-DD
    period: v.union(v.literal("hour"), v.literal("day"), v.literal("week"), v.literal("month")),
    stats: v.object({
      totalAttempts: v.number(),
      successfulLogins: v.number(),
      failedAttempts: v.number(),
      uniqueUsers: v.number(),
      uniqueIPs: v.number(),
      blockedIPs: v.number(),
      securityAlerts: v.number(),
      suspiciousActivity: v.number(),
    }),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_date", ["date"])
    .index("by_period", ["period"])
    .index("date_period", ["date", "period"]),

  purchases: defineTable({
    memberId: v.id("members"),
    memberEmail: v.string(),
    type: v.string(),
    title: v.string(),
    price: v.number(),
    currency: v.string(),
    status: v.string(),
    paymentMethod: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    purchaseDate: v.number(),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_member", ["memberId"])
    .index("by_status", ["status"])
    .index("by_purchase_date", ["purchaseDate"])
    .index("by_type", ["type"])
    .index("by_payment_method", ["paymentMethod"])
    .index("member_status", ["memberId", "status"])
    .index("type_status", ["type", "status"])
  ,

  userBookings: defineTable({
    userId: v.id("users"),
    trainerId: v.id("trainers"),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    workoutType: v.string(),
    notes: v.optional(v.string()),
    status: v.string(),
    price: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    memberRating: v.optional(v.number()),
    memberReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),

    paymentMethod: v.optional(v.string()),
    paymentIntentId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),

    cancelReason: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_start_time", ["startTime"])
    .index("by_status", ["status"])
    .index("by_workout_type", ["workoutType"])
    .index("user_status", ["userId", "status"])
    .index("trainer_status", ["trainerId", "status"])
    .index("user_start", ["userId", "startTime"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_payment_intent", ["paymentIntentId"])
  ,

  // Plans table - defines the types of memberships available
  membershipPlans: defineTable({
    name: v.string(),
    type: v.string(),
    duration: v.number(), // in days
    price: v.number(),
    description: v.optional(v.string()),
    features: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.optional(v.number()),
    syncVersion: v.optional(v.number()),
    lastSyncTime: v.optional(v.number()),
    isDirty: v.optional(v.boolean()),
  })
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("type_active", ["type", "isActive"]),


  membershipOrders: defineTable({
    userId: v.string(),
    planId: v.id("membershipPlans"),
    planType: v.string(),
    planName: v.string(),
    price: v.number(),
    duration: v.number(),
    autoRenew: v.boolean(),

    // Платежные данные
    paymentIntentId: v.string(),
    paymentMethod: v.string(),
    paymentStatus: v.string(), // pending, paid, failed, refunded
    paymentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    status: v.string(), // pending, confirmed, cancelled

    // Данные клиента
    userEmail: v.string(),
    userName: v.string(),
    userPhone: v.optional(v.string()),

    // Временные метки
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_payment_intent", ["paymentIntentId"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"]),



  // Memberships table - tracks individual user memberships
  memberships: defineTable({
    userId: v.id("users"),
    planId: v.optional(v.id("membershipPlans")),
    trainerId: v.optional(v.id("trainers")),
    type: v.string(),
    status: v.optional(v.string()),
    remainingDays: v.optional(v.number()),
    price: v.number(),
    startDate: v.number(),
    orderId: v.optional(v.id("membershipOrders")),
    paymentIntentId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    autoRenew: v.optional(v.boolean()),
    expiresAt: v.number(),
    isActive: v.boolean(),
    syncVersion: v.optional(v.number()),
    userEmail: v.optional(v.string()),
    userName: v.optional(v.string()),
    userPhone: v.optional(v.string()),
    lastSyncTime: v.optional(v.number()),
    isDirty: v.optional(v.boolean()),

    usageStats: v.optional(v.object({
      visitsThisMonth: v.number(),
      totalVisits: v.number(),
      favoriteTime: v.string(),
    })),
    freezeData: v.optional(v.object({
      isFreezed: v.boolean(),
      freezeStartDate: v.optional(v.string()),
      freezeEndDate: v.optional(v.string()),
      freezeDays: v.optional(v.number()),
    })),

    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_status", ["status"])
    .index("by_active", ["isActive"])
    .index("by_type", ["type"])
    .index("user_active", ["userId", "isActive"])
    .index("trainer_active", ["trainerId", "isActive"])
    .index("by_payment_intent", ["paymentIntentId"]),

  staff: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("super-admin"),
      v.literal("manager"),
      v.literal("trainer")
    ),
    phone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    resetPasswordToken: v.optional(v.string()),
    resetPasswordExpires: v.optional(v.number()),
    resetPasswordRequestedAt: v.optional(v.number()),
    passwordChangedAt: v.optional(v.number()),

    emailVerified: v.optional(v.boolean()),
    emailVerifiedAt: v.optional(v.number()),
    emailVerificationToken: v.optional(v.string()),
    emailVerificationExpires: v.optional(v.number()),
    emailVerificationRequestedAt: v.optional(v.number()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("role_active", ["role", "isActive"])
    .index("by_reset_password_token", ["resetPasswordToken"])
    .index("by_email_verification_token", ["emailVerificationToken"]),

  members: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    resetPasswordToken: v.optional(v.string()),
    resetPasswordExpires: v.optional(v.number()),
    resetPasswordRequestedAt: v.optional(v.number()),
    passwordChangedAt: v.optional(v.number()),
    membershipType: v.optional(v.string()),
    membershipStart: v.optional(v.number()),
    membershipExpiry: v.optional(v.number()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    resetToken: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    status: v.optional(v.string()),
    preferredTrainers: v.optional(v.array(v.id("trainers"))),
    fitnessGoals: v.optional(v.array(v.string())),
    workoutPreferences: v.optional(v.array(v.string())),
    joinDate: v.optional(v.number()),
    lastVisit: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
    role: v.optional(v.string()),

    emailVerified: v.optional(v.boolean()),
    emailVerifiedAt: v.optional(v.number()),
    emailVerificationToken: v.optional(v.string()),
    emailVerificationExpires: v.optional(v.number()),
    emailVerificationRequestedAt: v.optional(v.number()),

    membership: v.optional(v.object({
      type: v.string(),
      purchaseId: v.string(),
      startDate: v.number(),
      endDate: v.number(),
      sessionsRemaining: v.number(),
      status: v.string(),

      membershipType: v.optional(v.string()),         // Тип членства
      membershipExpiry: v.optional(v.number()),       // Дата окончания членства
      totalWorkouts: v.optional(v.number()),         // Общее количество тренировок
      lastWorkout: v.optional(v.number()),           // Последняя тренировка
      currentStreak: v.optional(v.number()),         // Текущая серия дней
      personalRecords: v.optional(v.number()),       // Личные рекорды
      caloriesBurned: v.optional(v.number()),        // Сожжено калорий
      averageWorkoutTime: v.optional(v.number()),    // Среднее время тренировки

      // Поля безопасности и верификации
      isVerified: v.optional(v.boolean()),           // Верифицирован ли email
      verificationEmailSent: v.optional(v.number()), // Когда отправлено письмо
      emailVerified: v.optional(v.boolean()),        // Дублирование для совместимости
      emailVerifiedAt: v.optional(v.number()),

      // Поля для деактивации аккаунта
      deactivatedAt: v.optional(v.number()),         // Когда деактивирован
      deactivationReason: v.optional(v.string()),    // Причина деактивации

      // Дополнительные контактные данные
      secondaryEmail: v.optional(v.string()),        // Дополнительный email
      emergencyContact: v.optional(v.string()),      // Экстренный контакт
      emergencyPhone: v.optional(v.string()),        // Телефон экстренного контакта

      // Социальные сети и ссылки
      socialLinks: v.optional(v.object({
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        website: v.optional(v.string()),
      })),

      // Достижения и статистика
      achievements: v.optional(v.array(v.object({
        id: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        earnedAt: v.number(),
        icon: v.optional(v.string()),
      }))),

      // Цели пользователя
      goals: v.optional(v.array(v.object({
        id: v.string(),
        title: v.string(),
        targetValue: v.number(),
        currentValue: v.number(),
        unit: v.string(),
        createdAt: v.number(),
        targetDate: v.optional(v.number()),
        completed: v.boolean(),
        completedAt: v.optional(v.number()),
      }))),
    })),


    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_status", ["status"])
    .index("by_membership_type", ["membershipType"])
    .index("by_reset_password_token", ["resetPasswordToken"])
    .index("status_membership", ["status", "membershipType"])
    .index("by_active", ["isActive"])
    .index("by_reset_token", ["resetToken"])
    .index("by_email_verification_token", ["emailVerificationToken"]),

  passwordResetLogs: defineTable({
    userId: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
    email: v.string(),
    action: v.union(
      v.literal("requested"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("expired")
    ),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    details: v.optional(v.string()),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_type", ["userType"])
    .index("by_action", ["action"])
    .index("user_type_action", ["userId", "userType", "action"])
    .index("email_action", ["email", "action"])
    .index("timestamp_action", ["timestamp", "action"])
  ,

  emailVerificationLogs: defineTable({
    userId: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
    email: v.string(),
    action: v.union(
      v.literal("requested"),
      v.literal("verified"),
      v.literal("failed"),
      v.literal("expired"),
      v.literal("already_verified")
    ),
    timestamp: v.number(),
    details: v.string(),
  })
    .index("by_user_type", ["userType"])
    .index("by_user_id", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  systemSettings: defineTable({
    key: v.string(),
    value: v.any(),
    type: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    updatedBy: v.optional(v.string()),
    updatedAt: v.number(),
    createdAt: v.number(),
    // Поля для синхронизации
    _version: v.optional(v.number()),
    _lastSync: v.optional(v.number()),
    _isDirty: v.optional(v.boolean()),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_type", ["type"])
    .index("by_public", ["isPublic"])
    .index("category_type", ["category", "type"])
  ,

  auditLogs: defineTable({
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    performedBy: v.string(),
    performedAt: v.number(),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    changedFields: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    severity: v.optional(v.string()),
    success: v.optional(v.boolean()),
    errorMessage: v.optional(v.string()),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["performedBy"])
    .index("by_action", ["action"])
    .index("by_entityType", ["entityType"])
    .index("by_timestamp", ["performedAt"])
  ,

  // Новые таблицы для синхронизации
  syncLog: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    entityId: v.string(),
    action: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("conflict"),
      v.literal("sync")
    ),
    userId: v.string(), // Изменено с v.id("users") для гибкости
    timestamp: v.number(),
    oldData: v.optional(v.any()),
    newData: v.optional(v.any()),
    conflictResolution: v.optional(v.union(
      v.literal("server"),
      v.literal("client"),
      v.literal("manual")
    )),
    metadata: v.optional(v.record(v.string(), v.any())),
    syncSource: v.optional(v.union(
      v.literal("convex"),
      v.literal("api"),
      v.literal("client")
    )),
    batchId: v.optional(v.string()),
    retryCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_batch", ["batchId"])
    .index("entity_timestamp", ["entityType", "timestamp"])
    .index("user_timestamp", ["userId", "timestamp"])
    .index("action_timestamp", ["action", "timestamp"])
    .index("entity_action", ["entityType", "action"])
    .index("user_action", ["userId", "action"]),

  syncStatus: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    lastSyncTime: v.number(),
    totalRecords: v.number(),
    syncedRecords: v.number(),
    pendingRecords: v.number(),
    conflictedRecords: v.number(),
    errorCount: v.number(),
    isHealthy: v.boolean(),
    lastError: v.optional(v.string()),
    avgSyncTime: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_entity", ["entityType"])
    .index("by_health", ["isHealthy"])
    .index("by_last_sync", ["lastSyncTime"])
    .index("entity_health", ["entityType", "isHealthy"]),

  conflictResolution: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    entityId: v.string(),
    conflictType: v.union(
      v.literal("version_mismatch"),
      v.literal("concurrent_update"),
      v.literal("data_inconsistency"),
      v.literal("field_conflict"),
      v.literal("deletion_conflict"),  // Добавить
      v.literal("creation_conflict"),  // Добавить
      v.literal("permission_conflict") // Добавить
    ),
    serverData: v.any(),
    clientData: v.any(),
    conflictFields: v.array(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    resolution: v.optional(v.union(
      v.literal("manual"),
      v.literal("server_wins"),
      v.literal("client_wins"),
      v.literal("merge"),
      v.literal("server"),  // Добавить для совместимости
      v.literal("client")   // Добавить для совместимости
    )),
    resolvedData: v.optional(v.any()),
    resolvedBy: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    isResolved: v.boolean(),
    metadata: v.optional(v.record(v.string(), v.any()))
  })
    .index("by_entity", ["entityType"])
    .index("by_resolved", ["isResolved"])
    .index("by_priority", ["priority"])
    .index("by_created", ["createdAt"])
    .index("entity_resolved", ["entityType", "isResolved"])
    .index("priority_resolved", ["priority", "isResolved"]),

  syncBatches: defineTable({
    batchId: v.string(),
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    operation: v.union(
      v.literal("full_sync"),
      v.literal("incremental_sync"),
      v.literal("conflict_resolution"),
      v.literal("cleanup")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    totalRecords: v.number(),
    processedRecords: v.number(),
    successfulRecords: v.number(),
    failedRecords: v.number(),
    conflictedRecords: v.number(),
    errors: v.optional(v.array(v.object({
      recordId: v.string(),
      error: v.string(),
      timestamp: v.number()
    }))),
    initiatedBy: v.string(),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_batch_id", ["batchId"])
    .index("by_entity", ["entityType"])
    .index("by_status", ["status"])
    .index("by_operation", ["operation"])
    .index("by_started", ["startedAt"])
    .index("entity_status", ["entityType", "status"])
    .index("operation_status", ["operation", "status"])
    .index("initiated_by", ["initiatedBy"]),

  // Таблица для кэширования и оптимизации
  dataCache: defineTable({
    cacheKey: v.string(),
    entityType: v.optional(v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    )),
    data: v.any(),
    expiresAt: v.number(),
    createdAt: v.number(),
    accessCount: v.number(),
    lastAccessed: v.number(),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_key", ["cacheKey"])
    .index("by_entity", ["entityType"])
    .index("by_expires", ["expiresAt"])
    .index("by_created", ["createdAt"])
    .index("by_last_accessed", ["lastAccessed"])
    .index("entity_expires", ["entityType", "expiresAt"]),

  // Таблица для метрик и аналитики синхронизации
  syncMetrics: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    metricType: v.union(
      v.literal("sync_duration"),
      v.literal("record_count"),
      v.literal("error_rate"),
      v.literal("conflict_rate"),
      v.literal("throughput"),
      v.literal("latency")
    ),
    value: v.number(),
    timestamp: v.number(),
    timeWindow: v.union(
      v.literal("minute"),
      v.literal("hour"),
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    ),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_entity", ["entityType"])
    .index("by_metric", ["metricType"])
    .index("by_timestamp", ["timestamp"])
    .index("by_time_window", ["timeWindow"])
    .index("entity_metric", ["entityType", "metricType"])
    .index("metric_timestamp", ["metricType", "timestamp"])
    .index("entity_timestamp", ["entityType", "timestamp"]),

  // Таблица для конфигурации синхронизации
  syncConfiguration: defineTable({
    entityType: v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    ),
    syncEnabled: v.boolean(),
    syncInterval: v.number(), // в миллисекундах
    batchSize: v.number(),
    maxRetries: v.number(),
    retryDelay: v.number(),
    conflictResolutionStrategy: v.union(
      v.literal("server_wins"),
      v.literal("client_wins"),
      v.literal("last_write_wins"),
      v.literal("manual")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("critical")
    ),
    enableRealTimeSync: v.boolean(),
    enableConflictDetection: v.boolean(),
    enableMetrics: v.boolean(),
    customRules: v.optional(v.array(v.object({
      field: v.string(),
      rule: v.string(),
      value: v.any()
    }))),
    updatedBy: v.string(),
    updatedAt: v.number(),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_entity", ["entityType"])
    .index("by_enabled", ["syncEnabled"])
    .index("by_priority", ["priority"])
    .index("by_updated", ["updatedAt"])
    .index("enabled_priority", ["syncEnabled", "priority"]),

  // Таблица для отслеживания активных соединений и сессий
  activeSessions: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    userType: v.union(
      v.literal("staff"),
      v.literal("member"),
      v.literal("trainer"),
      v.literal("admin")
    ),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    lastActivity: v.number(),
    isActive: v.boolean(),
    syncStatus: v.object({
      isConnected: v.boolean(),
      lastSync: v.number(),
      pendingOperations: v.number(),
      errorCount: v.number()
    }),
    capabilities: v.optional(v.array(v.string())),
    metadata: v.optional(v.record(v.string(), v.any()))
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user_id", ["userId"])
    .index("by_active", ["isActive"])
    .index("user_active", ["userId", "isActive"])
    .index("type_active", ["userType", "isActive"])
    .index("by_last_activity", ["lastActivity"]),

  // Таблица для планировщика задач синхронизации
  syncSchedule: defineTable({
    taskId: v.string(),
    taskType: v.union(
      v.literal("full_sync"),
      v.literal("incremental_sync"),
      v.literal("cleanup"),
      v.literal("metrics_collection"),
      v.literal("conflict_resolution"),
      v.literal("health_check")
    ),
    entityType: v.optional(v.union(
      v.literal("messages"),
      v.literal("users"),
      v.literal("trainers"),
      v.literal("clients"),
      v.literal("events"),
      v.literal("schedule_events"),
      v.literal("products"),
      v.literal("orders"),
      v.literal("bookings"),
      v.literal("members"),
      v.literal("staff"),
      v.literal("notifications"),
      v.literal("classes"),
      v.literal("visits"),
      v.literal("purchases"),
      v.literal("workouts"),
      v.literal("memberships"),
      v.literal("global")
    )),
    scheduledAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("skipped")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    recurring: v.optional(v.object({
      pattern: v.union(
        v.literal("once"),
        v.literal("hourly"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      ),
      interval: v.number(),
      endDate: v.optional(v.number())
    })),
    parameters: v.optional(v.record(v.string(), v.any())),
    createdBy: v.string(),
    createdAt: v.number(),
    executedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    result: v.optional(v.object({
      success: v.boolean(),
      recordsProcessed: v.number(),
      errors: v.optional(v.array(v.string())),
      duration: v.number(),
      metadata: v.optional(v.record(v.string(), v.any()))
    }))
  })
    .index("by_task_id", ["taskId"])
    .index("by_task_type", ["taskType"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_entity", ["entityType"])
    .index("type_status", ["taskType", "status"])
    .index("entity_status", ["entityType", "status"])
    .index("status_scheduled", ["status", "scheduledAt"])
    .index("by_scheduled", ["scheduledAt"])
    .index("by_created", ["createdAt"]),

  headerBadgeSettings: defineTable({
    navigationItemHref: v.string(),
    badgeVariant: v.string(),
    badgeText: v.optional(v.string()),
    badgeEnabled: v.boolean(),
    customClassName: v.optional(v.string()),
    isActive: v.boolean(),
    priority: v.number(),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
    targetRoles: v.optional(v.array(v.string())),
    targetDevices: v.optional(v.array(v.string())),
    conditions: v.optional(v.object({
      requireAuth: v.optional(v.boolean()),
      minUserLevel: v.optional(v.number()),
      showOnlyOnce: v.optional(v.boolean()),
      hideAfterClick: v.optional(v.boolean()),
    })),
    analytics: v.optional(v.object({
      impressions: v.number(),
      clicks: v.number(),
      clickedUsers: v.array(v.string()),
      lastShown: v.optional(v.number()),
    })),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedBy: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_href", ["navigationItemHref"])
    .index("by_enabled", ["badgeEnabled"])
    .index("by_priority", ["priority"])
    .index("by_created", ["createdAt"]),

  badgeTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    variant: v.string(),
    defaultText: v.string(),
    defaultClassName: v.optional(v.string()),
    category: v.string(),
    isSystemTemplate: v.boolean(),
    usageCount: v.number(),
    previewUrl: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    presetData: v.object({
      priority: v.number(),
      targetRoles: v.array(v.string()),
      targetDevices: v.array(v.string()),
      conditions: v.object({
        requireAuth: v.boolean(),
        minUserLevel: v.number(),
        showOnlyOnce: v.boolean(),
        hideAfterClick: v.boolean(),
      }),
    }),
  })
    .index("by_category", ["category"])
    .index("by_usage", ["usageCount"]),
});


