"use client";

import { FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { registerSchema } from "@/validators/register.schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { backend } from "@/utils/axiosConfig";
import { Spinner } from "../ui/spinner";
import Image from "next/image";
import logo from "@/../public/logo.png";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const navigate = useRouter();

  const registerMutation = useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      fullname: string;
    }) => {
      return backend.post("/auth/register", data);
    },
    onSuccess: (res) => {
      toast.success(res.data.message);
      navigate.push("/login");
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validatedForm = registerSchema.safeParse(formData);
    if (validatedForm.error) {
      const json = JSON.parse(validatedForm.error.message);
      toast.error("Invalid inputs", { description: json[0].message });
    } else if (
      validatedForm.data.password !== validatedForm.data.confirmPassword
    ) {
      toast.error("Invalid inputs", {
        description: "Password and confirm password must be same",
      });
    } else {
      const data = {
        email: validatedForm.data.email,
        password: validatedForm.data.password,
        fullname: validatedForm.data.fullName,
      };
      registerMutation.mutate(data);
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
          type="text"
          placeholder="Fullname"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-full max-w-md flex items-center justify-center">
          <Button
            type="submit"
            disabled={
              formData.email.length === 0 ||
              formData.password.length === 0 ||
              registerMutation.isPending
            }
          >
            {registerMutation.isPending && <Spinner />}
            Register
          </Button>
        </div>

        <span className="text-sm dark:text-slate-200">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 underline">
            Login
          </a>
        </span>
      </div>
    </form>
  );
}
