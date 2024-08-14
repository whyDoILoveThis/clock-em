"use client";
import React, { useEffect, useState } from "react";
import AddCompany from "./AddCompany";
import { useAuth } from "@clerk/nextjs";
import { Owner } from "@/types/types.type";
import DeleteCompanyForm from "./DeletePopOver";
import CompanyCard from "./CompanyCard";
import MyEmployees from "./MyEmployees";

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
    <div className="relative border rounded-2xl m-1 p-6">
      <div
        className={`${editCompanys && owner.companies.length > 0 && "blur-lg"}`}
      >
        {owner.companies.length <= 0 ? (
          <p className="my-4">
            Get started by adding a company to your list 💼
          </p>
        ) : (
          owner.companies.map((company, index) => (
            <div key={index}>
              <CompanyCard
                index={index}
                company={company}
                ownerId={owner.userId}
                forOwner={true}
                refetch={refetch}
              />
            </div>
          ))
        )}
      </div>
      <div className="flex flex-col items-center">
        {owner.companies.length > 0 && (
          <button
            className="btn absolute top-0 right-0 m-1"
            onClick={() => {
              setEditCompanys(!editCompanys);
            }}
          >
            {editCompanys ? "Done" : "Edit"}
          </button>
        )}

        <button
          className="btn mb-2"
          onClick={() => setIsAddingCompany(!isAddingCompany)}
        >
          {isAddingCompany ? "Done" : "+"}
        </button>
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
