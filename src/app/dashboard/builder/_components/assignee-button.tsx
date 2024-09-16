import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlusIcon } from "@radix-ui/react-icons";
import { api } from "@/trpc/react";
import { type User } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loader from "@/components/elements/loader";
import { usePathname, useSearchParams } from "next/navigation";

type AssigneeButtonProps = {
  assigneeId: string | null;
  setAssigneeId: React.Dispatch<React.SetStateAction<string | null>>;
  disabled: boolean;
};

function extractUserId(pathname: string) {
  const regex = /\/dashboard\/ticket-management\/(user_[\w]+)(?:\/|$)/;
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

const AssigneeButton = ({
  assigneeId,
  setAssigneeId,
  disabled,
}: AssigneeButtonProps) => {
  // TODO: move this call to in the custom kanban component
  const pathname = usePathname();
  const userPathId = extractUserId(pathname);
  const customerUser = api.userManagement.getUser.useQuery({
    userId: userPathId!,
  });
  const vendors = api.userManagement.getAllVendors.useQuery();
  const assignableUsers = vendors.data?.concat(customerUser.data ?? []);
  const assignee = assignableUsers?.find((v) => v.id === assigneeId);
  const [openAssigneePopover, setOpenAssigneePopover] = React.useState(false);

  return (
    <div>
      <Popover open={openAssigneePopover} onOpenChange={setOpenAssigneePopover}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            className="flex h-full w-full flex-wrap items-center justify-start gap-1 "
            size={"sm"}
            variant="ghost"
          >
            <div className="flex w-full flex-wrap gap-1 font-mono ">
              {!assignee && (
                <div className="flex gap-1 rounded-sm px-2 py-1 text-foreground">
                  <PlusIcon className="" />
                  Assignee
                </div>
              )}
              {!!assignee && (
                <div
                  key={assignee.id}
                  className="flex items-center gap-2 font-sans text-sm font-normal"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={assignee.imageUrl} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <span>{`${assignee.firstName} ${assignee.lastName}`}</span>
                </div>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="h-full max-h-full p-0"
          side="bottom"
          align="start"
        >
          <Command
            filter={(value, search) => {
              if (search && value && vendors.status === "success") {
                const vendor = vendors.data.find((v) => v.id === value);
                if (!vendor) return 0;
                if (
                  (vendor.firstName ?? "")
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  (vendor.lastName ?? "")
                    .toLowerCase()
                    .includes(search.toLowerCase())
                ) {
                  return 1;
                }
              }

              return 0;
            }}
          >
            <CommandInput placeholder="Select Vendor..." />
            <CommandList>
              {vendors.status === "pending" && (
                <CommandEmpty>
                  <Loader />
                </CommandEmpty>
              )}
              {vendors.status === "success" && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              <CommandGroup heading="Customer">
                <CommandItem
                  value={customerUser.data?.id}
                  className="flex items-center gap-2"
                  onSelect={(value) => {
                    setAssigneeId(value);
                    setOpenAssigneePopover(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={customerUser.data?.imageUrl} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span>{`${customerUser.data?.firstName} ${customerUser.data?.lastName}`}</span>
                  </div>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Vendors">
                {vendors.status === "success" &&
                  vendors.data.map((vendor) => (
                    <CommandItem
                      key={vendor.id}
                      value={vendor.id}
                      className="flex items-center gap-2"
                      onSelect={(value) => {
                        setAssigneeId(value);
                        // setAssignee(vendors.data?.find((v) => v.id === value));
                        setOpenAssigneePopover(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={vendor.imageUrl} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <span>{`${vendor.firstName} ${vendor.lastName}`}</span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AssigneeButton;
