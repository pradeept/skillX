import Footer from "@/components/Footer";
import Image from "next/image";
import registerCover from "@/../public/registerCover.png";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <>
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
          <div className="absolute bottom-5 text-zinc-500 dark:text-zinc-400 right-4 text-sm">
            <a
              href="https://unsplash.com/photos/gray-and-blue-concrete-tunnel-at-daytime-VNQl_4OmZJw"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Unsplash
            </a>
          </div>
        </section>
        {/* form */}
        <RegisterForm />
      </section>
      <Footer />
    </>
  );
}
