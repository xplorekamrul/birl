"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const faqs = [
   {
      category: "Orders",
      items: [
         {
            question: "How do I track my order?",
            answer: "You can track your order by going to 'My Orders' in your account. Each order will show the current status and tracking information.",
         },
         {
            question: "Can I cancel my order?",
            answer: "Orders can be cancelled within 24 hours of placement. After that, please contact our support team.",
         },
         {
            question: "What is your return policy?",
            answer: "We offer 30-day returns on most items. Items must be unused and in original packaging.",
         },
      ],
   },
   {
      category: "Payments",
      items: [
         {
            question: "What payment methods do you accept?",
            answer: "We accept credit cards, debit cards, mobile money, bank transfers, and cash on delivery.",
         },
         {
            question: "Is my payment information secure?",
            answer: "Yes, we use industry-standard encryption to protect your payment information.",
         },
         {
            question: "Can I use multiple payment methods?",
            answer: "Currently, you can only use one payment method per order.",
         },
      ],
   },
   {
      category: "Account",
      items: [
         {
            question: "How do I reset my password?",
            answer: "Click 'Forgot Password' on the login page and follow the instructions sent to your email.",
         },
         {
            question: "Can I change my email address?",
            answer: "Email addresses cannot be changed directly. Please contact support for assistance.",
         },
         {
            question: "How do I delete my account?",
            answer: "You can request account deletion from your settings page. This action is permanent.",
         },
      ],
   },
];

export default function HelpPage() {
   const [searchQuery, setSearchQuery] = useState("");
   const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

   const filteredFaqs = faqs
      .map((category) => ({
         ...category,
         items: category.items.filter(
            (item) =>
               item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.answer.toLowerCase().includes(searchQuery.toLowerCase())
         ),
      }))
      .filter((category) => category.items.length > 0);

   return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
         <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
               <h1 className="text-4xl font-bold text-hcolor mb-2">Help & Documentation</h1>
               <p className="text-muted-foreground mb-6">Find answers to common questions</p>

               {/* Search */}
               <div className="relative max-w-md mx-auto">
                  <Input
                     type="text"
                     placeholder="Search help articles..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="bg-background/50 pl-10"
                  />
                  <svg
                     className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                     />
                  </svg>
               </div>
            </div>

            {/* FAQs */}
            <div className="space-y-6 mb-12">
               {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((category) => (
                     <div key={category.category}>
                        <h2 className="text-2xl font-bold text-hcolor mb-4">{category.category}</h2>
                        <div className="space-y-3">
                           {category.items.map((item, idx) => {
                              const faqId = `${category.category}-${idx}`;
                              const isExpanded = expandedFaq === faqId;

                              return (
                                 <Card
                                    key={faqId}
                                    className="border-border/50 bg-card/50 backdrop-blur cursor-pointer hover:border-pcolor/50 transition-colors"
                                    onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                                 >
                                    <CardHeader className="pb-3">
                                       <div className="flex items-start justify-between gap-4">
                                          <CardTitle className="text-base">{item.question}</CardTitle>
                                          <svg
                                             className={`w-5 h-5 text-pcolor flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""
                                                }`}
                                             fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                             />
                                          </svg>
                                       </div>
                                    </CardHeader>
                                    {isExpanded && (
                                       <CardContent className="pt-0">
                                          <p className="text-muted-foreground">{item.answer}</p>
                                       </CardContent>
                                    )}
                                 </Card>
                              );
                           })}
                        </div>
                     </div>
                  ))
               ) : (
                  <Card className="border-border/50 bg-card/50 backdrop-blur">
                     <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">No results found for "{searchQuery}"</p>
                        <Button
                           variant="outline"
                           onClick={() => setSearchQuery("")}
                        >
                           Clear Search
                        </Button>
                     </CardContent>
                  </Card>
               )}
            </div>

            {/* Contact Support */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
               <CardHeader>
                  <CardTitle>Still need help?</CardTitle>
                  <CardDescription>Can't find what you're looking for?</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                     Our support team is here to help. Reach out to us through any of these channels:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                        <h4 className="font-medium text-foreground mb-2">Email</h4>
                        <p className="text-sm text-muted-foreground">support@birl.com</p>
                     </div>
                     <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                        <h4 className="font-medium text-foreground mb-2">Phone</h4>
                        <p className="text-sm text-muted-foreground">+1 (555) 000-0000</p>
                     </div>
                     <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                        <h4 className="font-medium text-foreground mb-2">Live Chat</h4>
                        <p className="text-sm text-muted-foreground">Available 24/7</p>
                     </div>
                  </div>
                  <Button className="w-full bg-pcolor hover:bg-scolor">Contact Support</Button>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
