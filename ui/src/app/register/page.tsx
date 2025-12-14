import Footer from "@/components/Footer";
import Image from "next/image";
import registerCover from "@/../public/registerCover.png";
import RegisterForm from "@/components/RegisterForm";
import Navbar from "@/components/NavBar";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <section className="grid grid-cols-1 md:grid-cols-2 overflow-x-hidden">
        {/* cover image */}
        <section className="relative">
          <Image
            src={registerCover}
            alt="register-cover-image"
            width={700}
            height={700}
            id="cover-image"
            className="w-full h-screen hidden lg:block"
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
        <RegisterForm />
      </section>
      <Footer />
    </>
  );
}
