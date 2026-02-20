"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/animations/fade-in";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-16">
        <FadeIn>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get in touch with our team for support or inquiries
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <FadeIn>
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea placeholder="How can we help?" />
                  </div>
                  <Button className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Contact Information */}
          <FadeIn delay={0.2}>
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Get in Touch</h2>
                <p className="text-muted-foreground">
                  Our team is here to help with any questions about our platform
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    label: "Email",
                    value: "support@medstra.com",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "+1 (555) 123-4567",
                  },
                  {
                    icon: MapPin,
                    label: "Address",
                    value: "123 AI Medical Center, Silicon Valley, CA",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {item.label}
                      </div>
                      <div className="font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
} 