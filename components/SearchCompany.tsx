import { Company } from "@/types/types.type";
import { useState } from "react";
import CompanyCard from "./CompanyCard";
import { GoSearch } from "react-icons/go";
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
        `/api/searchCompany?searchTerm=${encodeURIComponent(searchTerm)}`
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
    <div>
      <div className="flex flex-col items-center justify-center">
        <h2 className="mt-2 text-2xl font-bold border-b mb-4">
          🔍 Search for a Company
        </h2>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter company name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
          <button type="submit">
            <GoSearch />
          </button>
        </form>
      </div>

      <div>
        {searchResults.length > 0 && (
          <ul>
            {searchResults.map((company, index) => (
              <li key={company._id}>
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
          <div className="mt-4">
            <Loader />
          </div>
        )}
        {isNoResults && !loading && (
          <p className="text-center mt-2">🐳🐔💩, No Results</p>
        )}
      </div>
    </div>
  );
};

export default SearchCompany;
