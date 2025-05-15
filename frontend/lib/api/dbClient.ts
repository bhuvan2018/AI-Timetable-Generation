/**
 * Database API client for frontend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DATABASE_BASE_URL = `${API_BASE_URL}/database`;

export interface DatabaseStats {
  total_documents: number;
  collections: {
    [key: string]: number;
  };
  timestamp: string;
}

export interface CollectionData {
  collection: string;
  count: number;
  data: any[];
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  const response = await fetch(`${DATABASE_BASE_URL}/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to get database stats: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Get collection list
 */
export async function getCollectionsList(): Promise<string[]> {
  const response = await fetch(`${DATABASE_BASE_URL}/collections`);
  
  if (!response.ok) {
    throw new Error(`Failed to get collections list: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.collections || [];
}

/**
 * Get data from a specific collection
 */
export async function getCollectionData(
  collectionName: string, 
  limit: number = 100
): Promise<CollectionData> {
  const response = await fetch(`${DATABASE_BASE_URL}/collections/${collectionName}?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get collection data: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Import CSV data to MongoDB
 */
export async function importFromCSV(): Promise<{ status: string }> {
  const response = await fetch(`${DATABASE_BASE_URL}/import/csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to import CSV data: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Export MongoDB data to CSV
 */
export async function exportToCSV(): Promise<{ status: string }> {
  const response = await fetch(`${DATABASE_BASE_URL}/export/csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to export to CSV: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Clear a specific collection
 */
export async function clearCollection(collectionName: string): Promise<{ deleted_count: number }> {
  const response = await fetch(`${DATABASE_BASE_URL}/collections/${collectionName}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to clear collection: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${DATABASE_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error(`Database health check failed: ${response.statusText}`);
  }
  
  return await response.json();
} 