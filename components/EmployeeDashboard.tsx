import { Owner, User } from "@/types/types.type";
import React from "react";
import SearchCompany from "./SearchCompany";

interface Props {
  user: User | Owner;
}

const UserDash = ({ user }: Props) => {
  return (
    <div>
      {user.fullName}
      <SearchCompany />
    </div>
  );
};

export default UserDash;
