// pages/index.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { userFormSchema, UserFormData } from "@/lib/userValidation";
import { z } from "zod";
import { fbUploadImage } from "@/lib/firebaseStorage";
import { useAuth, useUser } from "@clerk/nextjs";

const AddUser = () => {
  const { userId } = useAuth();
  const { user } = useUser();

  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    fullName: "",
    age: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user?.firstName && user.fullName) {
      setFormData({
        firstName: user.firstName,
        fullName: user.fullName,
        age: "",
        phone: "",
        address: "",
      });
    }
  }, [user]);

  console.log(user);

  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("submitting");

    e.preventDefault();
    console.log("defaultPrevented");

    try {
      let imageUrl = "";

      const userPayload = {
        ...formData,
        firstName: user?.firstName ? user.firstName : user?.username,
        role: "user",
        userId,
        logoUrl: imageUrl,
      };

      console.log("userPayload", userPayload);
      const res = await axios.post("/api/saveUser", userPayload);
      console.log(res.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof UserFormData, string>> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0] as keyof UserFormData] = err.message;
        });
        setErrors(fieldErrors);

        console.error("An error occurred:", error);
      }
    }
  };

  return (
    <form className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
      <div className="border">
        <input
          type="text"
          name="fullName"
          id="fullName"
          placeholder="Full Name..."
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        {errors.fullName && <p>{errors.fullName}</p>}
      </div>

      <div className="border">
        <input
          type="number"
          name="age"
          id="age"
          placeholder="Age..."
          value={formData.age}
          onChange={handleChange}
          required
        />
        {errors.age && <p>{errors.age}</p>}
      </div>

      <div className="flex flex-col border">
        <input
          type="text"
          name="phone"
          id="phone"
          placeholder="Phone..."
          value={formData.phone}
          onChange={handleChange}
          required
        />
        {errors.phone && <p>{errors.phone}</p>}
      </div>

      <div className="flex flex-col border">
        <input
          type="text"
          name="address"
          id="address"
          placeholder="Address..."
          value={formData.address}
          onChange={handleChange}
          required
        />
        {errors.phone && <p>{errors.phone}</p>}
      </div>

      <button type="submit">Add User</button>
    </form>
  );
};

export default AddUser;
