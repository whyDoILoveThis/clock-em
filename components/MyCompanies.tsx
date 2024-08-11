"use client";
import React, { useEffect, useState } from "react";
import AddCompany from "./AddCompany";
import { useAuth } from "@clerk/nextjs";
import { Owner, User } from "@/types/types.type";
import Image from "next/image";
import DeleteCompanyForm from "./DeletePopOver";
import UpdateCompanyForm from "./UpdateCompany";
import CompanyCard from "./CompanyCard";

const MyCompanies = ({ owner }: { owner: Owner }) => {
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [showInfoIndex, setShowInfoIndex] = useState(-9);
  const [editCompanys, setEditCompanys] = useState(false);
  const [editCompanyIndex, setEditCompanyIndex] = useState(-9);

  const { userId } = useAuth();

  return (
    <div className="relative border rounded-2xl m-1 p-6">
      <div className={`${editCompanys && "blur-lg"}`}>
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
              editCompanys && window.location.reload();
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
      {isAddingCompany && <AddCompany ownerId={userId} />}
      {editCompanys && (
        <DeleteCompanyForm ownerId={userId} theCompanies={owner.companies} />
      )}
    </div>
  );
};

export default MyCompanies;
