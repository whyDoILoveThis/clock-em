import { Company } from "@/types/types.type";
import { useState, useEffect } from "react";
import Image from "next/image";

const DeleteCompanyForm = ({
  ownerId,
  theCompanies,
}: {
  ownerId: string | null | undefined;
  theCompanies: Company[];
}) => {
  const [companies, setCompanies] = useState<Company[]>(theCompanies);
  const [message, setMessage] = useState("");

  const handleDelete = async (companyId: string) => {
    try {
      const response = await fetch("/api/deleteCompany", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, companyId }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);

      if (data.message) {
        setCompanies(companies.filter((company) => company._id !== companyId));
      }
    } catch (error) {
      console.error("❌ An error occurred:", error);
    }
  };

  return (
    <>
      {theCompanies.length > 0 && (
        <div>
          <h2>Delete Company</h2>
          {message && <p>{message}</p>}
          <ul>
            {companies !== undefined &&
              companies.map((company) => (
                <li
                  className="flex gap-1 items-center border w-fit  m-4 p-2 px-3 rounded-full"
                  key={company._id}
                >
                  {company.logoUrl && (
                    <Image
                      width={20}
                      height={20}
                      src={company.logoUrl}
                      alt={""}
                    />
                  )}
                  {company.name}
                  <button
                    className="btn btn-red"
                    onClick={() => handleDelete(company._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default DeleteCompanyForm;
