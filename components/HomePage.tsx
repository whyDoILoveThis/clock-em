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

const HomePage = () => {
  const { isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState<User | Owner>();
  const { userId } = useAuth();
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [addingUser, setAddingUser] = useState(false);
  const [addingOwner, setAddingOwner] = useState(false);
  const [doTheWave, setDoTheWave] = useState(true);
  const [isWaving, setIsWaving] = useState(false);
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
    checkUser(queryUserId)
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
          `Network response was not ok, status: ${response.status}`
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
    <div className="flex flex-col items-center">
      {!userExists ? (
        <div>
          <h1 className="text-center text-4xl mb-4">
            Welcome! <br /> Please select your role:
          </h1>
          <div className="flex justify-center gap-2 ">
            <button
              onClick={() => {
                setAddingUser(false);
                setAddingOwner(true);
              }}
              className="bg-blue-500 text-white px-3 py-2 rounded"
            >
              Owner 👨‍💼
            </button>
            <button
              onClick={() => {
                setAddingUser(true);
                setAddingOwner(false);
              }}
              className="bg-green-500 text-white px-3 py-2 rounded"
            >
              Employee 👷‍♀️
            </button>
          </div>
          {addingUser ? <AddUser /> : addingOwner ? <AddOwner /> : null}
        </div>
      ) : (
        <div>
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

          {dbUser?.role === "owner" ? (
            <OwnerDash user={queryUser as Owner} refetch={refetch} />
          ) : (
            dbUser?.role === "user" && (
              <UserDash user={queryUser as User} refetch={refetch} />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
