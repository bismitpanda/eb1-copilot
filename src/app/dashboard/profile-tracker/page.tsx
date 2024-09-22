import React from "react";
import TrackerBoard from "./_components/traker-board";
import { api } from "@/trpc/server";
import OnboardingPlaceholder from "../_components/onboarding-placeholder";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";

const ProfileTrackerPage = async () => {
  const { sessionClaims } = auth();

  const userPillars = await api.userDetails.getUserPillars();
  const completedTickets = await api.kanban.getCompletedTickets();

  return (
    <div className="h-full w-full p-4 pb-0 pr-2">
      {/* <div className="flex w-full justify-between pb-2">
        <div></div>
        <div>
          <Button>
            <PlusIcon /> Add Visa Pillar details
          </Button>
        </div>
      </div> */}
      {!!sessionClaims?.metadata?.onBoarded && (
        <TrackerBoard
          addButton={true}
          userPillars={userPillars}
          completedTickets={completedTickets}
        />
      )}
      {!sessionClaims?.metadata?.onBoarded && (
        <OnboardingPlaceholder className="my-2 flex h-[calc(100vh-6rem)] w-[98%]" />
      )}
    </div>
  );
};

export default ProfileTrackerPage;
