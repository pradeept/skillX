import { Skill } from "@/types/skill";
import { create } from "zustand";

type UserInfo = {
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

type UserSkill = Skill;

type UserStore = {
  userInfo: UserInfo | null;
  userSkills: UserSkill[];
  // actions
  setUserInfo: (user: UserInfo) => void;
  clearUserInfo: () => void;
  setUserSkills: (skills: Skill[]) => void;
};

const useUserStore = create<UserStore>((set) => ({
  userInfo: null,
  userSkills: [],

  setUserInfo: (user) =>
    set({
      userInfo: user,
    }),

  clearUserInfo: () =>
    set({
      userInfo: null,
    }),
  setUserSkills: (skills) =>
    set({
      userSkills: skills,
    }),
}));

export default useUserStore;
