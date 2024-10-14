import { Company } from "@/types/types.type";
import React, { useState } from "react";
import { MdInfoOutline } from "react-icons/md";
import Timecards from "./Timecards";
import axios from "axios";
import { FiEdit2 } from "react-icons/fi";
import { IoClose, IoSearch } from "react-icons/io5";
import TimecardsSearch from "./TimecardSearch";
interface Props {
  company: Company;
  ownerId: string | undefined;
}

const MyEmployees = ({ company, ownerId }: Props) => {
  const [showInfo, setShowInfo] = useState(false);
  const [editingRate, setEditingRate] = useState(false); // Track which employee's rate is being edited
  const [newRate, setNewRate] = useState(0.0); // Store the new hourly rate
  const [loading, setLoading] = useState(false); // Track loading state
  const [searchTimecards, setSearchTimecards] = useState(false);

  const updateHourlyRateAPI = async (employeeId: string) => {
    try {
      setLoading(true);
      const response = await axios.put("/api/updateEmployeeRate", {
        ownerId, // Include the owner's ID
        companyId: company._id, // Include the company's ID
        employeeId, // The employee's ID
        newHourlyRate: newRate, // New hourly rate value
      });

      if (response.status === 200) {
        alert("Hourly rate updated successfully");
        setEditingRate(false);
        setNewRate(newRate);
      }
    } catch (error) {
      console.error("Error updating hourly rate:", error);
      alert("Failed to update hourly rate");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHourlyRate = (employeeId: string) => {
    if (isNaN(newRate) || newRate <= 0) {
      alert("Please enter a valid hourly rate.");
      return;
    }

    // Proceed with updating the rate
    updateHourlyRateAPI(employeeId);
  };

  return (
    <div>
      <h2 className="font-bold border-b mt-4 mb-2">Employees</h2>
      <div
        className={`${
          showInfo &&
          "z-50 bg-black bg-opacity-10 backdrop-blur-xl  top-0 left-0 flex justify-center"
        } `}
      >
        {company.employees?.map((employee, index) => (
          <div
            key={index}
            className={` flex flex-col items-center justify-center px-2 w-fit ${
              showInfo ? "rounded-2xl px-3 p-2" : "rounded-full border"
            }`}
          >
            <div className="flex gap-1 items-center">
              <p>{employee.fullName}</p>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-fit h-fit"
              >
                {showInfo ? (
                  <button className="btn p-1 absolute right-0 top-0 m-1">
                    <IoClose />
                  </button>
                ) : (
                  <MdInfoOutline width="40px" />
                )}
              </button>
            </div>
            {showInfo && (
              <div>
                <p>{employee.phone}</p>
                <p>{employee.address}</p>
                <div className="flex gap-1">
                  <p>${newRate > 0 ? newRate : employee.hourlyRate}/hr</p>
                  <button
                    onClick={() => setEditingRate(!editingRate)}
                    className="btn p-1 mb-1 border-slate-700"
                  >
                    {!editingRate ? (
                      <FiEdit2 />
                    ) : (
                      <IoClose width={20} height={20} />
                    )}
                  </button>
                </div>
                {editingRate && (
                  <article className="flex flex-col gap-2">
                    <label htmlFor="hourlyRate">Hourly Rate:</label>
                    <input
                      type="number"
                      id="hourlyRate"
                      value={newRate}
                      onChange={(e) => setNewRate(parseFloat(e.target.value))}
                      step="0.01" // Allow decimal input
                      min="0"
                      className="search-bar bg-slate-950 bg-opacity-65 outline-none border-slate-700"
                      placeholder="Enter hourly rate"
                    />
                    <button
                      className="btn"
                      onClick={() => handleUpdateHourlyRate(employee.userId)}
                    >
                      Update Hourly Rate
                    </button>
                  </article>
                )}
                {searchTimecards ? (
                  <div className="flex flex-col gap-1 items-center">
                    <button
                      onClick={() => {
                        setSearchTimecards(false);
                      }}
                      className="flex gap-1 items-center"
                    >
                      <b>Timecard Search</b>
                      <div className="btn p-1">
                        <IoClose />
                      </div>
                    </button>

                    <TimecardsSearch
                      userId={employee.userId}
                      companyId={company._id}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 items-center">
                    <button
                      onClick={() => {
                        setSearchTimecards(true);
                      }}
                      className="flex gap-1 items-center"
                    >
                      <b>Timecards</b>
                      <div className="btn p-1">
                        <IoSearch />
                      </div>
                    </button>
                    <Timecards
                      userId={employee.userId}
                      companyId={company._id}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyEmployees;
