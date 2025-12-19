"use client";

import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { loginSchema } from "@/validators/login.schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { backend } from "@/utils/axiosConfig";
import { Spinner } from "../ui/spinner";
import useUserStore from "@/store/userStore";
import Image from "next/image";
import logo from "@/../public/logo.png";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useRouter();

  const setUserInfo = useUserStore((state) => state.setUserInfo);

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => {
      return backend.post("/auth/login", data);
    },
    onSuccess: (res) => {
      toast.success(res.data.message);
      setUserInfo(res.data.user);
      navigate.push("/profile");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Something went wrong!", { description: err.message });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validatedForm = loginSchema.safeParse(formData);
    if (validatedForm.error) {
      const json = JSON.parse(validatedForm.error.message);
      toast.error("Invalid inputs", { description: json[0].message });
    } else {
      loginMutation.mutate(validatedForm.data);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full items-center justify-center min-h-screen"
    >
      <Image src={logo} width={44} height={44} alt="Logo" />

      <div className="flex flex-col w-full max-w-md p-3 gap-2">
        <Input
          type="email"
          onChange={handleChange}
          name="email"
          value={formData.email}
          placeholder="Email"
        />
        <Input
          type="password"
          onChange={handleChange}
          value={formData.password}
          name="password"
          placeholder="Password"
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        {/* SSO buttons */}
        <div className="flex gap-3">
          {/* GitHub */}
          {/*<Button
            variant="outline"
            className="max-w-sm flex items-center gap-2"
            onClick={() => console.log("Login with GitHub")}
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </Button>*/}
          <small className="font-light text-slate-400">
            (SSO coming soon!)
          </small>
        </div>
        <Separator />
        <div className="w-full max-w-md flex items-center justify-center">
          <Button
            type="submit"
            disabled={
              formData.email.length === 0 ||
              formData.password.length === 0 ||
              loginMutation.isPending
            }
          >
            {loginMutation.isPending && <Spinner />}
            Login
          </Button>
        </div>

        <span className="text-sm dark:text-slate-100">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-blue-500 underline">
            Register
          </a>
        </span>
      </div>
    </form>
  );
}
