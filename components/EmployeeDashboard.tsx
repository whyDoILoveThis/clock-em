import { Owner, User } from "@/types/types.type";
import React, { useState } from "react";
import SearchCompany from "./SearchCompany";
import MyEmployers from "./MyEmployers";
import { Search, Briefcase } from "lucide-react";

interface Props {
  user: User;
  refetch: () => Promise<any>;
}

const UserDash = ({ user, refetch }: Props) => {
  const [search, setSearch] = useState(!user.employers && true);

  return (
    <div className="w-full">
      {/* Toggle tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-xl p-1 bg-white/40 dark:bg-slate-800/50 backdrop-blur-lg border border-white/20 dark:border-slate-700/40 shadow-sm">
          <button
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              search
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
            onClick={() => setSearch(true)}
          >
            <Search size={15} />
            Search
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              !search
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
            onClick={() => setSearch(false)}
          >
            <Briefcase size={15} />
            My Employers
          </button>
        </div>
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
