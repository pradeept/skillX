"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/navbar/NavBar";
import SkillForm from "@/components/profile/SkillForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useUserStore from "@/store/userStore";
import Image from "next/image";

export default function Profile() {
  // notification socket
  // make /profile call and get profile
  // cross check if user is still valid (if token is in cache)
  // UI:
  // allow profile editing
  // implement profile updating api call
  // useNotificationSocket();
  // const socket = useNotification();
  const user = useUserStore((state) => state.userInfo);
  console.log(user?.fullName);
  const handleChange = () => {};
  return (
    <>
      <Navbar />
      <section className="">
        <div className="flex flex-col md:p-3 p-1 justify-center items-center gap-2 mt-10 border">
          <div>
            <Image
              src={
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              width={144}
              height={144}
              alt="user-avatar"
              // placeholder="blur"
              className="rounded-full border"
            />
          </div>
          <div className="flex flex-col w-full max-w-md p-3 gap-4">
            <Input
              type="text"
              placeholder="Fullname"
              name="fullName"
              value={user?.fullName}
              onChange={handleChange}
              required
            />

            <Input
              type="email"
              placeholder="Email"
              name="email"
              value={user?.email}
              onChange={handleChange}
              required
            />

            <Textarea
              placeholder="Bio"
              name="bio"
              value={user && user.bio.length > 0 ? user?.bio.length : ""}
              onChange={handleChange}
              className="border rounded"
              required
            />
            <SkillForm />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
