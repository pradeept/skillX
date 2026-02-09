"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/navbar/NavBar";
import SkillForm from "@/components/profile/SkillForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import useUserStore from "@/store/userStore";
import { User } from "@/types/user";
import { backend } from "@/utils/axiosConfig";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleX, Edit, Save } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const client = useQueryClient();
  const [form, setForm] = useState<User | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>();
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // get profile
  const {
    isPending,
    isError,
    error,
    data: profile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => {
      return backend.get(`/profile/me`);
    },
    select: (data) => ({
      user: data.data.user,
    }),
    enabled: true,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      id: string;
      email: string;
      fullName: string;
      bio: string;
      avatarUrl: string;
    }) => {
      return backend.put("/profile", data);
    },
    onError: (e) => {
      console.log(e);
      toast.error("Failed to update your information");
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      client.invalidateQueries({ queryKey: ["profile"] });
      setIsFormEdit(false);
    },
  });

  useEffect(() => {
    if (!form && profile) {
      setForm(profile.user);
    }
  }, [profile, form]);

  const handleProfileEdit = () => {
    setIsFormEdit(true);
  };

  type EditableUserFields = Pick<User, "fullName" | "bio" | "avatar">;
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setForm((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [name as keyof EditableUserFields]: value,
      };
    });
  };

  const handleImageUpdate = (e: ChangeEvent<HTMLInputElement>) => {
    let file;
    if (e.target.files) {
      file = e.target.files[0];
    } else {
      toast.warning("Image not selected!");
      return;
    }
    // show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      // @ts-expect-error state type incompatibilty
      setProfilePic(e.target?.result || null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    let updatedProfileURL = form?.avatar || "";
    if (profilePic) {
      const formData = new FormData();
      formData.append("file", profilePic);
      const result = await uploadToCloudinary(formData);
      if (result.error) {
        toast.error("Failed to update profile picture");
        setIsUploading(false);
        return;
      } else {
        updatedProfileURL = result.url;
      }
    }
    if (form) {
      console.log(form);
      const data = {
        id: form.userId,
        email: form.email,
        fullName: form.fullName,
        bio: form.bio || "",
        avatarUrl: updatedProfileURL,
      };
      updateProfileMutation.mutate(data, {
        onSettled: () => setIsUploading(false),
      });
    } else {
      setIsUploading(false);
    }
  };

  if (isPending) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }
  if (isError) {
    return (
      <div>
        <Label className='text-red-400'>{error.message}</Label>
      </div>
    );
  }
  return (
    <>
      <Navbar />
      <section className=''>
        <div className='flex flex-col md:p-3 p-1 justify-center items-center gap-2 mt-10 border'>
          <div className='flex flex-col gap-3 justify-center items-center'>
            <Image
              src={
                profilePic ||
                form?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              width={144}
              height={144}
              alt='user-avatar'
              className='rounded-full border'
            />
            {isFormEdit && (
              <Input
                type='file'
                name='avatar'
                className='max-w-md'
                accept='image/*'
                onChange={handleImageUpdate}
              />
            )}
          </div>
          <div className='flex flex-col w-full max-w-md p-3 gap-4'>
            <Input
              type='text'
              placeholder='Fullname'
              name='fullName'
              value={form?.fullName || ""}
              onChange={handleChange}
              disabled={!isFormEdit}
              required
            />

            <Input
              type='email'
              placeholder='Email'
              name='email'
              value={form?.email || ""}
              onChange={handleChange}
              disabled={!isFormEdit}
              required
            />

            <Textarea
              placeholder='Bio'
              name='bio'
              value={(form && form.bio) || ""}
              onChange={handleChange}
              className='border rounded'
              disabled={!isFormEdit}
              required
            />
            <div className='flex justify-end gap-3'>
              <Edit
                size={18}
                onClick={handleProfileEdit}
                className={`cursor-pointer ${isFormEdit && "hidden"}`}
              />
              {isFormEdit && (
                <>
                  <CircleX
                    size={18}
                    className='text-red-400 cursor-pointer'
                    onClick={() => setIsFormEdit(false)}
                  />
                  {isUploading ? (
                    <Spinner className='w-4 h-4' />
                  ) : (
                    <Save
                      size={18}
                      className='text-blue-400 cursor-pointer'
                      onClick={handleSubmit}
                    />
                  )}
                </>
              )}
            </div>
            {form && <SkillForm userId={form.userId} />}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
