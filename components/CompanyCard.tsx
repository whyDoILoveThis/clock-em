"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Company, User } from "@/types/types.type";
import UpdateCompanyForm from "./UpdateCompany";
import { useAuth, useUser } from "@clerk/nextjs";
import MyEmployees from "./MyEmployees";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Phone,
  Calendar,
  Loader2,
  Check,
  Clock,
  UserMinus,
} from "lucide-react";

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
    "",
  );
  const [userEmail, setUserEmail] = useState<string | null | undefined>("");
  const [userPhone, setUserPhone] = useState<string | null | undefined>("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "pending" | "sent" | "employed" | "error"
  >("idle");
  const [resignLoading, setResignLoading] = useState(false);

  useEffect(() => {
    setUserFullName(user?.fullName ? user.fullName : user?.username);
    setUserEmail(user?.emailAddresses[0]?.emailAddress);
    setUserPhone(user?.phoneNumbers?.[0]?.phoneNumber);
  }, [user]);

  // Determine current request status on mount
  useEffect(() => {
    if (!forOwner && company.employees?.some((e) => e.userId === userId)) {
      setRequestStatus("employed");
    } else if (
      !forOwner &&
      company.requests?.some(
        (r) => r.userId === userId && r.status === "pending",
      )
    ) {
      setRequestStatus("pending");
    }
  }, [company, userId, forOwner]);

  const checkUser = async (userId: string | null | undefined) => {
    try {
      const response = await fetch("/api/checkUserExists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok)
        throw new Error(
          `Network response was not ok, status: ${response.status}`,
        );
      const data = await response.json();
      if (data.user) {
        refetch();
        return data.user;
      }
    } catch (error) {
      console.error("❌ An error occurred:", error);
    }
  };

  const acceptRequest = async (
    userId: string,
    userFullName: string,
    userEmail: string,
    userPhone: string,
  ) => {
    try {
      const dbUser = await checkUser(userId);
      const response = await fetch("/api/acceptRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company._id,
          userId,
          userFullName,
          userEmail,
          userPhone,
          userAddress: dbUser?.address,
        }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      refetch();
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
    userPhone: string | null | undefined,
  ) => {
    setRequestLoading(true);
    setRequestStatus("idle");
    try {
      const dbUser = await checkUser(userId);
      const response = await fetch("/api/requestAccess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setRequestStatus("sent");
        refetch();
      } else {
        setRequestStatus("error");
      }
    } catch (error) {
      console.error("Error requesting access:", error);
      setRequestStatus("error");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResign = async () => {
    if (!confirm("Are you sure you want to resign from this company?")) return;
    setResignLoading(true);
    try {
      // Use the same delete/remove pattern - we'll call an endpoint or use existing API
      const response = await fetch("/api/requestAccess", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company._id,
          userId,
        }),
      });
      if (response.ok) {
        setRequestStatus("idle");
        refetch();
      }
    } catch (error) {
      console.error("Error resigning:", error);
    } finally {
      setResignLoading(false);
    }
  };

  const isOpen = showInfoIndex === index;
  const cardRef = useRef<HTMLDivElement>(null);
  const nameRowRef = useRef<HTMLDivElement>(null);
  const [pillWidth, setPillWidth] = useState<number | null>(null);

  // Measure pill width from the name row + padding (independent of expanded content)
  useEffect(() => {
    if (nameRowRef.current) {
      // name row width + left padding (16) + right padding (16) + border (2)
      setPillWidth(nameRowRef.current.scrollWidth + 34);
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onClick={() => {
        if (!isOpen) {
          setShowInfoIndex(index);
        }
      }}
      initial={false}
      animate={{
        width: isOpen ? "calc(100% - 1rem)" : (pillWidth ?? "auto"),
        paddingTop: isOpen ? 20 : 10,
        paddingBottom: isOpen ? 20 : 10,
        paddingLeft: isOpen ? 20 : 16,
        paddingRight: isOpen ? 20 : 16,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 28,
        mass: 1.2,
      }}
      className={`
        relative flex flex-col rounded-2xl ${isOpen ? "cursor-default" : "cursor-pointer"}
        ${
          isOpen
            ? "mx-2 max-w-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/40 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4)]"
            : "bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/30 dark:border-slate-700/40 shadow-[0_2px_12px_-2px_rgba(99,102,241,0.08)] dark:shadow-[0_2px_12px_-2px_rgba(99,102,241,0.15)] hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)]"
        }
      `}
    >
      {/* Close button */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -8 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
              mass: 0.8,
            }}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoIndex(-9);
              setEditCompanyIndex(-9);
            }}
          >
            <X size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Company name + logo row */}
      <div
        ref={nameRowRef}
        className="flex items-center gap-2.5 whitespace-nowrap"
      >
        {company.logoUrl && (
          <Image
            width={isOpen ? 36 : 22}
            height={isOpen ? 36 : 22}
            src={company.logoUrl}
            alt={company.name}
            className="rounded-lg object-cover"
          />
        )}
        <span
          className={`font-semibold ${isOpen ? "text-lg text-slate-900 dark:text-white" : "text-sm text-slate-800 dark:text-slate-200"}`}
        >
          {company.name}
        </span>
      </div>

      {/* Expanded info */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              height: {
                type: "spring",
                stiffness: 180,
                damping: 26,
                mass: 1.2,
              },
              opacity: {
                duration: 0.35,
                ease: [0.25, 0.1, 0.25, 1],
              },
            }}
            className="overflow-hidden w-full"
            style={{ minWidth: 0 }}
          >
            <motion.div
              className="mt-4 space-y-4"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.15,
                  },
                },
              }}
            >
              {/* Company details */}
              <motion.div
                className="space-y-2"
                variants={{
                  hidden: { opacity: 0, y: 8, x: -6 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    transition: { type: "spring", stiffness: 300, damping: 30 },
                  },
                }}
              >
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    {company.phone}
                  </div>
                )}
                {company.address && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    {company.address}
                  </div>
                )}
                {company.estDate && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    Est. {company.estDate}
                  </div>
                )}
              </motion.div>

              {/* Owner edit section */}
              {forOwner && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 8, x: -6 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      x: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      },
                    },
                  }}
                >
                  <button
                    onClick={() => {
                      setEditCompanyIndex(
                        editCompanyIndex !== index ? index : -999,
                      );
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                      editCompanyIndex === index
                        ? "bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300"
                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                    }`}
                  >
                    {editCompanyIndex === index ? (
                      <>
                        <X size={13} />
                        Close
                      </>
                    ) : (
                      "Edit Company"
                    )}
                  </button>

                  {/* Animated edit form */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      editCompanyIndex === index
                        ? "max-h-[2000px] opacity-100 mt-3"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-xl p-[1px]">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-blue-400/10 to-cyan-500/20 rounded-xl" />
                      <div className="relative rounded-xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl p-5">
                        <UpdateCompanyForm
                          ownerId={ownerId}
                          companyId={company._id}
                          initialData={company}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Owner requests section */}
              {forOwner && company.requests.length > 0 && (
                <motion.div
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0, y: 8, x: -6 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      x: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      },
                    },
                  }}
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Pending Requests
                  </h3>
                  {company.requests.map(
                    (request, idx) =>
                      request.status === "pending" && (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                              {request.userFullName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {request.userPhone}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              acceptRequest(
                                request.userId,
                                request.userFullName,
                                request.userEmail,
                                request.userPhone,
                              )
                            }
                            className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                          >
                            Accept
                          </button>
                        </div>
                      ),
                  )}
                </motion.div>
              )}

              {/* Owner employees */}
              {forOwner && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 8, x: -6 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      x: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      },
                    },
                  }}
                >
                  <MyEmployees company={company} ownerId={ownerId} />
                </motion.div>
              )}

              {/* Employee actions (search view) */}
              {!forOwner && (
                <motion.div
                  className="flex flex-wrap gap-2 pt-1"
                  variants={{
                    hidden: { opacity: 0, y: 8, x: -6 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      x: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      },
                    },
                  }}
                >
                  {requestStatus === "employed" ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Check size={13} />
                        Employed
                      </span>
                      <button
                        onClick={handleResign}
                        disabled={resignLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50"
                      >
                        {resignLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <UserMinus size={13} />
                        )}
                        {resignLoading ? "Resigning..." : "Resign"}
                      </button>
                    </>
                  ) : requestStatus === "pending" ||
                    requestStatus === "sent" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Clock size={13} />
                      Request Pending
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        handleRequestAccess(
                          company._id,
                          userId,
                          userFullName,
                          userEmail,
                          userPhone,
                        )
                      }
                      disabled={requestLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {requestLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Requesting...
                        </>
                      ) : requestStatus === "error" ? (
                        "Retry Request"
                      ) : (
                        "Request Access"
                      )}
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CompanyCard;
