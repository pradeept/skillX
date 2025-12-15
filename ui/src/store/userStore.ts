import { create } from "zustand";

type UserInfo = {
  userId: string;
  email: string;
  full_name: string;
  bio: string;
  avatar: string;
  totalLessonsTaught: number;
  totalLessonsLearned: number;
  points: number;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  token: string;
};

type UserStore = {
  userInfo: UserInfo | null;

  // actions
  setUserInfo: (user: UserInfo) => void;
  clearUserInfo: () => void;
};

const useUserStore = create<UserStore>((set) => ({
  userInfo: null,

  setUserInfo: (user) =>
    set({
      userInfo: user,
    }),

  clearUserInfo: () =>
    set({
      userInfo: null,
    }),
}));

export default useUserStore;
