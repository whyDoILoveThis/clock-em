import { Owner, User } from "@/types/types.type";
import React from "react";
import SearchCompany from "./SearchCompany";

interface Props {
  user: User | Owner;
  refetch: () => Promise<any>;
}

const UserDash = ({ user, refetch }: Props) => {
  return (
    <div>
      {user.fullName}
      <SearchCompany refetch={refetch} />
    </div>
  );
};

export default UserDash;
