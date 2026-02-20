"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { Video, Calendar, User, ArrowRight, RefreshCw, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface SharedCall {
    id: string;
    patientName: string;
    roomId: string;
    joinLink: string;
    timestamp: string;
    status: string;
}

export default function DoctorDashboardPage() {
    const [calls, setCalls] = useState<SharedCall[]>([]);
    const [loading, setLoading] = useState(true);
    const { isLoaded, user } = useUser();

    const fetchCalls = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/doctor/calls");
            const data = await response.json();
            // Sort by newest first
            setCalls(data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (error) {
            console.error("Failed to fetch calls:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalls();
    }, []);

    if (!isLoaded) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Stethoscope className="h-8 w-8 text-primary" />
                            Doctor Dashboard
                        </h1>
                        <p className="text-muted-foreground italic">Welcome back, Dr. {user?.lastName || user?.firstName}</p>
                    </div>
                    <Button onClick={fetchCalls} variant="outline" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh List
                    </Button>
                </FadeIn>

                <section className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        Shared Consultation Requests
                    </h2>

                    {calls.length === 0 ? (
                        <Card className="border-dashed py-12">
                            <CardContent className="flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-muted rounded-full">
                                    <Calendar className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">No active consultation requests at the moment.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {calls.map((call) => (
                                <FadeIn key={call.id}>
                                    <Card className="group hover:border-primary/50 transition-colors shadow-sm overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{call.patientName}</h3>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(call.timestamp).toLocaleString()}
                                                            </span>
                                                            <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                                {call.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Button variant="outline" asChild>
                                                        <Link href={`/doctor/room/${call.roomId}`}>
                                                            Preview Room
                                                        </Link>
                                                    </Button>
                                                    <Button asChild className="group-hover:translate-x-1 transition-transform">
                                                        <Link href={`/doctor/room/${call.roomId}`} className="gap-2">
                                                            Join Consultation
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </FadeIn>
                            ))}
                        </div>
                    )}
                </section>

                <Card className="bg-muted/30 border-none">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-semibold mb-2">Notice for Medical Professionals</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Consultations initiated through this dashboard are encrypted. Please ensure you are in a private environment before joining a call.
                            Always verify patient identity before proceeding with medical advice.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
