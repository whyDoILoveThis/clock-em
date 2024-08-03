import { Owner, User } from "@/types/types.type";
import React from "react";

interface Props {
  user: Owner | User;
}

const OwnerDash = ({ user }: Props) => {
  return <div>{user.firstName}</div>;
};

export default OwnerDash;
