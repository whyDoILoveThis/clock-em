"use client";
import { Company } from "@/types/types.type";
import { useState, useEffect } from "react";

interface Props {
  ownerId: string | null | undefined;
  companyId: string;
  initialData: Company;
}
const UpdateCompanyForm = ({ ownerId, companyId, initialData }: Props) => {
  const [companyData, setCompanyData] = useState(initialData);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/updateCompany", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, companyId, companyData }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (error) {
      console.error("❌ An error occurred:", error);
    }
  };

  return (
    <div>
      <h2 className="text-indigo-600 dark:text-indigo-300 font-bold text-xl">
        Update Company
      </h2>
      {message && <p>{message}</p>}
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <label>
          <b>Name:</b>
        </label>
        <input
          className="input"
          type="text"
          name="name"
          value={companyData.name}
          onChange={handleChange}
          required
        />
        <label>
          <b>Phone:</b>
        </label>
        <input
          className="input"
          type="text"
          name="phone"
          value={companyData.phone}
          onChange={handleChange}
          required
        />
        <label>
          <b>Address:</b>
        </label>
        <input
          className="input"
          type="text"
          name="address"
          value={companyData.address}
          onChange={handleChange}
          required
        />
        <label>
          <b>Established Date:</b>
        </label>
        <input
          className="input"
          type="number"
          name="estDate"
          value={companyData.estDate}
          onChange={handleChange}
          required
        />
        <label>
          <b>Logo URL:</b>
        </label>
        <input
          className="input"
          type="text"
          name="logoUrl"
          value={companyData.logoUrl}
          onChange={handleChange}
        />
        <button className="btn-primary mt-2" type="submit">
          Update Company
        </button>
      </form>
    </div>
  );
};

export default UpdateCompanyForm;
