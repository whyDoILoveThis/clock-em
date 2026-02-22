"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Company, User } from "@/types/types.type";
import UpdateCompanyForm from "./UpdateCompany";
import { useAuth, useUser } from "@clerk/nextjs";
import MyEmployees from "./MyEmployees";
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

  return (
    <div
      onClick={() => {
        if (!isOpen) setShowInfoIndex(index);
      }}
      className={`
        relative flex flex-col rounded-2xl transition-all duration-300
        ${
          isOpen
            ? "w-full max-w-md p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/40 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
            : "w-fit px-4 py-2 cursor-pointer bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/30 dark:border-slate-700/40 shadow-[0_2px_12px_-2px_rgba(99,102,241,0.08)] dark:shadow-[0_2px_12px_-2px_rgba(99,102,241,0.15)] hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)]"
        }
      `}
    >
      {/* Close button */}
      {isOpen && (
        <button
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowInfoIndex(-9);
            setEditCompanyIndex(-9);
          }}
        >
          <X size={16} />
        </button>
      )}

      {/* Company name + logo row */}
      <div className="flex items-center gap-2.5">
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
      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Company details */}
          <div className="space-y-2">
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
          </div>

          {/* Owner edit section */}
          {forOwner && (
            <div
              className={`${editCompanyIndex === index ? "rounded-xl p-4 bg-white/50 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/30" : ""}`}
            >
              <button
                onClick={() => {
                  setEditCompanyIndex(
                    editCompanyIndex !== index ? index : -999,
                  );
                }}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  editCompanyIndex === index
                    ? "bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
                }`}
              >
                {editCompanyIndex === index ? <X size={14} /> : "Edit"}
              </button>
              {editCompanyIndex === index && (
                <div className="mt-3">
                  <UpdateCompanyForm
                    ownerId={ownerId}
                    companyId={company._id}
                    initialData={company}
                  />
                </div>
              )}
            </div>
          )}

          {/* Owner requests section */}
          {forOwner && company.requests.length > 0 && (
            <div className="space-y-2">
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
            </div>
          )}

          {/* Owner employees */}
          {forOwner && <MyEmployees company={company} ownerId={ownerId} />}

          {/* Employee actions (search view) */}
          {!forOwner && (
            <div className="flex flex-wrap gap-2 pt-1">
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
              ) : requestStatus === "pending" || requestStatus === "sent" ? (
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyCard;
