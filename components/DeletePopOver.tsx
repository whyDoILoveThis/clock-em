import { Company } from "@/types/types.type";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  ownerId: string | null | undefined;
  theCompanies: Company[];
  refetch: () => Promise<any>;
}

const DeleteCompanyForm = ({ ownerId, theCompanies, refetch }: Props) => {
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
      refetch();

      if (data.message) {
        setCompanies(companies.filter((company) => company._id !== companyId));
        refetch();
      }
    } catch (error) {
      console.error("❌ An error occurred:", error);
    }
  };

  return (
    <>
      {theCompanies.length > 0 && (
        <div className=" flex flex-col items-center border border-red-700 border-opacity-30 dark:border-opacity-40 bg-red-600 bg-opacity-10 rounded-2xl">
          <h2 className="text-center font-bold border-b border-red-800 dark:border-opacity-80 my-2 text-xl text-red-900 dark:text-red-200">
            Delete Company
          </h2>
          <p className="mx-4 text-red-700 dark:text-red-400">
            ⚠ DANGER ⚠: this action can NOT be undone! Like, EVER!{" "}
          </p>
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
