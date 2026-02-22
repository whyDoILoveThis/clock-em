// pages/index.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { fbUploadImage } from "@/lib/firebaseStorage";
import { useAuth, useUser } from "@clerk/nextjs";
import { OwnerFormData, ownerFormSchema } from "@/lib/ownerValidation";
import {
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Upload,
} from "lucide-react";

const AddOwner = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const [logo, setLogo] = useState<File | undefined>(undefined);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const [errors, setErrors] = useState<
    Partial<Record<keyof OwnerFormData, string>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name as keyof OwnerFormData]) {
      setErrors({ ...errors, [name as keyof OwnerFormData]: undefined });
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
      ownerFormSchema.parse(formData);
      setErrors({});

      let imageUrl = "";
      if (logo) {
        imageUrl = await fbUploadImage(logo);
      }

      const userPayload = {
        ...formData,
        role: "owner",
        userId,
        logoUrl: imageUrl,
      };

      const res = await axios.post("/api/saveOwner", userPayload);
      setSubmitSuccess(true);
      console.log(res.data);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof OwnerFormData, string>> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0] as keyof OwnerFormData] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      name: "firstName" as const,
      label: "First Name",
      icon: UserIcon,
      placeholder: "John",
      type: "text",
    },
    {
      name: "fullName" as const,
      label: "Full Name",
      icon: Building2,
      placeholder: "John Smith",
      type: "text",
    },
    {
      name: "age" as const,
      label: "Age",
      icon: Calendar,
      placeholder: "35",
      type: "number",
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
      label: "Business Address",
      icon: MapPin,
      placeholder: "123 Main St, City, State 12345",
      type: "text",
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
              : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95"
        }`}
      >
        {submitSuccess ? (
          <span className="flex items-center justify-center gap-2">
            ✓ Profile Created!
          </span>
        ) : isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Creating profile...
          </span>
        ) : (
          "Create Profile"
        )}
      </button>
    </form>
  );
};

export default AddOwner;
