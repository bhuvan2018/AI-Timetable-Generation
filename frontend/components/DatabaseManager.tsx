import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';

interface DatabaseStats {
  total_documents: number;
  collections: {
    [key: string]: number;
  };
  timestamp: string;
}

interface CollectionData {
  collection: string;
  count: number;
  data: any[];
}

const DatabaseManager: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ type: string; message: string } | null>(null);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  useEffect(() => {
    fetchStats();
    fetchCollections();
  }, []);
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/database/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(`Error fetching database stats: ${err.message}`);
      console.error('Error fetching database stats:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/database/collections`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collections: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCollections(data.collections || []);
      setError(null);
    } catch (err: any) {
      setError(`Error fetching collections: ${err.message}`);
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCollectionData = async (collectionName: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/database/collections/${collectionName}?limit=50`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collection data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCollectionData(data);
      setSelectedCollection(collectionName);
      setError(null);
    } catch (err: any) {
      setError(`Error fetching collection data: ${err.message}`);
      console.error('Error fetching collection data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const importFromCSV = async () => {
    try {
      setLoading(true);
      setActionStatus({ type: 'info', message: 'Importing data from CSV files...' });
      
      const response = await fetch(`${apiUrl}/database/import/csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to import data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setActionStatus({ type: 'success', message: 'Import process started successfully!' });
      
      // Refresh after a delay to see updated data
      setTimeout(() => {
        fetchStats();
        fetchCollections();
      }, 2000);
    } catch (err: any) {
      setError(`Error importing data: ${err.message}`);
      setActionStatus({ type: 'error', message: `Import failed: ${err.message}` });
      console.error('Error importing data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const exportToCSV = async () => {
    try {
      setLoading(true);
      setActionStatus({ type: 'info', message: 'Exporting data to CSV files...' });
      
      const response = await fetch(`${apiUrl}/database/export/csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setActionStatus({ type: 'success', message: 'Export process started successfully!' });
    } catch (err: any) {
      setError(`Error exporting data: ${err.message}`);
      setActionStatus({ type: 'error', message: `Export failed: ${err.message}` });
      console.error('Error exporting data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const clearCollection = async (collectionName: string) => {
    if (!confirm(`Are you sure you want to clear the ${collectionName} collection? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      setActionStatus({ type: 'info', message: `Clearing collection ${collectionName}...` });
      
      const response = await fetch(`${apiUrl}/database/collections/${collectionName}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clear collection: ${response.statusText}`);
      }
      
      const data = await response.json();
      setActionStatus({ type: 'success', message: `Collection ${collectionName} cleared successfully!` });
      
      // Refresh data
      fetchStats();
      
      if (selectedCollection === collectionName) {
        setCollectionData({ collection: collectionName, count: 0, data: [] });
      }
    } catch (err: any) {
      setError(`Error clearing collection: ${err.message}`);
      setActionStatus({ type: 'error', message: `Failed to clear collection: ${err.message}` });
      console.error('Error clearing collection:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Database Management</h1>
      
      {actionStatus && (
        <div className={`mb-4 p-3 rounded ${
          actionStatus.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
          actionStatus.type === 'error' ? 'bg-red-100 border-red-500 text-red-700' :
          'bg-blue-100 border-blue-500 text-blue-700'
        }`}>
          {actionStatus.message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Database Actions</h2>
          
          <div className="flex flex-col space-y-4">
            <button
              onClick={importFromCSV}
              disabled={loading}
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              Import from CSV
            </button>
            
            <button
              onClick={exportToCSV}
              disabled={loading}
              className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
            >
              Export to CSV
            </button>
            
            <button
              onClick={fetchStats}
              disabled={loading}
              className="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
            >
              Refresh Stats
            </button>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Database Statistics</h3>
            
            {stats ? (
              <div className="bg-gray-50 p-3 rounded">
                <p>Total Documents: {stats.total_documents}</p>
                <p>Last Updated: {formatDate(stats.timestamp)}</p>
                <div className="mt-3">
                  <h4 className="font-medium">Collection Counts:</h4>
                  <ul className="list-disc list-inside">
                    {Object.entries(stats.collections).map(([collName, count]) => (
                      <li key={collName}>{collName}: {count}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : loading ? (
              <p>Loading stats...</p>
            ) : (
              <p>No stats available</p>
            )}
          </div>
        </div>
        
        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Collections</h2>
          
          <div className="mb-4">
            <Tab.Group>
              <Tab.List className="flex space-x-1 border-b">
                {collections.map((collection) => (
                  <Tab
                    key={collection}
                    onClick={() => fetchCollectionData(collection)}
                    className={({ selected }) =>
                      `py-2 px-4 text-sm font-medium focus:outline-none ${
                        selected
                          ? 'text-blue-700 border-b-2 border-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`
                    }
                  >
                    {collection}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>
          </div>
          
          {selectedCollection && (
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {selectedCollection} ({collectionData?.count || 0} documents)
              </h3>
              <button
                onClick={() => clearCollection(selectedCollection)}
                className="py-1 px-3 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Clear Collection
              </button>
            </div>
          )}
          
          {loading && <p>Loading data...</p>}
          
          {!loading && collectionData && collectionData.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(collectionData.data[0]).map((header) => (
                      <th key={header} className="py-2 px-3 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {collectionData.data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.entries(item).map(([key, value]) => (
                        <td key={key} className="py-2 px-3 border text-sm text-gray-500">
                          {typeof value === 'object' 
                            ? JSON.stringify(value)
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && (!collectionData || collectionData.data.length === 0) && selectedCollection && (
            <div className="bg-gray-50 p-4 text-center">
              No data in this collection
            </div>
          )}
          
          {!selectedCollection && !loading && (
            <div className="bg-gray-50 p-4 text-center">
              Select a collection to view data
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager; 