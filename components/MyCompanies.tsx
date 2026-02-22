"use client";
import React, { useEffect, useState } from "react";
import AddCompany from "./Owners/AddCompany";
import { useAuth } from "@clerk/nextjs";
import { Owner } from "@/types/types.type";
import DeleteCompanyForm from "./DeletePopOver";
import CompanyCard from "./CompanyCard";
import ItsDropdown from "./ui/ItsDropdown";
import IconThreeDots from "./icons/IconThreeDots";
import { ChevronDown, Plus } from "lucide-react";

interface Props {
  owner: Owner;
  refetch: () => Promise<any>;
}

const MyCompanies = ({ owner, refetch }: Props) => {
  const [editCompanys, setEditCompanys] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    owner.companies.length <= 0 && setEditCompanys(false);
  }, [owner.companies.length]);

  return (
    <div className="relative">
      <div>
        {owner.companies.length <= 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Add Your First Company
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Get started by creating your first company
              </p>
            </div>

            {/* Glassy form container */}
            <div className="relative overflow-hidden rounded-2xl p-[1px] w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-blue-400/20 to-cyan-500/40 rounded-2xl" />
              <div className="relative rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8">
                <AddCompany ownerId={userId} refetch={refetch} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl w-fit font-bold mt-4 mb-2 border-b">
              My Companies
            </h2>
            <div className="flex flex-col items-center">
              {owner.companies.length > 0 && (
                <ItsDropdown
                  closeWhenClicked
                  btnText={<IconThreeDots size={20} />}
                  btnClassNames="btn btn-round"
                  menuClassNames="-translate-x-20"
                >
                  <button
                    className="btn text-nowrap text-red-600 dark:text-red-400"
                    onClick={() => {
                      setEditCompanys(!editCompanys);
                    }}
                  >
                    Delete Companies
                  </button>
                </ItsDropdown>
              )}
            </div>
            <ul className="flex flex-col w-full items-center gap-4">
              {owner.companies.map((company, idx) => (
                <li
                  className="w-full flex justify-center max-w-lg m-2"
                  key={idx}
                >
                  <CompanyCard
                    index={idx}
                    company={company}
                    ownerId={owner.userId}
                    forOwner={true}
                    refetch={refetch}
                  />
                </li>
              ))}
            </ul>

            {/* Add Company Form Section — Collapsible */}
            <div className="w-full max-w-md mt-8 mb-8">
              <button
                type="button"
                onClick={() => setShowAddCompany((p) => !p)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/30 dark:border-slate-700/40 hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {showAddCompany ? (
                  <ChevronDown
                    size={16}
                    className="rotate-180 transition-transform duration-300"
                  />
                ) : (
                  <Plus size={16} />
                )}
                {showAddCompany ? "Hide" : "Add Another Company"}
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showAddCompany
                    ? "max-h-[2000px] opacity-100 mt-4"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl p-[1px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-blue-400/20 to-cyan-500/40 rounded-2xl" />
                  <div className="relative rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                      Add Another Company
                    </h3>
                    <AddCompany ownerId={userId} refetch={refetch} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {editCompanys && (
        <DeleteCompanyForm
          ownerId={userId}
          theCompanies={owner.companies}
          refetch={refetch}
          onClose={() => setEditCompanys(false)}
        />
      )}
    </div>
  );
};

export default MyCompanies;
