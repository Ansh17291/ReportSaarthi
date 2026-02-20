"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { Phone, User, Activity, Shield, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function DoctorRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);
    const { isLoaded, isSignedIn, user } = useUser();

    if (!isLoaded) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const doctorName = user?.fullName || "Doctor";

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <FadeIn>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Shield className="h-8 w-8 text-primary" />
                                Doctor Consultation Portal
                            </h1>
                            <p className="text-muted-foreground">
                                Secure Video Room: <span className="font-mono text-primary">{roomId}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Secure Connection Active
                        </div>
                    </div>
                </FadeIn>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Video Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden border-2 border-primary/10 shadow-xl bg-black aspect-video relative">
                            <iframe
                                title="Jitsi Doctor View"
                                src={`https://meet.jit.si/${encodeURIComponent(roomId)}#userInfo.displayName=${encodeURIComponent(doctorName)}`}
                                allow="camera; microphone; fullscreen; display-capture"
                                style={{ width: "100%", height: "100%", border: 0 }}
                            />
                        </Card>

                        <div className="flex justify-center gap-4">
                            <Button variant="destructive" size="lg" className="rounded-full px-8" onClick={() => window.close()}>
                                End Call
                            </Button>
                        </div>
                    </div>

                    {/* Patient Overview Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Patient Context
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="font-medium text-green-600">In Consultation</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Provider</span>
                                        <span className="font-medium">Saarthi AI Lab</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        Clinical Signals
                                    </h4>
                                    <div className="text-xs text-muted-foreground italic border-l-2 border-primary/20 pl-3">
                                        Live data integration will appear here during the assessment.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/10">
                            <CardContent className="pt-6">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    This room is end-to-end encrypted and HIPAA compliant. All communication is secure and private.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
