export type User = {
  userId: string;
  email: string;
  fullName: string;
  bio: string;
  avatar: string;
  totalLessonsTaught: number;
  totalLessonsLearned: number;
  points: number;
  level: "beginner" | "intermediate" | "advanced" | "expert";
};
