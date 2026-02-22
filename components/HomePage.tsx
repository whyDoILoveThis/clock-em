"use client";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import AddUser from "@/components/AddUser";
import AddOwner from "@/components/AddOwner";
import { Owner, User } from "@/types/types.type";
import OwnerDash from "@/components/OwnerDashboard";
import UserDash from "@/components/EmployeeDashboard";
import { useQuery } from "react-query";
import "@/styles/Wave.css";
import Loader from "./Loader";
import FloatingLightBall from "./FloatingBall";
import MouseRope from "./MouseRope";
import { Building2, HardHat, RotateCcw } from "lucide-react";

const HomePage = () => {
  const { isSignedIn, user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState<User | Owner>();
  const { userId } = useAuth();
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [addingUser, setAddingUser] = useState(false);
  const [addingOwner, setAddingOwner] = useState(false);
  const [doTheWave, setDoTheWave] = useState(true);
  const [isWaving, setIsWaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  // Use React Query to fetch the user data
  const [queryUserId, setQueryUserId] = useState("");
  useEffect(() => {
    if (!userId) return;
    setQueryUserId(userId);
  }, [userId]);

  useEffect(() => {
    setTimeout(() => {
      setDoTheWave(false);
    }, 3000);
  }, []);

  console.log(queryUserId);

  const {
    data: queryUser,
    error,
    isLoading,
    refetch,
  } = useQuery<User, Error>(["user", queryUserId], () =>
    checkUser(queryUserId),
  );

  useEffect(() => {
    refetch();
  }, [queryUserId]);

  const handleWave = () => {
    setDoTheWave(true);
    setTimeout(() => {
      setIsWaving(true);
    }, 1000);
  };

  // Check if current user is a demo-fresh account
  const isDemoFresh =
    clerkUser?.emailAddresses?.[0]?.emailAddress === "demo-fresh@test.com";

  const handleResetRole = async () => {
    if (!userId) return;
    setIsResetting(true);
    try {
      await fetch("/api/resetDemoUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      // Refetch to show role selection again
      setUserExists(false);
      setDbUser(undefined);
      setAddingUser(false);
      setAddingOwner(false);
      await refetch();
    } catch (error) {
      console.error("Reset error:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const checkUser = async (userId: string) => {
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
          `Network response was not ok, status: ${response.status}`,
        );
      }

      const data = await response.json();

      if (data.user) {
        console.log(data.user);

        setDbUser(data.user);
        setUserExists(true);
      } else {
        setUserExists(false);
      }

      setUserExists(data.exists);
      return data.user;
    } catch (error) {
      console.error("❌ An error occurred:", error);
    }
  };

  useEffect(() => {
    if (isSignedIn && userId) {
      console.log(`Checking user with ID: ${userId}`); // Log the userId being checked
    }
  }, [isSignedIn, userId]);

  console.log(queryUser);

  if (isLoading)
    return (
      <div className="w-full h-full flex items-center justify-center ">
        <Loader />
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className="flex flex-col items-center mb-6">
      {!userExists ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent mb-3">
              Welcome!
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Choose how you&apos;d like to use Clock &apos;em
            </p>
          </div>

          {/* Role Cards */}
          {!addingUser && !addingOwner ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {/* Owner Card */}
              <button
                onClick={() => {
                  setAddingUser(false);
                  setAddingOwner(true);
                }}
                className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 via-blue-400/30 to-indigo-500/50 rounded-2xl" />
                <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 transition-all duration-300 group-hover:bg-white/60 dark:group-hover:bg-slate-900/60">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                    <Building2
                      size={32}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      Company Owner
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Manage employees, timecards & companies
                    </p>
                  </div>
                  <div className="mt-2 px-4 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    I manage a team
                  </div>
                </div>
              </button>

              {/* Employee Card */}
              <button
                onClick={() => {
                  setAddingUser(true);
                  setAddingOwner(false);
                }}
                className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/50 via-emerald-400/30 to-teal-500/50 rounded-2xl" />
                <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 transition-all duration-300 group-hover:bg-white/60 dark:group-hover:bg-slate-900/60">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                    <HardHat
                      size={32}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                      Employee
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Clock in/out & track your hours
                    </p>
                  </div>
                  <div className="mt-2 px-4 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    I work for a company
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md">
              {/* Back button */}
              <button
                onClick={() => {
                  setAddingUser(false);
                  setAddingOwner(false);
                }}
                className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <RotateCcw size={14} />
                Back to role selection
              </button>

              {/* Glassy form container */}
              <div className="relative overflow-hidden rounded-2xl p-[1px]">
                <div
                  className={`absolute inset-0 rounded-2xl ${addingOwner ? "bg-gradient-to-br from-blue-500/40 via-blue-400/20 to-indigo-500/40" : "bg-gradient-to-br from-emerald-500/40 via-emerald-400/20 to-teal-500/40"}`}
                />
                <div className="relative rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                    {addingOwner
                      ? "Set up your Owner profile"
                      : "Set up your Employee profile"}
                  </h2>
                  {addingUser ? <AddUser /> : <AddOwner />}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full">
          <h1 className="mb-4 text-center text-4xl">
            Hey {dbUser?.firstName}{" "}
            <span
              onClick={handleWave}
              className={`cursor-pointer ${doTheWave && "wave"} ${
                isWaving && "fading"
              }`}
            >
              👋🏽
            </span>
          </h1>

          {/* Demo fresh reset button */}
          {isDemoFresh && (
            <div className="flex flex-col items-center gap-3 mb-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                This button only appears on the fresh demo account so you can
                play around with different roles!
              </p>
              <button
                onClick={handleResetRole}
                disabled={isResetting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw
                  size={14}
                  className={isResetting ? "animate-spin" : ""}
                />
                {isResetting ? "Resetting..." : "Undo Role Selection"}
              </button>
            </div>
          )}

          {dbUser?.role === "owner" ? (
            <OwnerDash user={queryUser as Owner} refetch={refetch} />
          ) : (
            dbUser?.role === "user" && (
              <UserDash user={queryUser as User} refetch={refetch} />
            )
          )}
        </div>
      )}

      <FloatingLightBall opacity={0.2} speed={0.1} />
      <FloatingLightBall
        color="bg-purple-600"
        opacity={0.6}
        size={100}
        speed={0.1}
      />
      <FloatingLightBall
        color="bg-pink-6d00"
        opacity={0.2}
        size={200}
        speed={0.2}
      />
    </div>
  );
};

export default HomePage;
