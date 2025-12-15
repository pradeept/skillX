import axios from "axios";
export const backend = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST,
  withCredentials: true,
});
backend.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";
