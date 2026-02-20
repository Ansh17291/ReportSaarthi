import { SignUp } from "@clerk/nextjs";
import { FadeIn } from "@/components/animations/fade-in";

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <FadeIn className="flex justify-center">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
          redirectUrl={"/assessment"}
        />
      </FadeIn>
    </div>
  );
} 