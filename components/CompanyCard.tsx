"use client";
import { useState } from "react";
import Image from "next/image";
import { Company } from "@/types/types.type";
import UpdateCompanyForm from "./UpdateCompany";
import { useAuth } from "@clerk/nextjs";

interface Props {
  index: number;
  company: Company;
  ownerId?: string;
  forOwner?: boolean;
}

const CompanyCard = ({ index, company, ownerId, forOwner = false }: Props) => {
  const [showInfoIndex, setShowInfoIndex] = useState(-9);
  const [editCompanyIndex, setEditCompanyIndex] = useState(-9);
  const { userId } = useAuth();

  const handleRequestAccess = async (companyId: string) => {
    try {
      const response = await fetch("/api/requestAccess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId, userId }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Request sent successfully!");
      } else {
        alert(`Failed to send request: ${data.error}`);
      }
    } catch (error) {
      console.error("Error requesting access:", error);
    }
  };

  return (
    <div className="flex items-center">
      <div
        onClick={() => {
          setShowInfoIndex(index);
        }}
        className={`cursor-pointer border w-fit flex flex-col items-center m-4 mr-1 p-2 px-3 ${
          showInfoIndex === index ? "rounded-2xl" : "rounded-full"
        } `}
      >
        <div className="flex items-center ">
          {company.logoUrl && (
            <Image
              width={20}
              height={20}
              src={company.logoUrl}
              alt={company.name}
            />
          )}
          {company.name}
        </div>
        {showInfoIndex === index && (
          <div>
            {forOwner && (
              <button
                onClick={() => {
                  setEditCompanyIndex(index);
                }}
                className="btn"
              >
                edit
              </button>
            )}
            {forOwner && editCompanyIndex === index && (
              <UpdateCompanyForm
                ownerId={ownerId}
                companyId={company._id}
                initialData={company}
              />
            )}
            <p>{company.phone}</p>
            <p>{company.address}</p>
            <p>{company.estDate}</p>
            {!forOwner && (
              <button
                onClick={() => handleRequestAccess(company._id)}
                className="btn"
              >
                Request Access
              </button>
            )}
          </div>
        )}
      </div>
      {showInfoIndex === index && (
        <button
          className="btn"
          onClick={() => {
            setShowInfoIndex(-9);
            setEditCompanyIndex(-9);
          }}
        >
          close
        </button>
      )}
    </div>
  );
};

export default CompanyCard;
