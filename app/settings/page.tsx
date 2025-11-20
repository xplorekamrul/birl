"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
   const { data: session, status } = useSession();
   const [mounted, setMounted] = useState(false);
   const [settings, setSettings] = useState({
      notificationsEnabled: true,
      emailNotifications: true,
      smsNotifications: false,
      preferredLanguage: "en",
   });

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

   const handleToggle = (key: keyof typeof settings) => {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
   };

   const handleSave = async () => {
      try {
         const res = await fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
         });
         if (res.ok) {
            alert("Settings saved successfully!");
         }
      } catch (error) {
         console.error("Failed to save settings:", error);
         alert("Failed to save settings");
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
         <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-4xl font-bold text-hcolor mb-2">Settings</h1>
               <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            {/* Notification Settings */}
            <Card className="border-border/50 bg-card/50 backdrop-blur mb-6">
               <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Control how you receive updates</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                  {/* All Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/50">
                     <div>
                        <Label className="text-base font-medium">All Notifications</Label>
                        <p className="text-sm text-muted-foreground">Enable or disable all notifications</p>
                     </div>
                     <Switch
                        checked={settings.notificationsEnabled}
                        onCheckedChange={() => handleToggle("notificationsEnabled")}
                     />
                  </div>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/50">
                     <div>
                        <Label className="text-base font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                     </div>
                     <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={() => handleToggle("emailNotifications")}
                        disabled={!settings.notificationsEnabled}
                     />
                  </div>

                  {/* SMS Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/50">
                     <div>
                        <Label className="text-base font-medium">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                     </div>
                     <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={() => handleToggle("smsNotifications")}
                        disabled={!settings.notificationsEnabled}
                     />
                  </div>
               </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-border/50 bg-card/50 backdrop-blur mb-6">
               <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>Manage your privacy settings</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                     <h4 className="font-medium text-foreground mb-2">Change Password</h4>
                     <p className="text-sm text-muted-foreground mb-4">Update your password regularly to keep your account secure</p>
                     <Button variant="outline">Change Password</Button>
                  </div>
                  <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                     <h4 className="font-medium text-foreground mb-2">Two-Factor Authentication</h4>
                     <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                     <Button variant="outline">Enable 2FA</Button>
                  </div>
               </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-border/50 bg-card/50 backdrop-blur mb-6">
               <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                     <Label className="text-base font-medium">Preferred Language</Label>
                     <select
                        value={settings.preferredLanguage}
                        onChange={(e) => setSettings((prev) => ({ ...prev, preferredLanguage: e.target.value }))}
                        className="mt-2 w-full px-3 py-2 rounded-md bg-background border border-border text-foreground"
                     >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                     </select>
                  </div>
               </CardContent>
            </Card>

            {/* Save Button */}
            <Button
               onClick={handleSave}
               className="w-full bg-pcolor hover:bg-scolor"
            >
               Save Settings
            </Button>
         </div>
      </div>
   );
}
