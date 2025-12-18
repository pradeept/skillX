import Image from "next/image";
import loginCoverImage from "@/../public/loginCover.jpg";
import LoginForm from "@/components/auth/LoginForm";
import Footer from "@/components/Footer";

export default function LoginPage() {
  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-2 overflow-x-hidden">
        {/* cover image */}
        <section className="relative">
          <Image
            src={loginCoverImage}
            alt="login-cover-image"
            width={700}
            height={700}
            id="cover-image"
            className="w-full h-screen"
          />
          <label
            htmlFor="cover-image"
            className="absolute bottom-5 text-slate-400 right-4 underline"
          >
            <a href="https://unsplash.com/photos/gray-and-blue-concrete-tunnel-at-daytime-VNQl_4OmZJw">
              Unsplash
            </a>
          </label>
        </section>
        {/* form */}
        <LoginForm />
      </section>
      <Footer />
    </div>
  );
}
