import { Company, Employer } from "@/types/types.type";
import Image from "next/image";
import React, { useState } from "react";
import ClockInOut from "./ClockInOut";
import Timecards from "./Timecards";
import TimecardsSearch from "./TimecardSearch";
import { IoClose } from "react-icons/io5";
import { GoSearch } from "react-icons/go";

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

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-2xl font-bold mt-4 mb-2 border-b">My Employers</h2>
      {companies.map((company, index) => {
        console.log(company);

        let isClockedIn = false;
        company.timecards.map((timecard) => {
          isClockedIn = timecard.days.some((day) => day.clockInStatus === true);
        });
        return (
          <div
            onClick={() => {
              openCompanyCardIndex !== index && setOpenCompanyCardIndex(index);
            }}
            className={`  shadow-2xl shadow-purple-950 my-3 border relative p-2 px-4 ${
              openCompanyCardIndex !== index && "cursor-pointer rounded-full "
            } ${
              openCompanyCardIndex === index &&
              "rounded-2xl w-screen max-w-[350px]"
            }`}
            key={index}
          >
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
            {openCompanyCardIndex === index && (
              <div>
                {" "}
                <div className="flex">
                  <div>
                    <p>{company.address}</p>
                    <p>{company.phone}</p>
                    <p>${company.hourlyRate}/hr</p>
                    {isClockedIn ? (
                      <p className="w-fit rounded-full px-1 leading-none text-sm btn-grn">
                        clocked in
                      </p>
                    ) : (
                      <p className="w-fit rounded-full px-1 leading-none text-sm btn-red">
                        clocked out
                      </p>
                    )}
                  </div>
                  <button
                    className="btn absolute top-0 right-0 h-fit m-1 p-1 border-slate-700"
                    onClick={() => {
                      setOpenCompanyCardIndex(-9);
                    }}
                  >
                    <IoClose width={20} height={20} />
                  </button>
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
                  {showTimeclock && (
                    <button
                      className="btn h-fit mt-1 p-1 border-slate-700"
                      onClick={() => {
                        setShowTimeclock(false);
                        setShowTimecard(false);
                      }}
                    >
                      <IoClose width={20} height={20} />
                    </button>
                  )}
                  {showTimecard && (
                    <button
                      className="btn h-fit mt-1 p-1 border-slate-700"
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
                        Timeclock{" "}
                        <button
                          onClick={() => {
                            setShowTimeclock(false);
                          }}
                          className="btn p-1"
                        >
                          <IoClose />
                        </button>
                      </h2>
                      <ClockInOut
                        userId={userId}
                        companyName={company.name}
                        isClockedIn={isClockedIn}
                        refetch={refetch}
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
