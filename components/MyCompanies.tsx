"use client";
import React, { useEffect, useState } from "react";
import AddCompany from "./Owners/AddCompany";
import { useAuth } from "@clerk/nextjs";
import { Owner } from "@/types/types.type";
import DeleteCompanyForm from "./DeletePopOver";
import CompanyCard from "./CompanyCard";
import MyEmployees from "./MyEmployees";
import ItsDropdown from "./ui/ItsDropdown";
import IconThreeDots from "./icons/IconThreeDots";

interface Props {
  owner: Owner;
  refetch: () => Promise<any>;
}

const MyCompanies = ({ owner, refetch }: Props) => {
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editCompanys, setEditCompanys] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    owner.companies.length <= 0 && setEditCompanys(false);
  }, [owner.companies.length]);

  return (
    <div className=" relative ">
      <div
        className={` ${
          editCompanys && owner.companies.length > 0 && "blur-lg"
        }`}
      >
        {owner.companies.length <= 0 ? (
          <p className="my-4">
            Get started by adding a company to your list 💼
          </p>
        ) : (
          <div className=" flex flex-col items-center">
            <h2 className="text-2xl w-fit font-bold mt-4 mb-2 border-b">
              My Companies
            </h2>
            <div className="flex flex-col items-center">
              <ItsDropdown
                closeWhenClicked
                btnText={<IconThreeDots size={20} />}
                btnClassNames="btn btn-round"
                menuClassNames="-translate-x-20"
              >
                <button
                  className="btn mb-2"
                  onClick={() => setIsAddingCompany(!isAddingCompany)}
                >
                  {isAddingCompany ? "Done" : "New Company"}
                </button>
                {owner.companies.length > 0 && (
                  <button
                    className="btn text-nowrap"
                    onClick={() => {
                      setEditCompanys(!editCompanys);
                    }}
                  >
                    {editCompanys ? "Done" : "Edit Companies"}
                  </button>
                )}
              </ItsDropdown>
            </div>
            <ul className="flex flex-col w-full items-center gap-4">
              {owner.companies.map((company, idx) => (
                <li
                  className="w-full flex justify-center max-w-[400px] m-2"
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
          </div>
        )}
      </div>

      {isAddingCompany && <AddCompany ownerId={userId} refetch={refetch} />}
      {editCompanys && (
        <DeleteCompanyForm
          ownerId={userId}
          theCompanies={owner.companies}
          refetch={refetch}
        />
      )}
    </div>
  );
};

export default MyCompanies;
