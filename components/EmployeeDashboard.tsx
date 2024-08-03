import { Owner, User } from "@/types/types.type";
import React from "react";

interface Props {
  user: User | Owner;
}

const UserDash = ({ user }: Props) => {
  return <div>{user.fullName}</div>;
};

export default UserDash;
