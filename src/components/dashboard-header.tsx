"use client";

import { createClient } from "@/utils/supabase/client";
import { BoxIcon, ChevronDown, Shield, Slash, UsersIcon } from "lucide-react";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AvatarDropdown } from "./avatar-dropdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const supabase = createClient();

type Project = {
  value: string;
  label: string;
};

const projects: Project[] = [
  {
    value: "PINASElections",
    label: "PINASElections",
  },
  {
    value: "TsaIkNotes",
    label: "TsaIkNotes",
  },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const [currentPathname, setCurrentPathname] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);

  useEffect(() => {
    setCurrentPathname(pathname);
  }, [pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        redirect("/dashboard/login");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session) {
            const { user } = session;
            if (!user) {
              redirect("/dashboard/login");
            }
          }
        } else if (event === "SIGNED_OUT") {
          redirect("/dashboard/login");
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Shield className="h-6 w-6" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            {/^\/dashboard\/.+$/.test(currentPathname || "") && (
              <>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-2 text-base font-semibold"
                      >
                        <BoxIcon className="mr-2 h-4 w-4" />
                        {selectedProject.label}
                        <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-64" align="start">
                      <Command>
                        <CommandInput placeholder="Find project..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {projects.map((project) => (
                              <CommandItem
                                key={project.value}
                                value={project.value}
                                onSelect={() => {
                                  setSelectedProject(project);
                                  setOpen(false);
                                }}
                              >
                                <BoxIcon className="mr-2 h-4 w-4" />
                                <span>{project.label}</span>
                                {selectedProject.value === project.value && (
                                  <span className="ml-auto text-primary">
                                    ✔
                                  </span>
                                )}
                              </CommandItem>
                            ))}
                            <CommandItem
                              onSelect={() => {
                                // handle new project creation here
                                setOpen(false);
                              }}
                            >
                              <span className="mr-2 text-lg">＋</span>
                              <span>New Election</span>
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        {/* Spacer */}
        <div className="flex-1" />

        {/^\/dashboard\/.+$/.test(currentPathname || "") && (
          <Button variant="default" size="default" className="mr-2">
            <UsersIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Invite Admins</span>
          </Button>
        )}

        {/* Avatar */}
        <AvatarDropdown />
      </div>
    </header>
  );
}
