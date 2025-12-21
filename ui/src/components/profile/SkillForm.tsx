"use client";

import { backend } from "@/utils/axiosConfig";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Spinner } from "../ui/spinner";
import { useEffect, useState } from "react";
import { Skill } from "@/types/skill";
import useUserStore from "@/store/userStore";
import { Badge } from "../ui/badge";
import { CircleX, Edit, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { toast } from "sonner";

export default function SkillForm() {
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);

  // const skillUpdateMutation = useMutation({
  //   mutationFn: (data)=>{
  //     return backend.post("/")
  //   }
  // })
  const { isError, error, isPending, data } = useQuery({
    queryKey: ["skill"],
    enabled: true,
    queryFn: () => {
      return backend.get("/skill");
    },
  });

  const setUserSkills = useUserStore((state) => state.setUserSkills);
  const userSkills = useUserStore((state) => state.userSkills);

  useEffect(() => {
    if (data && !userSkills) {
      setUserSkills(data?.data.skills);
    }
  }, [data]);

  const handleProfileEdit = () => {
    setIsFormEdit(true);
  };

  const deleteSkill = (id: string) => {
    //skill id
  };

  const handleSubmit = () => {};

  if (isPending) return <div>{isPending && <Spinner />}</div>;

  if (isError) return <div className="text-red-500">{error.message}</div>;

  return (
    <div className="flex gap-2 flex-col">
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
                <div key={skill.id}>
                  <Badge variant="outline">
                    {skill.skillName + " (" + skill.category + ") "}
                  </Badge>
                  <CircleX
                    onClick={() => deleteSkill(skill.id)}
                    className={`${isFormEdit ? "visible" : "hidden"}`}
                  />
                </div>
              );
          })}
      </div>
      <div className="flex justify-end ">
        <Edit
          size={18}
          onClick={handleProfileEdit}
          className={`cursor-pointer ${isFormEdit && "hidden"}`}
        />
      </div>
      <div>
        {isFormEdit && (
          <div className="flex flex-col gap-4">
            <SkillEditForm />
            <div className="flex justify-end gap-3">
              <CircleX
                size={18}
                className="text-red-400 cursor-pointer"
                onClick={() => setIsFormEdit(false)}
              />
              <Save
                size={18}
                className="text-blue-400 cursor-pointer"
                onClick={handleSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillEditForm() {
  const [newSkill, setNewSkill] = useState<string>("");

  const { isPending, isError, error, data } = useQuery({
    queryKey: ["category"],
    queryFn: () => {
      return backend.get("/skill/category");
    },
  });

  if (isError) {
    return toast.error("Failed to fetch categories. Please try again later", {
      description: error.message,
    });
  }
  return (
    <div className="flex gap-2 flex-wrap">
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {isPending && <Spinner />}
            {data &&
              data.data.categories.map(
                (category: { id: string; categoryName: string }) => {
                  return (
                    <SelectItem value={category.categoryName} key={category.id}>
                      {category.categoryName}
                    </SelectItem>
                  );
                },
              )}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Enter the Skill name*/}
      <Input
        type="text"
        maxLength={3}
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        className="max-w-md"
        placeholder="ex: Node.js"
      />

      {/* Choose type - offering or wanting */}
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select the type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="offering">Offering</SelectItem>
            <SelectItem value="wanting">Wanting</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
