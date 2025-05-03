import { stegaClean } from "@sanity/client/stega";
import { Image } from "next-sanity/image";
import { urlForImage } from "@/sanity/lib/utils";
import Link from "next/link";

interface HeaderLogoProps {
  logo: any;
}

export default function HeaderLogo({ logo }: HeaderLogoProps) {
  if (!logo) return null;

  return (
    <div className="w-[30px] h-[24px] relative">
      <Link href="/">
        <Image
          className="object-contain"
          fill
          alt={stegaClean(logo.alt) || "GoodParty.org"}
          src={urlForImage(logo)?.width(30).height(24).url() as string}
          priority
      />
      </Link>
    </div>
  );
} 