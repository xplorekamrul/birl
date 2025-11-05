import { DefaultSession } from "next-auth";

type AppRole =
  | "DEVELOPER"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "USER"   
  | "VENDOR";

type AppStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;    
      status: AppStatus;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: AppRole;      
    status: AppStatus;  
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AppRole;      
    status: AppStatus;  
  }
}
