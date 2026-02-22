import { Company } from "@/types/types.type";
import { useState } from "react";
import CompanyCard from "./CompanyCard";
import { Search } from "lucide-react";
import Loader from "./Loader";

interface Props {
  refetch: () => Promise<any>;
}

const SearchCompany = ({ refetch }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [isNoResults, setIsNoResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/searchCompany?searchTerm=${encodeURIComponent(searchTerm)}`,
      );
      if (!response.ok) {
        setLoading(false);
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setSearchResults(data.companies);
      if (data.companies.length <= 0) {
        setIsNoResults(true);
        setLoading(false);
      }
      if (data.companies.length > 0) {
        setIsNoResults(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ An error occurred:", error);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Search bar */}
      <form
        className="w-full max-w-md flex items-center gap-2 px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border border-white/20 dark:border-slate-700/40 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/40"
        onSubmit={handleSearch}
      >
        <Search
          size={18}
          className="text-slate-400 dark:text-slate-500 shrink-0"
        />
        <input
          type="text"
          placeholder="Search for a company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          required
          className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
        />
        <button
          type="submit"
          className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors duration-200"
        >
          Search
        </button>
      </form>

      {/* Results */}
      <div className="w-full flex flex-col items-center mt-4">
        {searchResults.length > 0 && (
          <ul className="w-full flex flex-col items-center gap-3">
            {searchResults.map((company, index) => (
              <li className="w-full flex justify-center" key={company._id}>
                <CompanyCard
                  index={index}
                  company={company}
                  refetch={refetch}
                />
              </li>
            ))}
          </ul>
        )}
        {loading && (
          <div className="mt-6">
            <Loader />
          </div>
        )}
        {isNoResults && !loading && (
          <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
            No companies found. Try a different search.
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchCompany;
