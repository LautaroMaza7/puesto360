import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function UserButtonComponent() {
  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "w-10 h-10",
          userButtonPopoverFooter: () => (
            <div className="flex flex-col gap-2 p-2">
              <Link href="/perfil" className="text-sm hover:underline">
                Mi perfil
              </Link>
              <Link href="/mis-tiendas" className="text-sm hover:underline">
                Mis tiendas
              </Link>
              <Link href="/soporte" className="text-sm hover:underline">
                Soporte
              </Link>
            </div>
          ),
        },
      }}
    />
  );
} 