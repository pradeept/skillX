"use client";

import { FormEvent, useState } from "react";
import Logo from "./Logo";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };
  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-4 w-full items-center justify-center min-h-screen'
    >
      <div className='flex flex-col w-full max-w-md p-3'>
        <input
          id='email'
          type='email'
          onChange={handleChange}
          name='email'
          value={formData.email}
          className='w-full border border-[#686868] py-3 px-3 rounded-md outline-none text-base'
          placeholder='you@company.com'
          autoComplete='email'
        />
        <label htmlFor='email' className='ml-2 mt-1 text-sm text-slate-600'>
          Email
        </label>
      </div>
      <div className='flex flex-col w-full max-w-md p-3'>
        <input
          id='password'
          type='password'
          onChange={handleChange}
          name='password'
          value={formData.password}
          className='w-full border border-[#686868] py-3 px-3 rounded-md outline-none text-base'
          placeholder='Your password'
          autoComplete='current-password'
        />
        <label htmlFor='password' className='ml-2 mt-1 text-sm text-slate-600'>
          Password
        </label>
      </div>
      <div className='flex flex-col items-center gap-3'>
        {/* SSO buttons */}
        <div className='flex gap-3 w-full max-w-md'>
          <button
            type='button'
            onClick={() => (window.location.href = "/api/auth/google")}
            className='flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-md bg-white py-2 px-3 text-sm hover:shadow-sm'
            aria-label='Sign in with Google'
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 48 48'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden
            >
              <path
                d='M44.5 20H24v8.5h11.9C34.8 32.6 30.9 36 24 36 15.8 36 9.5 29.7 9.5 21.5S15.8 7 24 7c6.1 0 9.4 2.6 11.6 4.6l6.3-6.1C37.1 2.5 30.9 0 24 0 10.7 0 0 10.7 0 24s10.7 24 24 24c13.2 0 23.8-10.3 24-23.5.1-1.6.5-2.5.5-3.5z'
                fill='#EA4335'
              />
            </svg>
            Google
          </button>
          <button
            type='button'
            onClick={() => (window.location.href = "/api/auth/github")}
            className='flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-md bg-gray-900 text-white py-2 px-3 text-sm hover:shadow-sm'
            aria-label='Sign in with GitHub'
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden
            >
              <path d='M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1-.01-1.96-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.17 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.43-2.68 5.4-5.24 5.69.41.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .3.21.66.79.55C20.71 21.4 24 17.09 24 12c0-6.35-5.15-11.5-11.99-11.5z' />
            </svg>
            GitHub
          </button>
        </div>

        <div className='w-full max-w-md flex items-center justify-center'>
          <button
            type='submit'
            disabled={
              formData.email.length === 0 || formData.password.length === 0
            }
            className='w-full rounded-md px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg shadow-md hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Login
          </button>
        </div>

        <span className='text-sm text-slate-600'>
          Don&apos;t have an account?{" "}
          <a href='/register' className='text-blue-500 underline'>
            Register
          </a>
        </span>
      </div>
    </form>
  );
}
