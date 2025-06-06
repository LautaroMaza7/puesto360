import { UserButton } from "@clerk/nextjs";

export default function UserButtonComponent() {
  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "w-10 h-10"
        }
      }}
    />
  );
} 