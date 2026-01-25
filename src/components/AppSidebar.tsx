"use client"
import { Folder, Key, HistoryIcon, LogOutIcon } from "lucide-react";
import React from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";


const menuItems = [
  {
    title: "Main",
    items: [
      {
        title: "Workflows",
        icon: Folder,
        url: "/workflows",
      },
      {
        title: "Credentials",
        icon: Key,
        url: "/credentials",
      },
      {
        title: "Executions",
        icon: HistoryIcon,
        url: "/executions",
      }
    ],
  }
];

const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4">
            <Link href="/" prefetch>
              <Image src="/logos/logo.svg" alt="FlowForge" width={30} height={30} />
              <span className="font-semibold text-sm">FlowForge</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      asChild
                      className="gap-x-4 h-10 px-4"
                      isActive={item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)}
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>

                    </SidebarMenuButton>
                  </SidebarMenuItem>

                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem >
          <SidebarMenuButton asChild tooltip="Sign out" className="gap-x-4 mb-3"
            onClick={async() => await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/login");
                  toast.success("You are Logged Out. PLease Login again")
                }
              }
            })}>
            <Link href="">
              <LogOutIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </Link>
          </SidebarMenuButton>
          <div className="flex flex-col items-center text-xs">
            <p>FlowForge &#9400; 2026</p>
            <p>Built By Tushar Gagal</p>
          </div>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
