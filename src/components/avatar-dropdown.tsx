"use client";

import { LogOut, Moon, Sun, User, UserIcon } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export function AvatarDropdown() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useNextTheme();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Failed to get session:", error);
        return;
      }
      const session = data.session;
      if (session?.user) {
        setUser({
          name:
            session.user.user_metadata?.name || session.user.email || "Unknown",
          email: session.user.email || "",
          avatarUrl: session.user.user_metadata?.avatar_url || "",
        });
      }
    })();
  }, [supabase]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast("Something went wrong...", {
        description: error.message,
      });
    } else {
      toast("Logged out successfully", {
        description: "You have been logged out.",
      });
      redirect("/");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || ""} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || "Guest"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/account")}>
            <User className="mr-2 h-4 w-4" />
            <span>Account settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {resolvedTheme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
