"use client";

import { BusinessInfoForm } from "@/components/admin/business-info/BusinessInfoForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Facebook, Globe, Instagram, Mail, MapPin, Pencil, Phone, Twitter, Youtube } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BusinessInfoPageClientProps {
   data: any[];
}

export function BusinessInfoPageClient({ data }: BusinessInfoPageClientProps) {
   const [isEditing, setIsEditing] = useState(false);
   const router = useRouter();

   // Since we enforce single entry, we typically deal with data[0]
   const info = data.length > 0 ? data[0] : null;

   const handleEdit = () => {
      setIsEditing(true);
   };

   const handleCancel = () => {
      setIsEditing(false);
   };

   // If no data, show FULL WIDTH FORM
   if (!info) {
      return (
         <div className="w-[95%] mx-auto py-10 space-y-6">
            <div className="text-center space-y-2">
               <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">Setup Business Info</h1>
               <p className="text-xl text-muted-foreground">It looks like you haven't set up your business details yet. Let's get started.</p>
            </div>
            <Card className="p-6 shadow-xl border-primary/20 bg-card/60 backdrop-blur">
               <BusinessInfoForm onSuccess={() => router.refresh()} />
            </Card>
         </div>
      );
   }

   // If Editing, show Form in Card
   if (isEditing) {
      return (
         <div className="w-[95%] mx-auto space-y-6 py-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Profile</h1>
                  <p className="text-muted-foreground">Update your business information.</p>
               </div>
               <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
            <Card className="p-6 shadow-2xl border-primary/20 bg-card">
               <BusinessInfoForm
                  initialData={info}
                  onSuccess={() => { setIsEditing(false); router.refresh(); }}
                  onCancel={handleCancel}
               />
            </Card>
         </div>
      );
   }

   // If data exists & Not Editing, show CARD VIEW
   return (
      <div className="w-[95%] mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight text-primary">Business Profile</h1>
               <p className="text-muted-foreground">Your business identity card.</p>
            </div>
            {/* Actions */}
            <div className="flex gap-3">
               <Button onClick={handleEdit} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                  <Pencil className="mr-2 h-4 w-4" /> Edit Profile
               </Button>
            </div>
         </div>

         <Card className="overflow-hidden shadow-2xl border-0 ring-1 ring-border/50 bg-linear-to-br from-card to-secondary/5">
            {/* Banner Section */}
            <div className="h-48 md:h-64 bg-muted relative bg-cover bg-center" style={{ backgroundImage: info.bannerSrc ? `url(${info.bannerSrc})` : undefined }}>
               {!info.bannerSrc && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-bold text-4xl uppercase tracking-widest">
                     No Banner
                  </div>
               )}
               <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

               {/* Logo Overlay */}
               <div className="absolute -bottom-10 left-8 md:left-12">
                  <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-card bg-white overflow-hidden shadow-xl flex items-center justify-center">
                     {info.logoSrc ? (
                        <img src={info.logoSrc} alt={info.logoAlt || info.name} className="h-full w-full object-cover" />
                     ) : (
                        <span className="text-4xl">🏢</span>
                     )}
                  </div>
               </div>
            </div>

            <CardHeader className="pt-14 pb-4 px-8 md:px-12">
               <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                     <h2 className="text-3xl font-extrabold text-foreground">{info.name}</h2>
                     {info.businessHours && (
                        <div className="flex items-center text-muted-foreground mt-1">
                           <Clock className="h-4 w-4 mr-2" />
                           <span>{info.businessHours}</span>
                        </div>
                     )}
                  </div>

                  {/* Socials Row */}
                  <div className="flex gap-4">
                     {info.website && (
                        <a href={info.website} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                           <Globe className="h-6 w-6" />
                        </a>
                     )}
                     {info.facebook && (
                        <a href={info.facebook} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-600 transition-colors">
                           <Facebook className="h-6 w-6" />
                        </a>
                     )}
                     {info.twitter && (
                        <a href={info.twitter} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-sky-500 transition-colors">
                           <Twitter className="h-6 w-6" />
                        </a>
                     )}
                     {info.instagram && (
                        <a href={info.instagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-pink-600 transition-colors">
                           <Instagram className="h-6 w-6" />
                        </a>
                     )}
                     {info.youtube && (
                        <a href={info.youtube} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-red-600 transition-colors">
                           <Youtube className="h-6 w-6" />
                        </a>
                     )}
                  </div>
               </div>
            </CardHeader>

            <Separator className="bg-border/50" />

            <CardContent className="p-8 md:px-12 grid gap-10 md:grid-cols-2">

               {/* Contact Information */}
               <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center text-primary">
                     <Phone className="h-5 w-5 mr-2" /> Contact Details
                  </h3>
                  <div className="grid gap-4 pl-2 border-l-2 border-primary/20">
                     {/* Phones */}
                     {info.phone && Array.isArray(info.phone) && info.phone.length > 0 ? (
                        <div className="space-y-2">
                           <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Phones</p>
                           {info.phone.map((p: any, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                                 <span className="font-mono text-foreground">{p.value}</span>
                                 <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.label}</span>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-muted-foreground italic">No phone numbers added.</p>
                     )}

                     {/* Emails */}
                     {info.email && Array.isArray(info.email) && info.email.length > 0 ? (
                        <div className="space-y-2 mt-4">
                           <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Emails</p>
                           {info.email.map((e: any, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                                 <span className="flex items-center text-foreground">
                                    <Mail className="h-3 w-3 mr-2 opacity-50" />
                                    {e.value}
                                 </span>
                                 <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{e.label}</span>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-muted-foreground italic">No emails added.</p>
                     )}
                  </div>
               </div>

               {/* Address Information */}
               <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center text-primary">
                     <MapPin className="h-5 w-5 mr-2" /> Location
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-6 border border-border/50 h-full">
                     {info.address ? (
                        <div className="space-y-2 text-lg">
                           {info.address.street && <p>{info.address.street}</p>}
                           <p>
                              {info.address.city && <span>{info.address.city}, </span>}
                              {info.address.state && <span>{info.address.state} </span>}
                              {info.address.postalCode && <span className="font-mono text-base text-muted-foreground">({info.address.postalCode})</span>}
                           </p>
                           {info.address.country && <p className="font-semibold text-foreground/80">{info.address.country}</p>}
                        </div>
                     ) : (
                        <p className="text-muted-foreground italic">No address provided.</p>
                     )}
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
