import { SignIn } from "@clerk/nextjs";
import { FadeIn } from "@/components/animations/fade-in";

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto space-y-8">
        <FadeIn className="text-center">
          <h1 className="text-2xl font-bold">Patient Portal</h1>
          <p className="text-muted-foreground">Sign in to access your diagnostics and reports</p>
        </FadeIn>
        <FadeIn className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90",
                footerActionLink: "text-primary hover:text-primary/90",
              },
            }}
            redirectUrl={"/diagnostics"}
          />
        </FadeIn>
      </div>
    </div>
  );
} 