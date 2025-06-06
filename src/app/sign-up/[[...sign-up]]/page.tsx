import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
            card: "bg-white shadow-xl",
          },
        }}
      />
    </div>
  );
} 