import { Company } from "@/types/types.type";
import { useState } from "react";
import CompanyCard from "./CompanyCard";

interface Props {
  refetch: () => Promise<any>;
}

const SearchCompany = ({ refetch }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Company[]>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `/api/searchCompany?searchTerm=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setSearchResults(data.companies);
    } catch (error) {
      console.error("❌ An error occurred:", error);
    }
  };

  return (
    <div>
      <h1>🔍 Search for a Company</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter company name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>

      <div>
        {searchResults.length > 0 ? (
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
        ) : (
          <p>No companies found</p>
        )}
      </div>
    </div>
  );
};

export default SearchCompany;
