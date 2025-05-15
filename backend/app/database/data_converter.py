import pandas as pd
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from .mongodb import mongodb
from .csv_loader import load_csv_data

# Set up logging
logger = logging.getLogger(__name__)

def import_csv_to_mongodb(csv_dir: str) -> Tuple[bool, Dict[str, int]]:
    """
    Import all CSV datasets into MongoDB.
    
    Args:
        csv_dir: Directory containing CSV files
        
    Returns:
        Tuple containing:
        - Success flag (True if all imports were successful)
        - Dictionary with counts of imported records per collection
    """
    try:
        # Load CSV data
        data = load_csv_data(csv_dir)
        
        # Import each dataset to MongoDB
        import_results = {}
        for dataset_name, dataset in data.items():
            # Convert DataFrame to list of dictionaries
            records = dataset.to_dict(orient='records')
            
            # Add metadata to each record
            for record in records:
                record['created_at'] = datetime.utcnow()
                record['updated_at'] = datetime.utcnow()
            
            # Import to MongoDB
            collection_name = dataset_name.lower()
            ids = mongodb.import_dataset_to_mongodb(collection_name, records)
            import_results[collection_name] = len(ids)
            
            logger.info(f"Imported {len(ids)} records to {collection_name} collection")
        
        return True, import_results
    
    except Exception as e:
        logger.error(f"Failed to import CSV data to MongoDB: {str(e)}")
        return False, {}

def export_mongodb_to_csv(output_dir: str) -> Tuple[bool, Dict[str, int]]:
    """
    Export all MongoDB collections to CSV files.
    
    Args:
        output_dir: Directory to save CSV files
        
    Returns:
        Tuple containing:
        - Success flag (True if all exports were successful)
        - Dictionary with counts of exported records per collection
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Collections to export
        collections = ['teachers', 'rooms', 'subjects', 'classes', 'timetables']
        
        export_results = {}
        for collection_name in collections:
            # Get all documents from the collection
            documents = mongodb.find_many(collection_name, {})
            
            # Skip if collection is empty
            if not documents:
                logger.info(f"Collection {collection_name} is empty, skipping export")
                export_results[collection_name] = 0
                continue
            
            # Remove MongoDB-specific fields
            for doc in documents:
                if '_id' in doc:
                    doc['id'] = str(doc['_id'])
                    del doc['_id']
            
            # Convert to DataFrame
            df = pd.DataFrame(documents)
            
            # Save to CSV
            csv_path = os.path.join(output_dir, f"{collection_name}.csv")
            df.to_csv(csv_path, index=False)
            
            export_results[collection_name] = len(documents)
            logger.info(f"Exported {len(documents)} records from {collection_name} to {csv_path}")
        
        return True, export_results
    
    except Exception as e:
        logger.error(f"Failed to export MongoDB data to CSV: {str(e)}")
        return False, {}

def generate_database_stats() -> Dict:
    """
    Generate statistics about the MongoDB database.
    
    Returns:
        Dictionary with collection statistics
    """
    try:
        collections = ['teachers', 'rooms', 'subjects', 'classes', 'timetables']
        
        stats = {
            'total_documents': 0,
            'collections': {}
        }
        
        for collection_name in collections:
            count = len(mongodb.find_many(collection_name, {}))
            stats['collections'][collection_name] = count
            stats['total_documents'] += count
        
        stats['timestamp'] = datetime.utcnow().isoformat()
        
        return stats
    
    except Exception as e:
        logger.error(f"Failed to generate database stats: {str(e)}")
        return {'error': str(e)} 