import { Owner, User } from "@/types/types.type";
import React, { useState } from "react";
import SearchCompany from "./SearchCompany";
import MyEmployers from "./MyEmployers";

interface Props {
  user: User;
  refetch: () => Promise<any>;
}

const UserDash = ({ user, refetch }: Props) => {
  const [search, setSearch] = useState(!user.employers && true);

  return (
    <div>
      <div className=" w-full flex justify-center gap-1">
        <button
          className={`btn ${
            search &&
            "bg-black bg-opacity-25 border border-black border-opacity-50 dark:bg-white dark:bg-opacity-15"
          }`}
          onClick={() => {
            setSearch(true);
          }}
        >
          Search
        </button>
        <button
          className={`btn ${
            !search &&
            "bg-black bg-opacity-25 border border-black border-opacity-50 dark:bg-white dark:bg-opacity-15"
          }`}
          onClick={() => {
            setSearch(false);
          }}
        >
          My Employers
        </button>
      </div>
      {search && <SearchCompany refetch={refetch} />}
      {user.employers && !search && (
        <MyEmployers
          companies={user.employers}
          userId={user.userId}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default UserDash;
