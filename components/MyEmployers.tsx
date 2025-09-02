import { Company, Employer } from "@/types/types.type";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ClockInOut from "./ClockInOut";
import Timecards from "./Timecards";
import TimecardsSearch from "./TimecardSearch";
import { IoClose } from "react-icons/io5";
import { GoSearch } from "react-icons/go";
import { useTimecards } from "@/hooks/useTimecards";
import Loader from "./Loader";

interface Props {
  companies: Employer[];
  userId: string;
  refetch: () => Promise<any>;
}

const MyEmployers = ({ companies, userId, refetch }: Props) => {
  const [openCompanyCardIndex, setOpenCompanyCardIndex] = useState(-9);
  const [searchTimecards, setSearchTimecards] = useState(false);
  const [showTimeclock, setShowTimeclock] = useState(false);
  const [showTimecard, setShowTimecard] = useState(false);
  const companyId = companies[openCompanyCardIndex]?.userId || "";
  const { timecards, fetchTimecards, loading, error } = useTimecards(
    userId,
    companyId
  );
  const timecardsLoading = loading;
  const [timecardsReady, setTimecardsReady] = useState(false);

  useEffect(() => {
    if (timecards.length > 0) setTimecardsReady(true);
  }, [timecards]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-semibold mt-4 mb-2 border-b pb-2 text-indigo-600 dark:text-indigo-300">
        My Employers
      </h2>
      {companies.map((company, index) => {
        console.log(company);

        const thisCompanyIsSelected = openCompanyCardIndex === index;

        let isClockedIn = false;
        timecards.map((timecard) => {
          isClockedIn = timecard.days.some((day) => day.clockInStatus === true);
        });

        return (
          <div
            onClick={() =>
              openCompanyCardIndex !== index && setOpenCompanyCardIndex(index)
            }
            className={`
          shadow-2xl shadow-purple-950
        relative border w-fit flex flex-col m-4 p-2 px-3 ${
          thisCompanyIsSelected
            ? "rounded-2xl w-full max-w-[400px]"
            : "rounded-full cursor-pointer"
        } `}
            key={index}
          >
            {thisCompanyIsSelected && (
              <button
                className="absolute top-2 right-2 btn btn-round"
                onClick={() => setOpenCompanyCardIndex(-9)}
              >
                <IoClose width={20} height={20} />
              </button>
            )}
            <div className="flex items-center  gap-1">
              {company.logoUrl && (
                <Image
                  width={25}
                  height={25}
                  src={company.logoUrl}
                  alt={`${company.name}'s logo`}
                />
              )}
              <b>{company.name}</b>
            </div>
            {thisCompanyIsSelected && (
              <div>
                <div className="flex items-start gap-4">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {company.address}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {company.phone}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      ${company.hourlyRate}/hr
                    </p>
                    {isClockedIn ? (
                      <p className="inline-flex items-center rounded-full px-2 py-0.5 text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {!timecardsLoading && timecardsReady ? (
                          "clocked in"
                        ) : (
                          <Loader color="green" />
                        )}
                      </p>
                    ) : (
                      <p className="inline-flex items-center rounded-full px-2 py-0.5 text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {!timecardsLoading && timecardsReady ? (
                          "clocked out"
                        ) : (
                          <Loader color="red" />
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setShowTimeclock(true);
                      setShowTimecard(false);
                    }}
                    className={`btn mt-1 ${
                      showTimeclock &&
                      "dark:bg-white dark:bg-opacity-20 hover:dark:bg-opacity-20 "
                    }`}
                  >
                    Timeclock
                  </button>
                  <button
                    onClick={() => {
                      setShowTimecard(true);
                      setShowTimeclock(false);
                    }}
                    className={`btn mt-1 ${
                      !showTimeclock &&
                      showTimecard &&
                      "dark:bg-white dark:bg-opacity-20 hover:dark:bg-opacity-20 "
                    }`}
                  >
                    Time Cards
                  </button>

                  {(showTimecard || showTimeclock) && (
                    <button
                      className="btn btn-round h-fit mt-1 p-1 border-slate-700"
                      onClick={() => {
                        setShowTimeclock(false);
                        setShowTimecard(false);
                      }}
                    >
                      <IoClose width={20} height={20} />
                    </button>
                  )}
                </div>
                <article>
                  {showTimeclock && (
                    <div>
                      <h2 className=" flex gap-2 items-center pb-1 text-xl font-bold mt-2 mb-4 border-b">
                        Timeclock
                      </h2>
                      <ClockInOut
                        userId={userId}
                        companyId={company.userId}
                        isClockedIn={isClockedIn}
                        timecardsLoading={timecardsLoading}
                        timecardsReady={timecardsReady}
                        refetch={fetchTimecards}
                      />
                    </div>
                  )}

                  {showTimecard && (
                    <article>
                      <h2 className="flex gap-2 items-center pb-1 text-xl  font-bold mt-2 mb-4 border-b">
                        {!searchTimecards ? (
                          <p>Timecards</p>
                        ) : (
                          <p>Timecard Search</p>
                        )}
                        <button
                          className="cursor-pointer"
                          onClick={() => {
                            setSearchTimecards(!searchTimecards);
                          }}
                        >
                          {!searchTimecards ? (
                            <GoSearch />
                          ) : (
                            <div className="btn p-1">
                              <IoClose />
                            </div>
                          )}
                        </button>
                      </h2>
                      {searchTimecards ? (
                        <TimecardsSearch
                          userId={userId}
                          companyId={company.userId}
                        />
                      ) : (
                        <Timecards userId={userId} companyId={company.userId} />
                      )}
                    </article>
                  )}
                </article>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MyEmployers;
