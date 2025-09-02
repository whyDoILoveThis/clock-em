// pages/index.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { fbUploadImage } from "@/lib/firebaseStorage";
import { useAuth, useUser } from "@clerk/nextjs";
import { OwnerFormData, ownerFormSchema } from "@/lib/ownerValidation";

const AddUser = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const [logo, setLogo] = useState<File | undefined>(undefined);

  const [formData, setFormData] = useState<OwnerFormData>({
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
    Partial<Record<keyof OwnerFormData, string>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("submitting");

    e.preventDefault();
    console.log("defaultPrevented");

    try {
      console.log("trying parse form");

      ownerFormSchema.parse(formData);
      setErrors({});
      console.log("form parsed");

      let imageUrl = "";
      if (logo) {
        console.log("upload attempt");

        imageUrl = await fbUploadImage(logo);
        console.log("upload complete");
      } else {
      }

      const userPayload = {
        ...formData,
        role: "owner",
        userId,
        logoUrl: imageUrl,
      };

      console.log("userPayload", userPayload);
      const res = await axios.post("/api/saveOwner", userPayload);
      console.log(res.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof OwnerFormData, string>> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0] as keyof OwnerFormData] = err.message;
        });
        setErrors(fieldErrors);

        console.error("An error occurred:", error);
      }
    }
  };

  console.log(formData, "logoFIle >> ", logo);

  return (
    <form className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
      <div className="border">
        <input
          type="text"
          name="firstName"
          id="firstName"
          placeholder="First Name..."
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        {errors.firstName && <p className="text-red-400">{errors.firstName}</p>}
      </div>

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
        {errors.fullName && <p className="text-red-400">{errors.fullName}</p>}
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
        {errors.age && <p className="text-red-400">{errors.age}</p>}
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
        {errors.phone && <p className="text-red-400">{errors.phone}</p>}
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
        {errors.phone && <p className="text-red-400">{errors.phone}</p>}
      </div>

      <button type="submit">Add User</button>
    </form>
  );
};

export default AddUser;
