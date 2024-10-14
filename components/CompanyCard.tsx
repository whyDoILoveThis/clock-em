"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Company, User } from "@/types/types.type";
import UpdateCompanyForm from "./UpdateCompany";
import { useAuth, useUser } from "@clerk/nextjs";
import MyEmployees from "./MyEmployees";
import { IoClose } from "react-icons/io5";

interface Props {
  index: number;
  company: Company;
  ownerId?: string;
  forOwner?: boolean;
  refetch: () => Promise<any>;
}

const CompanyCard = ({
  index,
  company,
  ownerId,
  forOwner = false,
  refetch,
}: Props) => {
  const [showInfoIndex, setShowInfoIndex] = useState(-9);
  const [editCompanyIndex, setEditCompanyIndex] = useState(-9);
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [userFullName, setUserFullName] = useState<string | null | undefined>(
    ""
  );
  const [userEmail, setUserEmail] = useState<string | null | undefined>("");
  const [userPhone, setUserPhone] = useState<string | null | undefined>("");

  useEffect(() => {
    setUserFullName(user?.fullName ? user.fullName : user?.username);
    setUserEmail(user?.emailAddresses[0].emailAddress);
    setUserPhone(user?.phoneNumbers[0].phoneNumber);
  }, [user]);
  console.log(userFullName, userEmail, userPhone);

  const checkUser = async (userId: string | null | undefined) => {
    try {
      const response = await fetch("/api/checkUserExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(
          `Network response was not ok, status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.user) {
        console.log(data.user);
        refetch();
        return data.user;
      } else {
      }
    } catch (error) {
      console.error("❌ An error occurred:", error);
    }
  };

  const acceptRequest = async (
    userId: string,
    userFullName: string,
    userEmail: string,
    userPhone: string
  ) => {
    try {
      const dbUser = await checkUser(userId);
      const response = await fetch("/api/acceptRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: company._id,
          userId,
          userFullName,
          userEmail,
          userPhone,
          userAddress: dbUser?.address,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      refetch();
      if (data.message === "Request accepted") {
      } else {
        console.error("Failed to accept request ❌");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      refetch();
    }
  };

  const handleRequestAccess = async (
    companyId: string,
    userId: string | null | undefined,
    userFullName: string | null | undefined,
    userEmail: string | null | undefined,
    userPhone: string | null | undefined
  ) => {
    try {
      const dbUser = await checkUser(userId);
      console.log(userId);

      const response = await fetch("/api/requestAccess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          userId,
          userFullName,
          userEmail,
          userPhone,
          userAddress: dbUser?.address,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Request sent successfully!");
        refetch();
      } else {
        alert(`Failed to send request: ${data.error}`);
      }
    } catch (error) {
      console.error("Error requesting access:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={() => {
          showInfoIndex !== index && setShowInfoIndex(index);
        }}
        className={`
          shadow-2xl shadow-purple-950
        relative border w-fit flex flex-col m-4 p-2 px-3 ${
          showInfoIndex === index
            ? "rounded-2xl w-full"
            : "rounded-full cursor-pointer"
        } `}
      >
        {showInfoIndex === index && (
          <button
            className="btn p-1 m-1 border-slate-700 absolute top-0 right-0"
            onClick={() => {
              setShowInfoIndex(-9);
              setEditCompanyIndex(-9);
            }}
          >
            <IoClose width={20} height={20} />
          </button>
        )}
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

            {forOwner && company.requests.length > 0 && (
              <div>
                <h2 className="font-bold text-center border-b mb-2">
                  Requests
                </h2>
                {company.requests.map((request, index) => {
                  return (
                    <div key={index}>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <p>{request.userFullName}</p>
                          <p>{request.userPhone}</p>
                          <button
                            onClick={() =>
                              acceptRequest(
                                request.userId,
                                request.userFullName,
                                request.userEmail,
                                request.userPhone
                              )
                            }
                            className="btn"
                          >
                            {request.status}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div>
              {forOwner && <MyEmployees company={company} ownerId={ownerId} />}
              {!forOwner && (
                <>
                  {company.employees?.some(
                    (employee) => employee.userId === userId
                  ) ? ( // Check if the user is an employee
                    <button className="btn btn-grn" disabled>
                      Employed
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleRequestAccess(
                          company._id,
                          userId,
                          userFullName,
                          userEmail,
                          userPhone
                        )
                      }
                      className="btn"
                    >
                      Request Access
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
