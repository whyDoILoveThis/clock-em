import { Company } from "@/types/types.type";
import React, { useState } from "react";
import { MdInfoOutline } from "react-icons/md";

interface Props {
  company: Company;
}

const MyEmployees = ({ company }: Props) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div>
      <h2 className="font-bold border-b mt-4 mb-2">Employees</h2>
      {company.employees?.map((employee, index) => (
        <div
          key={index}
          className={`flex flex-col items-center justify-center border px-2 w-fit ${
            showInfo ? "rounded-2xl px-3 p-2" : "rounded-full"
          }`}
        >
          <div className="flex gap-1 items-center">
            <p>{employee.fullName}</p>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-fit h-fit"
            >
              {showInfo ? "-" : <MdInfoOutline width="40px" />}
            </button>
          </div>
          {showInfo && (
            <div>
              <p>{employee.age}</p>
              <p>{employee.phone}</p>
              <p>{employee.address}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyEmployees;
