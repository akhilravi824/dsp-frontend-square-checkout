export interface LessonProgress {
  attempts: number;
  completed: boolean;
  timeSpent: number;
}

export interface UnitProgress {
  lessons: {
    [lessonName: string]: LessonProgress;
  };
}

export interface LevelProgress {
  units: {
    [unitId: string]: UnitProgress;
  };
  locked: boolean;
}

export interface Progress {
  levels: {
    [levelId: string]: LevelProgress;
  };
  freeTries: number;
  activeDays: string[];
  totalAttempts: number;
  totalTimeSpent: number;
}

export interface SignupData {
  units: string;
  platforms: string;
  description: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  university: string;
  has_active_subscription: boolean;
  square_subscription_status: string;
  square_subscription_variation_id: string;
  square_subscription_id: string;
  square_subscription_canceled_date: string | null;
  progress: Progress;
  allow_video_usage: boolean;
  had_subscription: boolean;
  signup_data: SignupData;
  signed_up: boolean;
  hasActiveSubscription: boolean;
  profileCreated: boolean;
  tipsAndGuidance: boolean;
  productUpdates: boolean;
  squareCustomerId: string;
  createdAt: string;
  updatedAt: string;
}
