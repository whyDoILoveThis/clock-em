import { Company } from "@/types/types.type";
import { useState } from "react";
import Image from "next/image";
import { X, Trash2, AlertTriangle } from "lucide-react";

interface Props {
  ownerId: string | null | undefined;
  theCompanies: Company[];
  refetch: () => Promise<any>;
  onClose: () => void;
}

const DeleteCompanyForm = ({
  ownerId,
  theCompanies,
  refetch,
  onClose,
}: Props) => {
  const [companies, setCompanies] = useState<Company[]>(theCompanies);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (companyId: string) => {
    if (!confirm("This will permanently delete this company. Are you sure?"))
      return;

    setDeletingId(companyId);
    try {
      const response = await fetch("/api/deleteCompany", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, companyId }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
      refetch();

      if (data.message) {
        const remaining = companies.filter((c) => c._id !== companyId);
        setCompanies(remaining);
        refetch();
        if (remaining.length === 0) onClose();
      }
    } catch (error) {
      console.error("❌ An error occurred:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/40 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Company
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Company list */}
        <div className="px-6 pb-6 space-y-2.5">
          {message && (
            <p className="text-sm text-center font-medium text-red-500 dark:text-red-400 bg-red-500/5 rounded-lg py-2 px-3">
              {message}
            </p>
          )}

          {companies.map((company) => (
            <div
              key={company._id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {company.logoUrl && (
                  <Image
                    width={28}
                    height={28}
                    src={company.logoUrl}
                    alt={company.name}
                    className="rounded-lg object-cover shrink-0"
                  />
                )}
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {company.name}
                </span>
              </div>
              <button
                onClick={() => handleDelete(company._id)}
                disabled={deletingId === company._id}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === company._id ? (
                  <span className="animate-spin text-[11px]">⏳</span>
                ) : (
                  <Trash2 size={13} />
                )}
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeleteCompanyForm;
