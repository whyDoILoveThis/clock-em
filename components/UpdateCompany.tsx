"use client";
import { Company } from "@/types/types.type";
import { useState } from "react";
import { Building2, Phone, MapPin, Calendar } from "lucide-react";

interface Props {
  ownerId: string | null | undefined;
  companyId: string;
  initialData: Company;
  onClose?: () => void;
}

const UpdateCompanyForm = ({
  ownerId,
  companyId,
  initialData,
  onClose,
}: Props) => {
  const [companyData, setCompanyData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/updateCompany", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, companyId, companyData }),
      });

      if (!response.ok) throw new Error("Failed to update company");

      setSubmitSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("❌ An error occurred:", error);
      setErrors({ submit: "Failed to update company. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      name: "name",
      label: "Company Name",
      icon: Building2,
      placeholder: "Acme Corporation",
      type: "text",
    },
    {
      name: "phone",
      label: "Phone",
      icon: Phone,
      placeholder: "(555) 123-4567",
      type: "tel",
    },
    {
      name: "address",
      label: "Address",
      icon: MapPin,
      placeholder: "123 Business Ave, City, State 12345",
      type: "text",
    },
    {
      name: "estDate",
      label: "Established Date",
      icon: Calendar,
      placeholder: "2024-01-15",
      type: "date",
    },
  ];

  return (
    <form className="w-full space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
        Update Company
      </h2>

      {/* Form fields */}
      {formFields.map((field) => {
        const Icon = field.icon;
        const hasError = !!errors[field.name];
        const value =
          (companyData[field.name as keyof Company] as string) || "";

        return (
          <div key={field.name} className="group">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {field.label}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                placeholder={field.placeholder}
                value={value}
                onChange={handleChange}
                required
                className={`w-full bg-white dark:bg-slate-800 border rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none ${
                  hasError
                    ? "border-red-500/50 dark:border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
              />
            </div>
            {hasError && (
              <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 font-medium">
                {errors[field.name]}
              </p>
            )}
          </div>
        );
      })}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || submitSuccess}
        className={`w-full mt-6 px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
          submitSuccess
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
            : isSubmitting
              ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95"
        }`}
      >
        {submitSuccess ? (
          <span className="flex items-center justify-center gap-2">
            ✓ Company Updated!
          </span>
        ) : isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Updating company...
          </span>
        ) : (
          "Update Company"
        )}
      </button>
    </form>
  );
};

export default UpdateCompanyForm;
