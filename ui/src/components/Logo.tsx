import Image from "next/image";
import logo from "@/../public/logo.png";
export default function Logo() {
  return (
    <div>
      <Image src={logo} height={44} width={44} alt='logo' loading='eager' />
    </div>
  );
}
