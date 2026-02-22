"use client";
import { fbUploadImage } from "@/lib/firebaseStorage";
import { useState } from "react";
import { Building2, Phone, MapPin, Calendar, Upload } from "lucide-react";

interface Props {
  ownerId: string | null | undefined;
  refetch: () => Promise<any>;
  onClose?: () => void;
}

const AddCompany = ({ ownerId, refetch, onClose }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    estDate: "",
  });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logo, setLogo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof typeof formData]) {
      setErrors({ ...errors, [name as keyof typeof formData]: undefined });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = "";
      if (logo) {
        imageUrl = await fbUploadImage(logo);
      }

      const payload = {
        ...formData,
        logoUrl: imageUrl,
      };

      const response = await fetch("/api/addCompany", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, company: payload }),
      });

      if (!response.ok) throw new Error("Failed to add company");

      setSubmitSuccess(true);
      await refetch();

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("❌ An error occurred:", error);
      setErrors({ name: "Failed to create company. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      name: "name" as const,
      label: "Company Name",
      icon: Building2,
      placeholder: "Acme Corporation",
      type: "text",
    },
    {
      name: "phone" as const,
      label: "Phone",
      icon: Phone,
      placeholder: "(555) 123-4567",
      type: "tel",
    },
    {
      name: "address" as const,
      label: "Address",
      icon: MapPin,
      placeholder: "123 Business Ave, City, State 12345",
      type: "text",
    },
    {
      name: "estDate" as const,
      label: "Established Date",
      icon: Calendar,
      placeholder: "2024-01-15",
      type: "date",
    },
  ];

  return (
    <form className="w-full space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Company Logo (Optional)
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="sr-only"
            id="logo-input"
          />
          <label
            htmlFor="logo-input"
            className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
          >
            {logoPreview ? (
              <>
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Change logo
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Click to upload
                  </span>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Upload logo
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG up to 10MB
                  </span>
                </div>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Form fields */}
      {formFields.map((field) => {
        const Icon = field.icon;
        const hasError = !!errors[field.name];

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
                value={formData[field.name]}
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
            ✓ Company Created!
          </span>
        ) : isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Creating company...
          </span>
        ) : (
          "Create Company"
        )}
      </button>
    </form>
  );
};

export default AddCompany;
