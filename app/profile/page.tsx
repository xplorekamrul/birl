"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
   const { data: session, status } = useSession();
   const [mounted, setMounted] = useState(false);
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      bio: "",
      website: "",
   });

   useEffect(() => {
      setMounted(true);
   }, []);

   useEffect(() => {
      if (session?.user) {
         const user = session.user as any;
         setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            bio: user.bio || "",
            website: user.website || "",
         });
      }
   }, [session]);

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

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
         const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });
         if (res.ok) {
            alert("Profile updated successfully!");
         }
      } catch (error) {
         console.error("Failed to update profile:", error);
         alert("Failed to update profile");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
         <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-4xl font-bold text-hcolor mb-2">Edit Profile</h1>
               <p className="text-muted-foreground">Update your personal information</p>
            </div>

            {/* Profile Form */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
               <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Keep your profile up to date</CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Name */}
                     <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                           id="name"
                           name="name"
                           value={formData.name}
                           onChange={handleChange}
                           placeholder="Your full name"
                           className="bg-background/50"
                        />
                     </div>

                     {/* Email */}
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                           id="email"
                           name="email"
                           type="email"
                           value={formData.email}
                           disabled
                           className="bg-background/50 opacity-60"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                     </div>

                     {/* Phone */}
                     <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                           id="phone"
                           name="phone"
                           value={formData.phone}
                           onChange={handleChange}
                           placeholder="+1 (555) 000-0000"
                           className="bg-background/50"
                        />
                     </div>

                     {/* Website */}
                     <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                           id="website"
                           name="website"
                           value={formData.website}
                           onChange={handleChange}
                           placeholder="https://example.com"
                           className="bg-background/50"
                        />
                     </div>

                     {/* Bio */}
                     <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                           id="bio"
                           name="bio"
                           value={formData.bio}
                           onChange={handleChange}
                           placeholder="Tell us about yourself"
                           className="bg-background/50 min-h-24"
                        />
                     </div>

                     {/* Submit Button */}
                     <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pcolor hover:bg-scolor"
                     >
                        {loading ? "Saving..." : "Save Changes"}
                     </Button>
                  </form>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
