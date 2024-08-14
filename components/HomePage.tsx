"use client";
import { useEffect, useState } from "react";
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import AddUser from "@/components/AddUser";
import AddOwner from "@/components/AddOwner";
import { Owner, User } from "@/types/types.type";
import OwnerDash from "@/components/OwnerDashboard";
import UserDash from "@/components/EmployeeDashboard";
import { useQuery } from "react-query";

const HomePage = () => {
  const { isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState<User | Owner>();
  const { userId } = useAuth();
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [addingUser, setAddingUser] = useState(false);
  const [addingOwner, setAddingOwner] = useState(false);
  // Use React Query to fetch the user data
  const [queryUserId, setQueryUserId] = useState("");
  useEffect(() => {
    if (!userId) return;
    setQueryUserId(userId);
  }, [userId]);

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className="flex flex-col items-center">
      <SignOutButton />
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
          Welcome
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
