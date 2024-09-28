import { Owner, User } from "@/types/types.type";
import React from "react";
import MyCompanies from "./MyCompanies";
import { useAuth } from "@clerk/nextjs";

interface Props {
  user: Owner;
  refetch: () => Promise<any>;
}

const OwnerDash = ({ user, refetch }: Props) => {
  return (
    <div>
      <MyCompanies owner={user} refetch={refetch} />
    </div>
  );
};

export default OwnerDash;
