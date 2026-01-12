import { Skill } from "@/types/skill";
import { User } from "@/types/user";
import { create } from "zustand";

type UserInfo = User;

type UserSkill = Skill;

type UserStore = {
  userInfo: UserInfo | null;
  userSkills: UserSkill[];
  // actions
  setUserInfo: (user: UserInfo) => void;
  clearUserInfo: () => void;
  setUserSkills: (skills: UserSkill[]) => void;
  addUserSkill: (skill: UserSkill) => void;
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
  addUserSkill: (skill) =>
    set((state) => ({
      userSkills: [...state.userSkills, skill],
    })),
}));

export default useUserStore;
