from pymongo import MongoClient
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional
import logging

# Load environment variables
load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

class MongoDB:
    """
    MongoDB connection and operations class for the AI Timetable Generator.
    """
    
    def __init__(self):
        """
        Initialize MongoDB connection using environment variables.
        - MONGODB_URI: MongoDB connection string
        - MONGODB_DB: MongoDB database name
        """
        self.client = None
        self.db = None
        
        # Get MongoDB connection details from environment variables
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        mongodb_db = os.getenv("MONGODB_DB", "ai_timetable")
        
        try:
            # Connect to MongoDB
            self.client = MongoClient(mongodb_uri)
            self.db = self.client[mongodb_db]
            logger.info(f"Connected to MongoDB database: {mongodb_db}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    def get_collection(self, collection_name: str):
        """
        Get a MongoDB collection by name.
        
        Args:
            collection_name: Name of the collection
            
        Returns:
            MongoDB collection
        """
        return self.db[collection_name]

    # Generic CRUD operations

    def insert_one(self, collection_name: str, document: Dict) -> str:
        """
        Insert a single document into a collection.
        
        Args:
            collection_name: Name of the collection
            document: Document to insert
            
        Returns:
            ID of the inserted document
        """
        collection = self.get_collection(collection_name)
        result = collection.insert_one(document)
        return str(result.inserted_id)

    def insert_many(self, collection_name: str, documents: List[Dict]) -> List[str]:
        """
        Insert multiple documents into a collection.
        
        Args:
            collection_name: Name of the collection
            documents: List of documents to insert
            
        Returns:
            List of IDs of the inserted documents
        """
        collection = self.get_collection(collection_name)
        result = collection.insert_many(documents)
        return [str(id) for id in result.inserted_ids]

    def find_one(self, collection_name: str, query: Dict) -> Optional[Dict]:
        """
        Find a single document in a collection.
        
        Args:
            collection_name: Name of the collection
            query: Query to filter documents
            
        Returns:
            Document matching the query, or None if not found
        """
        collection = self.get_collection(collection_name)
        result = collection.find_one(query)
        return result

    def find_many(self, collection_name: str, query: Dict, limit: int = 0) -> List[Dict]:
        """
        Find multiple documents in a collection.
        
        Args:
            collection_name: Name of the collection
            query: Query to filter documents
            limit: Maximum number of documents to return (0 for all)
            
        Returns:
            List of documents matching the query
        """
        collection = self.get_collection(collection_name)
        cursor = collection.find(query)
        if limit > 0:
            cursor = cursor.limit(limit)
        return list(cursor)

    def update_one(self, collection_name: str, query: Dict, update: Dict) -> int:
        """
        Update a single document in a collection.
        
        Args:
            collection_name: Name of the collection
            query: Query to filter documents
            update: Update to apply to the document
            
        Returns:
            Number of documents modified
        """
        collection = self.get_collection(collection_name)
        result = collection.update_one(query, {"$set": update})
        return result.modified_count

    def update_many(self, collection_name: str, query: Dict, update: Dict) -> int:
        """
        Update multiple documents in a collection.
        
        Args:
            collection_name: Name of the collection
            query: Query to filter documents
            update: Update to apply to the documents
            
        Returns:
            Number of documents modified
        """
        collection = self.get_collection(collection_name)
        result = collection.update_many(query, {"$set": update})
        return result.modified_count

    def delete_one(self, collection_name: str, query: Dict) -> int:
        """
        Delete a single document from a collection.
        
        Args:
            collection_name: Name of the collection
            query: Query to filter documents
            
        Returns:
            Number of documents deleted
        """
        collection = self.get_collection(collection_name)
        result = collection.delete_one(query)
        return result.deleted_count

    def delete_many(self, collection_name: str, query: Dict) -> int:
        """
        Delete multiple documents from a collection.
        
        Args:
            collection_name: Name of the collection
            query: Query to filter documents
            
        Returns:
            Number of documents deleted
        """
        collection = self.get_collection(collection_name)
        result = collection.delete_many(query)
        return result.deleted_count

    # Specialized operations for AI Timetable Generator

    def save_timetable(self, timetable_data: Dict) -> str:
        """
        Save a generated timetable to the database.
        
        Args:
            timetable_data: Timetable data containing metadata and schedule
            
        Returns:
            ID of the saved timetable
        """
        return self.insert_one("timetables", timetable_data)

    def get_timetable(self, timetable_id: str) -> Optional[Dict]:
        """
        Get a timetable by ID.
        
        Args:
            timetable_id: ID of the timetable
            
        Returns:
            Timetable data, or None if not found
        """
        from bson.objectid import ObjectId
        return self.find_one("timetables", {"_id": ObjectId(timetable_id)})

    def list_timetables(self, limit: int = 20) -> List[Dict]:
        """
        List all timetables, sorted by creation date.
        
        Args:
            limit: Maximum number of timetables to return
            
        Returns:
            List of timetables
        """
        collection = self.get_collection("timetables")
        return list(collection.find().sort("created_at", -1).limit(limit))

    def import_dataset_to_mongodb(self, collection_name: str, data: List[Dict]) -> List[str]:
        """
        Import a dataset into MongoDB.
        
        Args:
            collection_name: Name of the collection
            data: List of documents to import
            
        Returns:
            List of IDs of the imported documents
        """
        # Clear existing data in the collection
        collection = self.get_collection(collection_name)
        collection.delete_many({})
        
        # Insert new data
        return self.insert_many(collection_name, data)

    def close(self):
        """
        Close the MongoDB connection.
        """
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection")

# Create a global instance for use throughout the application
mongodb = MongoDB() 