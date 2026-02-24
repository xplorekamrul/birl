"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
   type: string;
   description: string;
   time: string;
}

interface RecentActivityClientProps {
   activities: Activity[];
}

export function RecentActivityClient({ activities }: RecentActivityClientProps) {
   return (
      <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
         <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               {activities.length > 0 ? (
                  activities.map((activity, idx) => (
                     <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/50">
                        <div>
                           <p className="font-medium text-foreground">{activity.type}</p>
                           <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                     </div>
                  ))
               ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
               )}
            </div>
         </CardContent>
      </Card>
   );
}
