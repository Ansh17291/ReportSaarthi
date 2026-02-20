import { SignIn } from "@clerk/nextjs";
import { FadeIn } from "@/components/animations/fade-in";
import { Stethoscope } from "lucide-react";

export default function DoctorSignInPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto space-y-8">
                <FadeIn className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Doctor Portal</h1>
                    <p className="text-muted-foreground">Sign in to join the consultation room</p>
                </FadeIn>

                <FadeIn className="flex justify-center" delay={0.2}>
                    <SignIn
                        appearance={{
                            elements: {
                                formButtonPrimary: "bg-primary hover:bg-primary/90",
                                footerActionLink: "text-primary hover:text-primary/90",
                            },
                        }}
                        routing="path"
                        path="/doctor/sign-in"
                    />
                </FadeIn>
            </div>
        </div>
    );
}
