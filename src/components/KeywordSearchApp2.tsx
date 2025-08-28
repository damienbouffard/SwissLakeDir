import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface Person {
  name: string;
  affiliation: string;
  keyword1: string;
  keyword2: string;
  keyword3: string;
}

interface DirectoryStats {
  expertCount: number;
  expertiseCount: number;
  affiliationCount: number;
}

// Simplified Pictogram component that shows only one icon per topic
const Pictogram: React.FC<{ icon: string; count: number; color: string }> = ({ 
  icon, count, color 
}) => {
  return (
    <div className="flex justify-center mb-2">
      <span className={`text-4xl ${color}`}>{icon}</span>
    </div>
  );
};

const KeywordSearchApp: React.FC = () => {
  const [data, setData] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [stats, setStats] = useState<DirectoryStats>({
    expertCount: 0,
    expertiseCount: 0,
    affiliationCount: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvFilePath = process.env.PUBLIC_URL + '/data/experts.csv';
        const response = await fetch(csvFilePath);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        if (csvText.trim().startsWith('<!DOCTYPE html>')) {
          throw new Error('Received HTML instead of CSV data. Check the file path.');
        }
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data.map((row: any) => ({
              name: row.name || '',
              affiliation: row.affiliation || '',
              keyword1: row.keyword1 || '',
              keyword2: row.keyword2 || '',
              keyword3: row.keyword3 || ''
            }));
            
            const personData = parsedData as Person[];
            setData(personData);
            
            // Calculate statistics
            const uniqueExperts = new Set(personData.map(p => p.name)).size;
            
            // Collect all keywords and filter out empty ones
            const allKeywords = [
              ...personData.map(p => p.keyword1),
              ...personData.map(p => p.keyword2),
              ...personData.map(p => p.keyword3)
            ].filter(keyword => keyword);
            const uniqueKeywords = new Set(allKeywords).size;
            
            // Get unique affiliations
            const uniqueAffiliations = new Set(personData.map(p => p.affiliation)).size;
            
            setStats({
              expertCount: uniqueExperts,
              expertiseCount: uniqueKeywords,
              affiliationCount: uniqueAffiliations
            });
            
            setIsLoading(false);
          },
          error: (error: Error) => {
            setError("Failed to parse CSV data. Please check the file format.");
            setIsLoading(false);
          }
        });
      } catch (error: any) {
        // Fall back to sample data if we can't load the CSV
        const sampleData: Person[] = [
          { name: "John Smith", affiliation: "University of Technology", keyword1: "machine learning", keyword2: "neural networks", keyword3: "computer vision" },
          { name: "Maria Garcia", affiliation: "Research Institute", keyword1: "data mining", keyword2: "statistics", keyword3: "big data" },
          { name: "Wei Zhang", affiliation: "Tech Solutions Inc", keyword1: "cloud computing", keyword2: "distributed systems", keyword3: "scalability" },
          { name: "Aisha Johnson", affiliation: "Global Analytics", keyword1: "data visualization", keyword2: "business intelligence", keyword3: "machine learning" },
          { name: "Carlos Rodriguez", affiliation: "University of Science", keyword1: "robotics", keyword2: "control systems", keyword3: "automation" },
          { name: "Fatima Ali", affiliation: "Health Research Center", keyword1: "bioinformatics", keyword2: "genomics", keyword3: "medical imaging" },
          { name: "David Wilson", affiliation: "Innovation Labs", keyword1: "virtual reality", keyword2: "augmented reality", keyword3: "human-computer interaction" },
          { name: "Emily Chen", affiliation: "Tech Solutions Inc", keyword1: "web development", keyword2: "user experience", keyword3: "accessibility" },
          { name: "James Brown", affiliation: "University of Technology", keyword1: "artificial intelligence", keyword2: "machine learning", keyword3: "deep learning" },
          { name: "Sophia Kumar", affiliation: "Data Science Center", keyword1: "statistics", keyword2: "natural language processing", keyword3: "sentiment analysis" }
        ];
        
        setData(sampleData);
        
        // Set sample stats
        setStats({
          expertCount: 10,
          expertiseCount: 24,
          affiliationCount: 7
        });
        
        setError(`Note: Using sample data. Couldn't load CSV: ${error.message}`);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setSearchResults([]);
      setSearchPerformed(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchPerformed(false);
      return;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    const results = data.filter(person => 
      person.name.toLowerCase().includes(normalizedSearchTerm) ||
      person.affiliation.toLowerCase().includes(normalizedSearchTerm) ||
      person.keyword1.toLowerCase().includes(normalizedSearchTerm) || 
      person.keyword2.toLowerCase().includes(normalizedSearchTerm) || 
      person.keyword3.toLowerCase().includes(normalizedSearchTerm)
    );
    
    setSearchResults(results);
    setSearchPerformed(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Swiss Lakes Science & Management Expert Directory Search</h1>
        <p className="text-gray-600 mb-6">Search for people by name, affiliation or keywords</p>
        <p className="text-left text-gray-600">
          This website showcases the diversity of Swiss expertise in lake science and management. It can be used by journalists to find the right expert, by scientists to identify colleagues, 
          by students to find mentor for their research, or by lake managers to connect with specialists.
        </p>
        
        {/* Statistics visualization */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Overview</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <Pictogram icon="👩‍🔬" count={stats.expertCount} color="text-blue-500" />
                <div className="text-2xl font-bold">{stats.expertCount}</div>
                <div className="text-sm text-gray-600">Experts</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Pictogram icon="🔬" count={stats.expertiseCount} color="text-green-500" />
                <div className="text-2xl font-bold">{stats.expertiseCount}</div>
                <div className="text-sm text-gray-600">Expertises</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Pictogram icon="🏢" count={stats.affiliationCount} color="text-purple-500" />
                <div className="text-2xl font-bold">{stats.affiliationCount}</div>
                <div className="text-sm text-gray-600">Affiliations</div>
              </div>
            </div>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-700">Loading data...</p>
        </div>
      ) : (
        <div>
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              {error}
            </div>
          )}

          <div className="flex mb-6">
            <input
              type="text"
              className="flex-grow p-3 border border-gray-300 rounded-l shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a name or keyword (e.g., Kremer, sedimentology)"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r font-medium transition-colors"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {searchPerformed && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {searchResults.length > 0 
                  ? `Results for "${searchTerm}" (${searchResults.length} found)` 
                  : `No results found for "${searchTerm}"`}
              </h2>
              
              {searchResults.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affiliation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {searchResults.map((person, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{person.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{person.affiliation}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{person.keyword1}</span>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{person.keyword2}</span>
                              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">{person.keyword3}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <footer className="mt-12 pt-6 border-t border-gray-200 text-left text-gray-500 text-sm">
        <p>Keyword Directory Search Tool</p>
        <p>Don't see your name? Don't want to see your name? Suggestions? Please contact Damien Bouffard</p>
        <p>For privacy reasons, emails are not included</p>
        <p>v.1.2. 2025.08</p>
      </footer>
    </div>
  );
};

export default KeywordSearchApp;