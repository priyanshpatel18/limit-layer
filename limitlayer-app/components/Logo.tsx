import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1 text-xl font-black tracking-tighter text-primary"
    >
      <Image src="/shield.svg" alt="Limit Layer" width={100} height={100} className="size-6" />
      LIMITLAYER
    </Link>
  );
}
