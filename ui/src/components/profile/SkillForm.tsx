"use client";

import { backend } from "@/utils/axiosConfig";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "../ui/spinner";
import { useEffect, useState } from "react";
import { Skill } from "@/types/skill";
import useUserStore from "@/store/userStore";
import { Badge } from "../ui/badge";
import { CircleX, Edit, Check } from "lucide-react";
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
import { Button } from "../ui/button";

interface SkillFormProps {
  userId: string;
}

export default function SkillForm({ userId }: SkillFormProps) {
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const client = useQueryClient();

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
  }, [data, setUserSkills, userSkills]);

  const handleProfileEdit = () => {
    setIsFormEdit(true);
  };

  const deleteSkillMutation = useMutation({
    mutationFn: (data: { id: string }) => {
      return backend.delete(`/skill/${data.id}`);
    },
    onSuccess: () => {
      toast.success("Skill deleted successfully");
      client.invalidateQueries({ queryKey: ["skill"] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "Failed to delete skill");
    },
  });

  const deleteSkill = (id: string) => {
    console.log("deleteSkill called with id:", id);
    deleteSkillMutation.mutate({ id });
  };

  const handleSubmit = () => {
      setIsFormEdit(false);
  };

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
                <div key={skill.id}>
                  <Badge
                    variant="outline"
                    className="gap-2"
                  >
                    {skill.skillName + " (" + skill.category + ") "}
                    {isFormEdit && (
                         <button
                           type="button"
                           className="inline-flex pointer-events-auto"
                           onClick={(e) => {
                               console.log("Delete button clicked for skill:", skill.id);
                               e.stopPropagation();
                               deleteSkill(skill.id);
                           }}
                         >
                           <CircleX
                             size={14}
                             className="cursor-pointer hover:text-red-500"
                           />
                         </button>
                    )}
                 
                  </Badge>
                </div>
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
                  <Badge variant="outline" className="gap-2">
                    {skill.skillName + " (" + skill.category + ") "}
                    {isFormEdit && (
                        <button
                          type="button"
                          className="inline-flex pointer-events-auto"
                          onClick={(e) => {
                              console.log("Delete button clicked for skill:", skill.id);
                              e.stopPropagation();
                              deleteSkill(skill.id);
                          }}
                        >
                          <CircleX
                            size={14}
                            className="cursor-pointer hover:text-red-500"
                          />
                        </button>
                    )}
                  </Badge>
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
            <SkillEditForm userId={userId} />
            <div className="flex justify-end gap-3">
              <CircleX
                size={18}
                className="text-red-400 cursor-pointer"
                onClick={() => setIsFormEdit(false)}
              />
              <Check
                size={18}
                className="text-green-500 cursor-pointer"
                onClick={handleSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillEditForm({ userId }: { userId: string }) {
  const [newSkill, setNewSkill] = useState<string>("");
  const [category, setCategory] = useState<{
    id: string;
    categoryName: string;
  }>();
  const [type, setType] = useState<"offering" | "wanting">();
  
  const client = useQueryClient();

  const { isPending, isError, error, data } = useQuery({
    queryKey: ["category"],
    queryFn: () => {
      return backend.get("/skill/category");
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: (data: any) => {
        return backend.post("/skill", data);
    },
    onSuccess: () => {
        toast.success("Skill added successfully");
        client.invalidateQueries({ queryKey: ["skill"] });
        setNewSkill("");
        // Optional: keep category/type or reset?
    },
    onError: (e: any) => {
        toast.error(e.response?.data?.message || "Failed to add skill");
    }
  });

  if (isError) {
    return toast.error("Failed to fetch categories. Please try again later", {
      description: error.message,
    });
  }

  const handleUIAdd = () => {
    if (!category || !newSkill || !type) {
      toast.error("Please fill all fields (Category, Skill Name, Type)");
      return;
    }
    
    addSkillMutation.mutate({
        id: userId,
        skills: [{
            skill_name: newSkill,
            category_id: category.id
        }],
        type: type
    });
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <Select onValueChange={(val) => {
          // Find category object
          const cat = data?.data.categories.find((c: any) => c.categoryName === val);
          setCategory(cat);
      }}>
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
                    <SelectItem
                      value={category.categoryName}
                      key={category.id}
                    >
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
        maxLength={20}
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        className="max-w-[200px]"
        placeholder="ex: Node.js"
      />

      {/* Choose type - offering or wanting */}
      <Select onValueChange={(val: "offering" | "wanting") => setType(val)}>
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

      <Button variant="outline" onClick={handleUIAdd} disabled={addSkillMutation.isPending}>
        {addSkillMutation.isPending ? <Spinner className="w-4 h-4" /> : "Add"}
      </Button>
    </div>
  );
}
