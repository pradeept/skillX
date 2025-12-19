"use client";

import { backend } from "@/utils/axiosConfig";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "../ui/spinner";
import { useEffect, useState } from "react";
import { Skill } from "@/types/skill";
import useUserStore from "@/store/userStore";
import { Badge } from "../ui/badge";

export default function SkillForm() {
  // const userId = useUserStore((state)=>state.userInfo?.userId)
  const { isError, error, isPending, data } = useQuery({
    queryKey: ["skill"],
    enabled: true,
    queryFn: () => {
      return backend.get("/skill");
    },
  });

  const setUserSkills = useUserStore((state) => state.setUserSkills);

  useEffect(() => {
    if (data) {
      setUserSkills(data?.data.skills);
    }
  }, [data]);

  if (isPending) return <div>{isPending && <Spinner />}</div>;

  if (isError) return <div className="text-red-500">{error.message}</div>;

  return (
    <>
      <div className="flex flex-wrap gap-2 border p-2 rounded">
        <Badge variant="secondary" className="font-bold">
          Offering:{" "}
        </Badge>
        {data &&
          data.data.skills.map((skill: Skill) => {
            if (skill.type === "offering")
              return (
                <Badge variant="outline" key={skill.id}>
                  {skill.skillName + " (" + skill.category + ") "}
                </Badge>
              );
          })}
      </div>
      <div className="flex flex-wrap gap-2 border p-2 rounded">
        <Badge variant="secondary" className="font-bold">
          Wanting:{" "}
        </Badge>
        {data &&
          data.data.skills.map((skill: Skill) => {
            if (skill.type === "wanting")
              return (
                <Badge variant="outline" key={skill.id}>
                  {skill.skillName + " (" + skill.category + ") "}
                </Badge>
              );
          })}
      </div>
    </>
  );
}
