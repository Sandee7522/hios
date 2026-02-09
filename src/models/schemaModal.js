import mongoose from 'mongoose';

/* =====================  PERMISSION SCHEMA  ===================== */

const PermissionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // view_courses
    description: { type: String },
    module: { type: String }, // courses, users, payments
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'permissions' }
);

PermissionSchema.pre('save', function () {
  this.updated_at = Date.now();
}); 

/* ===================== USER ROLES SCHEMA ===================== */
const UserRolesSchema = new mongoose.Schema(
  {
    user_type: { type: String, required: true },
    description: { type: String },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permissions' }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: "user_roles" }
);

UserRolesSchema.pre("save", async function(){
  this.updated_at = Date.now();
});

/* =====================  USER SCHEMA  ===================== */
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserRoles', required: true },
    isEmailVerified: { type: Boolean, default: false },
    profileImage: { type: String },
    bio: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String }
    },
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
      website: { type: String }
    },
    instructorStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'none'], default: 'none' },
    refreshTokens: [{ type: String }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'users' }
);

UserSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  SESSION SCHEMA  ===================== */
const SessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    token: { type: String, required: true },
    deviceInfo: {
      browser: { type: String },
      os: { type: String },
      device: { type: String }
    },
    ipAddress: { type: String },
    lastActivity: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'sessions' }
);

SessionSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  CATEGORY SCHEMA  ===================== */
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'categories' }
);

CategorySchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  COURSE SCHEMA  ===================== */
const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    thumbnail: { type: String },
    previewVideo: { type: String },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    language: { type: String, default: 'English' },
    totalFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    partialPaymentEnabled: { type: Boolean, default: true },
    minimumPayment: { type: Number, default: 0 },
    duration: {
      hours: { type: Number },
      minutes: { type: Number }
    },
    requirements: [{ type: String }],
    whatYouWillLearn: [{ type: String }],
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'pending', 'published', 'archived', 'rejected'], default: 'draft' },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    totalStudents: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'courses' }
);

CourseSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  MODULE SCHEMA  ===================== */
const ModuleSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'modules' }
);

ModuleSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  LESSON SCHEMA  ===================== */
const LessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Modules' },
    title: { type: String, required: true },
    description: { type: String },
    content: { type: String },
    contentType: { type: String, enum: ['video', 'text', 'quiz', 'assignment', 'document'], default: 'video' },
    videoUrl: { type: String },
    videoDuration: { type: Number }, // in seconds
    attachments: [{
      name: { type: String },
      url: { type: String },
      type: { type: String },
      size: { type: Number }
    }],
    order: { type: Number, required: true },
    isFree: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'lessons' }
);

LessonSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  ACCESS RULE SCHEMA  ===================== */
const AccessRuleSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lessons' },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Modules' },
    requiredPaymentPercentage: { type: Number, min: 0, max: 100, default: 0 },
    requiredPaymentAmount: { type: Number, min: 0 },
    unlockCondition: { type: String, enum: ['payment', 'completion', 'both'], default: 'payment' },
    prerequisiteLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lessons' }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'access_rules' }
);

AccessRuleSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  ENROLLMENT SCHEMA  ===================== */
const EnrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    enrolledAt: { type: Date, default: Date.now },
    totalPaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['partial', 'full', 'pending'], default: 'pending' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lessons' }],
    lastAccessedAt: { type: Date },
    completedAt: { type: Date },
    certificateIssued: { type: Boolean, default: false },
    certificateIssuedAt: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'enrollments' }
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

EnrollmentSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  PROGRESS SCHEMA  ===================== */
const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lessons', required: true },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    timeSpent: { type: Number, default: 0 }, // in seconds
    lastPosition: { type: Number, default: 0 }, // video position in seconds
    completedAt: { type: Date },
    attempts: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'progress' }
);

ProgressSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  PAYMENT SCHEMA  ===================== */
const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollments' },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paymentType: { type: String, enum: ['initial', 'additional', 'full'], default: 'initial' },
    paymentMethod: { type: String },
    transactionId: { type: String },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
    refundedAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
    invoiceUrl: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'payments' }
);

PaymentSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  REVIEW SCHEMA  ===================== */
const ReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: true },
    helpful: { type: Number, default: 0 },
    reported: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'reviews' }
);

ReviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

ReviewSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  QUESTION SCHEMA  ===================== */
const QuestionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lessons', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isAnswered: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'questions' }
);

QuestionSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  ANSWER SCHEMA  ===================== */
const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Questions', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    content: { type: String, required: true },
    isInstructorAnswer: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'answers' }
);

AnswerSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  NOTIFICATION SCHEMA  ===================== */
const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['course', 'payment', 'enrollment', 'lesson', 'announcement', 'system', 'review', 'question'], required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    actionUrl: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'notifications' }
);

NotificationSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  CERTIFICATE SCHEMA  ===================== */
const CertificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    certificateId: { type: String, required: true, unique: true },
    certificateUrl: { type: String },
    issuedAt: { type: Date, default: Date.now },
    verificationCode: { type: String, required: true, unique: true },
    completionDate: { type: Date },
    grade: { type: String },
    metadata: {
      courseName: { type: String },
      instructorName: { type: String },
      duration: { type: String },
      completionPercentage: { type: Number }
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'certificates' }
);

CertificateSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  INSTRUCTOR APPLICATION SCHEMA  ===================== */
const InstructorApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, unique: true },
    expertise: [{ type: String }],
    experience: { type: String, required: true },
    credentials: {
      education: { type: String },
      certifications: [{ type: String }],
      portfolio: { type: String }
    },
    motivation: { type: String },
    sampleCourseIdea: {
      title: { type: String },
      description: { type: String },
      targetAudience: { type: String }
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'instructor_applications' }
);

InstructorApplicationSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  EARNINGS SCHEMA  ===================== */
const EarningsSchema = new mongoose.Schema(
  {
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payments', required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    netEarning: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'on_hold'], default: 'pending' },
    paidAt: { type: Date },
    payoutMethod: { type: String },
    payoutDetails: { type: mongoose.Schema.Types.Mixed },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'earnings' }
);

EarningsSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  QUIZ SCHEMA  ===================== */
const QuizSchema = new mongoose.Schema(
  {
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lessons', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    title: { type: String, required: true },
    description: { type: String },
    timeLimit: { type: Number }, // in minutes
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    questions: [{
      question: { type: String, required: true },
      questionType: { type: String, enum: ['multiple_choice', 'true_false', 'short_answer'], default: 'multiple_choice' },
      options: [{ type: String }],
      correctAnswer: { type: mongoose.Schema.Types.Mixed },
      explanation: { type: String },
      points: { type: Number, default: 1 }
    }],
    totalPoints: { type: Number },
    attempts: { type: Number, default: 3 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'quizzes' }
);

QuizSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  QUIZ ATTEMPT SCHEMA  ===================== */
const QuizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quizzes', required: true },
    answers: [{
      questionId: { type: mongoose.Schema.Types.ObjectId },
      answer: { type: mongoose.Schema.Types.Mixed },
      isCorrect: { type: Boolean },
      pointsEarned: { type: Number }
    }],
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, default: false },
    timeSpent: { type: Number }, // in seconds
    attemptNumber: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'quiz_attempts' }
);

QuizAttemptSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  ACTIVITY LOG SCHEMA  ===================== */
const ActivityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ['course', 'lesson', 'payment', 'enrollment', 'review', 'question', 'user'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'activity_logs' }
);

ActivityLogSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  REPORT SCHEMA  ===================== */
const ReportSchema = new mongoose.Schema(
  {
    reportType: { type: String, enum: ['revenue', 'enrollment', 'user_activity', 'course_performance', 'instructor_performance'], required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    dateRange: {
      start: { type: Date },
      end: { type: Date }
    },
    filters: { type: mongoose.Schema.Types.Mixed },
    data: { type: mongoose.Schema.Types.Mixed },
    fileUrl: { type: String },
    status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'reports' }
);

ReportSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  AI RECOMMENDATION SCHEMA  ===================== */
const AIRecommendationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    recommendedCourses: [{
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses' },
      score: { type: Number },
      reason: { type: String }
    }],
    basedOn: {
      enrollments: [{ type: mongoose.Schema.Types.ObjectId }],
      interests: [{ type: String }],
      behavior: { type: mongoose.Schema.Types.Mixed }
    },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'ai_recommendations' }
);

AIRecommendationSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  CHAT MESSAGE SCHEMA  ===================== */
const ChatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    message: { type: String, required: true },
    response: { type: String },
    intent: { type: String },
    context: {
      courseId: { type: mongoose.Schema.Types.ObjectId },
      lessonId: { type: mongoose.Schema.Types.ObjectId }
    },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    resolved: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'chat_messages' }
);

ChatMessageSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  UPLOAD SCHEMA  ===================== */
const UploadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    fileSize: { type: Number },
    uploadType: { type: String, enum: ['profile', 'course_thumbnail', 'lesson_video', 'lesson_attachment', 'certificate', 'other'], required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String },
    isPublic: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'uploads' }
);

UploadSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  API THROTTLING SCHEMA  ===================== */
const ApiThrottlingSchema = new mongoose.Schema(
  {
    api: { type: String, required: true },
    status: { type: String, default: 'Active' }, // Active | Blocked
    limit: { type: Number, required: true }, // requests per window
    window_seconds: { type: Number, default: 60 }, // time window in seconds
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  },
  { collection: 'api_throttling' }
);

ApiThrottlingSchema.pre('save', function () {
  this.updated_at = Date.now();
});

/* =====================  EXPORT MODELS  ===================== */
export const Permissions = mongoose.models.Permissions || mongoose.model("Permissions", PermissionSchema);
export const UserRoles = mongoose.models.UserRoles || mongoose.model("UserRoles", UserRolesSchema);
export const Users = mongoose.models.Users || mongoose.model('Users', UserSchema);
export const Sessions = mongoose.models.Sessions || mongoose.model('Sessions', SessionSchema);
export const Categories = mongoose.models.Categories || mongoose.model('Categories', CategorySchema);
export const Courses = mongoose.models.Courses || mongoose.model('Courses', CourseSchema);
export const Modules = mongoose.models.Modules || mongoose.model('Modules', ModuleSchema);
export const Lessons = mongoose.models.Lessons || mongoose.model('Lessons', LessonSchema);
export const AccessRules = mongoose.models.AccessRules || mongoose.model('AccessRules', AccessRuleSchema);
export const Enrollments = mongoose.models.Enrollments || mongoose.model('Enrollments', EnrollmentSchema);
export const Progress = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
export const Payments = mongoose.models.Payments || mongoose.model('Payments', PaymentSchema);
export const Reviews = mongoose.models.Reviews || mongoose.model('Reviews', ReviewSchema);
export const Questions = mongoose.models.Questions || mongoose.model('Questions', QuestionSchema);
export const Answers = mongoose.models.Answers || mongoose.model('Answers', AnswerSchema);
export const Notifications = mongoose.models.Notifications || mongoose.model('Notifications', NotificationSchema);
export const Certificates = mongoose.models.Certificates || mongoose.model('Certificates', CertificateSchema);
export const InstructorApplications = mongoose.models.InstructorApplications || mongoose.model('InstructorApplications', InstructorApplicationSchema);
export const Earnings = mongoose.models.Earnings || mongoose.model('Earnings', EarningsSchema);
export const Quizzes = mongoose.models.Quizzes || mongoose.model('Quizzes', QuizSchema);
export const QuizAttempts = mongoose.models.QuizAttempts || mongoose.model('QuizAttempts', QuizAttemptSchema);
export const ActivityLogs = mongoose.models.ActivityLogs || mongoose.model('ActivityLogs', ActivityLogSchema);
export const Reports = mongoose.models.Reports || mongoose.model('Reports', ReportSchema);
export const AIRecommendations = mongoose.models.AIRecommendations || mongoose.model('AIRecommendations', AIRecommendationSchema);
export const ChatMessages = mongoose.models.ChatMessages || mongoose.model('ChatMessages', ChatMessageSchema);
export const Uploads = mongoose.models.Uploads || mongoose.model('Uploads', UploadSchema);
export const ApiThrottling = mongoose.models.ApiThrottling || mongoose.model('ApiThrottling', ApiThrottlingSchema);


