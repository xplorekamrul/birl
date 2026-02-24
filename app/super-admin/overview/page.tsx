import { getSuperAdminDashboardData } from "@/actions/admin/dashboard-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RecentActivityClient } from "./RecentActivityClient";

export default async function SuperAdminOverviewPage() {
   const session = await getServerSession(authOptions);

   if (!session) {
      redirect("/login");
   }

   if (session?.user?.role !== "SUPER_ADMIN") {
      redirect("/unauthorized");
   }

   const data = await getSuperAdminDashboardData();
   const { stats, recentActivities, error } = data;

   return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 py-12 px-4">
         <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-4xl font-bold text-hcolor mb-2">Dashboard</h1>
               <p className="text-muted-foreground">Welcome back, Super Admin</p>
            </div>

            {error && (
               <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-200">
                  {error}
               </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               {stats.map((stat) => (
                  <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur">
                     <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm text-muted-foreground">{stat.label}</p>
                              <p className="text-3xl font-bold text-hcolor mt-2">{stat.value}</p>
                           </div>
                           <span className={`text-4xl ${stat.color}`}>{stat.icon}</span>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Recent Activity (Client Component mixed with Server Data) */}
               <RecentActivityClient activities={recentActivities} />

               {/* Quick Actions */}
               <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                     <CardTitle>Quick Actions</CardTitle>
                     <CardDescription>Common tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     <Link href="/super-admin/users">
                        <Button className="w-full bg-pcolor hover:bg-scolor justify-start mb-3">
                           <span className="mr-2">👥</span> Manage Users
                        </Button>
                     </Link>
                     <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">🏪</span> Manage Vendors
                     </Button>
                     <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">📦</span> View Orders
                     </Button>
                     <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">⚙️</span> System Settings
                     </Button>
                  </CardContent>
               </Card>
            </div>

            {/* System Health */}
            <Card className="border-border/50 bg-card/50 backdrop-blur mt-6">
               <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Platform status and performance</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-sm font-medium text-foreground">API Status</span>
                           <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-700">
                              Operational
                           </span>
                        </div>
                        <p className="text-xs text-muted-foreground">All systems running normally</p>
                     </div>
                     <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-sm font-medium text-foreground">Database</span>
                           <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-700">
                              Healthy
                           </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Response time: 45ms</p>
                     </div>
                     <div className="p-4 rounded-lg bg-background/30 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-sm font-medium text-foreground">Uptime</span>
                           <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-700">
                              99.9%
                           </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
