import { Company } from "@/types/types.type";
import React, { useState } from "react";
import { MdInfoOutline } from "react-icons/md";
import Timecards from "./Timecards";
import axios from "axios";
import { DateTime } from "luxon";
import { FiEdit2 } from "react-icons/fi";
import { IoClose, IoSearch } from "react-icons/io5";
import TimecardsSearch from "./TimecardSearch";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  company: Company;
  ownerId: string | undefined;
}

const MyEmployees = ({ company, ownerId }: Props) => {
  const [showInfo, setShowInfo] = useState(false);
  const [editingRate, setEditingRate] = useState(false); // Track which employee's rate is being edited
  const [editingTimecard, setEditingTimecard] = useState(false);
  const [newRate, setNewRate] = useState(0.0); // Store the new hourly rate
  const [loading, setLoading] = useState(false); // Track loading state
  const [searchTimecards, setSearchTimecards] = useState(false);
  const [refreshTimecards, setRefreshTimecards] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [clockIn, setClockIn] = useState<string>("");
  const [clockOut, setClockOut] = useState<string>("");

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

  const updateEmployeeTimeAPI = async (
    employeeId: string,
    clear: boolean = false
  ) => {
    try {
      setLoading(true);
      // Use America/Chicago as the local zone for owner
      const zone = "America/Chicago";
      // Date for the day (midnight UTC)
      const selectedDateDT = DateTime.fromISO(selectedDate, { zone });
      const selectedDateTimestamp = selectedDateDT.toUTC().toISO();
      // Clock in/out times (convert local time to UTC)
      const clockInTimestamp = clockIn
        ? DateTime.fromISO(`${selectedDate}T${clockIn}`, { zone })
            .toUTC()
            .toISO()
        : null;
      const clockOutTimestamp = clockOut
        ? DateTime.fromISO(`${selectedDate}T${clockOut}`, { zone })
            .toUTC()
            .toISO()
        : null;
      console.log("Sending request to update employee time:", {
        ownerId,
        companyId: company._id,
        employeeId,
        date: selectedDateTimestamp,
        clockIn: clear ? null : clockInTimestamp,
        clockOut: clear ? null : clockOutTimestamp,
        clear,
      });
      const response = await axios.put("/api/updateEmployeeTime", {
        ownerId,
        companyId: company._id,
        employeeId,
        date: selectedDateTimestamp,
        clockIn: clear ? null : clockInTimestamp,
        clockOut: clear ? null : clockOutTimestamp,
        clear,
      });

      if (response.status === 200) {
        alert("Employee time updated successfully");
        setSelectedDate("");
        setClockIn("");
        setClockOut("");
        setRefreshTimecards((prev) => prev + 1); // trigger refetch
      } else {
        console.error("Failed to update employee time:", response.data);
      }
    } catch (error) {
      console.error("Error updating employee time:", error);
      alert("Failed to update employee time");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployeeTime = (
    employeeId: string,
    clear: boolean = false
  ) => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    if (!clear && (!clockIn || !clockOut)) {
      alert("Please enter both clock-in and clock-out times.");
      return;
    }

    updateEmployeeTimeAPI(employeeId, clear);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3 mt-4 border-b pb-2">
        Employees ({company.employees?.length})
      </h2>
      <div>
        {/** Map the Employees */}
        {company.employees?.map((employee, index) => (
          <button
            key={index}
            type="button"
            className={`${
              showInfo ? "!cursor-default w-full" : "w-fit"
            } flex items-center flex-col p-3 rounded-lg overflow-hidden bg-slate-900/10 dark:bg-slate-700/20 backdrop-blur-sm shadow-sm border border-gray-100/30 dark:border-slate-700/20`}
            onClick={() => {
              if (!showInfo) setShowInfo(true);
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <p className="text-lg font-medium ">{employee.fullName}</p>
                <button className="text-slate-500 dark:text-slate-300">
                  {showInfo ? (
                    <button
                      onClick={() => {
                        setShowInfo(false);
                      }}
                      className="btn btn-round absolute right-0 top-0 m-1"
                    >
                      <IoClose />
                    </button>
                  ) : (
                    <MdInfoOutline width="20px" />
                  )}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col mb-4 items-center">
                    <div
                      className={`flex place-self-start gap-2 items-center mb-4 ${
                        editingRate &&
                        "rounded-lg p-2 bg-slate-700/10 dark:bg-slate-600/20"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          ${newRate > 0 ? newRate : employee.hourlyRate}/hr
                        </p>
                        <button
                          onClick={() => setEditingRate(!editingRate)}
                          className="btn btn-round p-1 "
                        >
                          {!editingRate ? (
                            <FiEdit2 />
                          ) : (
                            <IoClose width={18} height={18} />
                          )}
                        </button>
                      </span>
                      {editingRate && (
                        <article className="flex flex-col gap-2">
                          <label htmlFor="hourlyRate">Hourly Rate:</label>
                          <input
                            type="number"
                            id="hourlyRate"
                            value={newRate}
                            onChange={(e) =>
                              setNewRate(parseFloat(e.target.value))
                            }
                            step="0.01"
                            min="0"
                            className="w-full px-2 py-1 border !border-slate-500 !border-opacity-40 rounded bg-white/80 dark:!bg-slate-950/60"
                            placeholder="Enter hourly rate"
                          />
                          <button
                            className="inline-flex items-center w-fit px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                            onClick={() =>
                              handleUpdateHourlyRate(employee.userId)
                            }
                          >
                            Update Hourly Rate
                          </button>
                        </article>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {employee.phone}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {employee.address}
                    </p>
                    <button
                      onClick={() => setEditingTimecard(!editingTimecard)}
                      className="place-self-start btn-primary"
                    >
                      {!editingTimecard
                        ? "Edit A Timecard"
                        : "Cancel Timecard Edit"}
                    </button>
                    {editingTimecard && (
                      <div className="flex flex-col gap-2 mb-4">
                        <label
                          htmlFor="selectedDate"
                          className="text-sm text-slate-700 dark:text-slate-300"
                        >
                          Date:
                        </label>
                        <input
                          type="date"
                          id="selectedDate"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white/80 dark:bg-slate-800/60"
                        />
                        <label
                          htmlFor="clockIn"
                          className="text-sm text-slate-700 dark:text-slate-300"
                        >
                          Clock In:
                        </label>
                        <input
                          type="time"
                          id="clockIn"
                          value={clockIn}
                          onChange={(e) => setClockIn(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white/80 dark:bg-slate-800/60"
                        />
                        <label
                          htmlFor="clockOut"
                          className="text-sm text-slate-700 dark:text-slate-300"
                        >
                          Clock Out:
                        </label>
                        <input
                          type="time"
                          id="clockOut"
                          value={clockOut}
                          onChange={(e) => setClockOut(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white/80 dark:bg-slate-800/60"
                        />
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                            onClick={() =>
                              handleUpdateEmployeeTime(employee.userId)
                            }
                          >
                            Update Time
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded"
                            onClick={() =>
                              handleUpdateEmployeeTime(employee.userId, true)
                            }
                          >
                            Clear Time
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 items-center">
                      <button
                        onClick={() => {
                          setSearchTimecards(!searchTimecards);
                        }}
                        className="flex gap-1 items-center"
                      >
                        <b>
                          {searchTimecards ? "Timecard Search" : "Timecards"}
                        </b>
                        <div className="btn btn-round p-1">
                          {!searchTimecards ? <IoSearch /> : <IoClose />}
                        </div>
                      </button>

                      {searchTimecards ? (
                        <TimecardsSearch
                          userId={employee.userId}
                          companyId={company._id}
                        />
                      ) : (
                        <Timecards
                          userId={employee.userId}
                          companyId={company._id}
                          key={refreshTimecards}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MyEmployees;
