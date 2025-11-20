"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const tools = [
   {
      name: "API Documentation",
      description: "Complete API reference and integration guide",
      icon: "📚",
      status: "Available",
      link: "#",
   },
   {
      name: "Webhook Manager",
      description: "Configure and manage webhooks for your application",
      icon: "🔗",
      status: "Available",
      link: "#",
   },
   {
      name: "API Keys",
      description: "Generate and manage API keys for authentication",
      icon: "🔑",
      status: "Available",
      link: "#",
   },
   {
      name: "Request Logger",
      description: "View and debug API requests in real-time",
      icon: "📊",
      status: "Available",
      link: "#",
   },
   {
      name: "Rate Limits",
      description: "Monitor your API usage and rate limits",
      icon: "⚡",
      status: "Available",
      link: "#",
   },
   {
      name: "Sandbox Environment",
      description: "Test your integration in a safe environment",
      icon: "🧪",
      status: "Coming Soon",
      link: "#",
   },
];

export default function DeveloperToolsPage() {
   const { data: session, status } = useSession();
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   if (!mounted) return null;

   if (status === "unauthenticated") {
      redirect("/login");
   }

   if (status === "loading") {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pcolor" />
         </div>
      );
   }

   if (session?.user?.role !== "DEVELOPER") {
      redirect("/unauthorized");
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
         <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-12">
               <h1 className="text-4xl font-bold text-hcolor mb-2">Developer Tools</h1>
               <p className="text-muted-foreground">Powerful tools to build and integrate with our platform</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
               <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                     <div className="text-center">
                        <p className="text-3xl font-bold text-pcolor">0</p>
                        <p className="text-sm text-muted-foreground">API Calls Today</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                     <div className="text-center">
                        <p className="text-3xl font-bold text-pcolor">0</p>
                        <p className="text-sm text-muted-foreground">Active Webhooks</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                     <div className="text-center">
                        <p className="text-3xl font-bold text-pcolor">0%</p>
                        <p className="text-sm text-muted-foreground">Error Rate</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                     <div className="text-center">
                        <p className="text-3xl font-bold text-pcolor">99.9%</p>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {tools.map((tool) => (
                  <Card
                     key={tool.name}
                     className="border-border/50 bg-card/50 backdrop-blur hover:border-pcolor/50 transition-all hover:shadow-lg"
                  >
                     <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                           <span className="text-4xl">{tool.icon}</span>
                           <Badge
                              variant={tool.status === "Available" ? "default" : "secondary"}
                              className={tool.status === "Available" ? "bg-green-500/20 text-green-700" : ""}
                           >
                              {tool.status}
                           </Badge>
                        </div>
                        <CardTitle>{tool.name}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <Button
                           className="w-full bg-pcolor hover:bg-scolor"
                           disabled={tool.status !== "Available"}
                        >
                           {tool.status === "Available" ? "Access Tool" : "Coming Soon"}
                        </Button>
                     </CardContent>
                  </Card>
               ))}
            </div>

            {/* Documentation Section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur mt-12">
               <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Learn how to integrate with our API</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <h4 className="font-semibold text-foreground mb-2">Quick Start</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                           Get up and running with our API in just a few minutes. Follow our step-by-step guide.
                        </p>
                        <Button variant="outline">Read Guide</Button>
                     </div>
                     <div>
                        <h4 className="font-semibold text-foreground mb-2">API Reference</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                           Explore our complete API documentation with examples and use cases.
                        </p>
                        <Button variant="outline">View Reference</Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
