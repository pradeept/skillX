"use client";

import { FormEvent, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { registerSchema } from "@/validators/register.schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const navigate = useRouter();

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
      fetch(`${process.env.NEXT_PUBLIC_HOST}/auth/register`, {
        method: "POST",
        body: new URLSearchParams(data),
      })
        .then((res) => {
          if (!res.ok) {
            res.json().then((r) => {
              throw new Error(r.message);
            });
          }
          return res.json();
        })
        .then((body) => {
          toast.success(body.message);
          navigate.push("/profile");
        })
        .catch((e) => {
          console.error(e);
          toast.error(e.message);
        });
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full items-center justify-center min-h-screen"
    >
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
              formData.email.length === 0 || formData.password.length === 0
            }
          >
            Register
          </Button>
        </div>

        <span className="text-sm text-slate-200">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 underline">
            Login
          </a>
        </span>
      </div>
    </form>
  );
}
