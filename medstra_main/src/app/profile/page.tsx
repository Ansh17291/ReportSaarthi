 "use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/animations/fade-in";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useUser } from "@clerk/nextjs";
import {
  User,
  Settings,
  Bell,
  Shield,
  Activity,
  Calendar,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Mock data for demonstration
const recentAssessments = [
  {
    id: 1,
    type: "Cardiovascular Health",
    date: "2024-02-20",
    score: 92,
    status: "completed",
  },
  {
    id: 2,
    type: "Neurological Screening",
    date: "2024-02-15",
    score: 88,
    status: "completed",
  },
];

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <FadeIn>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName || "Profile"}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user?.fullName}</h1>
                <p className="text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </FadeIn>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="assessments" className="gap-2">
                <Activity className="h-4 w-4" />
                Assessments
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          defaultValue={user?.fullName || ""}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={
                            user?.primaryEmailAddress?.emailAddress || ""
                          }
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input id="dateOfBirth" type="date" />
                      </div>
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="Enter height"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="Enter weight"
                        />
                      </div>
                    </div>
                    <Button>Update Medical Info</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assessments">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentAssessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{assessment.type}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {assessment.date}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              {assessment.score}%
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4" />
                              {assessment.status}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        title: "Assessment Reminders",
                        description:
                          "Receive reminders for upcoming assessments",
                        icon: Bell,
                      },
                      {
                        title: "Report Updates",
                        description:
                          "Get notified when new reports are available",
                        icon: FileText,
                      },
                    ].map((setting) => (
                      <div
                        key={setting.title}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <setting.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{setting.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {setting.description}
                            </div>
                          </div>
                        </div>
                        <Switch />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Data Sharing</div>
                          <div className="text-sm text-muted-foreground">
                            Share assessment data with insurance providers
                          </div>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}