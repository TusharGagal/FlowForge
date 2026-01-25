import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider,SidebarInset } from "@/components/ui/sidebar"
import React from "react";

const Layout=({children}:{children:React.ReactNode})=>{
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset className="bg-background">
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}

export default Layout;