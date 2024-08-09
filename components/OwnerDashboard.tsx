import { Owner, User } from "@/types/types.type";
import React from "react";
import MyCompanies from "./MyCompanies";
import { useAuth } from "@clerk/nextjs";

interface Props {
  user: Owner;
}

const OwnerDash = ({ user }: Props) => {
  return (
    <div>
      {user.firstName}
      <MyCompanies owner={user} />
    </div>
  );
};

export default OwnerDash;
