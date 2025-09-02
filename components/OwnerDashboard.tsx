import { Owner, User } from "@/types/types.type";
import React from "react";
import MyCompanies from "./MyCompanies";
import { useAuth } from "@clerk/nextjs";
import FloatingLightBall from "./FloatingBall";

interface Props {
  user: Owner;
  refetch: () => Promise<any>;
}

const OwnerDash = ({ user, refetch }: Props) => {
  return (
    <div className="w-full">
      <MyCompanies owner={user} refetch={refetch} />
    </div>
  );
};

export default OwnerDash;
