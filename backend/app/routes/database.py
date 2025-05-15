from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional
import os
import logging

from ..database.mongodb import mongodb
from ..database.data_converter import import_csv_to_mongodb, export_mongodb_to_csv, generate_database_stats

# Set up logging
logger = logging.getLogger(__name__)

# Create API router
router = APIRouter(
    prefix="/database",
    tags=["database"],
    responses={404: {"description": "Not found"}},
)

@router.get("/stats")
async def get_database_stats():
    """
    Get statistics about the database.
    """
    try:
        stats = generate_database_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting database stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get database stats: {str(e)}")

@router.post("/import/csv")
async def import_csv_data(background_tasks: BackgroundTasks, csv_dir: str = "../datasets"):
    """
    Import CSV data to MongoDB.
    
    Args:
        csv_dir: Directory containing CSV files (default: ../datasets)
    """
    try:
        # Run import in the background to avoid blocking the API
        def run_import():
            success, results = import_csv_to_mongodb(csv_dir)
            logger.info(f"CSV import completed: {success}, {results}")
            
        background_tasks.add_task(run_import)
        
        return {
            "status": "Import started in background",
            "csv_dir": csv_dir
        }
    except Exception as e:
        logger.error(f"Error starting CSV import: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start CSV import: {str(e)}")

@router.post("/export/csv")
async def export_data_to_csv(background_tasks: BackgroundTasks, output_dir: str = "../exports"):
    """
    Export MongoDB data to CSV files.
    
    Args:
        output_dir: Directory to save CSV files (default: ../exports)
    """
    try:
        # Ensure the output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Run export in the background to avoid blocking the API
        def run_export():
            success, results = export_mongodb_to_csv(output_dir)
            logger.info(f"CSV export completed: {success}, {results}")
            
        background_tasks.add_task(run_export)
        
        return {
            "status": "Export started in background",
            "output_dir": output_dir
        }
    except Exception as e:
        logger.error(f"Error starting CSV export: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start CSV export: {str(e)}")

@router.get("/collections")
async def list_collections():
    """
    List all collections in the database.
    """
    try:
        collection_names = mongodb.db.list_collection_names()
        return {"collections": collection_names}
    except Exception as e:
        logger.error(f"Error listing collections: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list collections: {str(e)}")

@router.get("/collections/{collection_name}")
async def get_collection_data(collection_name: str, limit: int = 100):
    """
    Get data from a specific collection.
    
    Args:
        collection_name: Name of the collection
        limit: Maximum number of documents to return (default: 100)
    """
    try:
        data = mongodb.find_many(collection_name, {}, limit=limit)
        
        # Convert MongoDB ObjectId to string
        for item in data:
            item["_id"] = str(item["_id"])
            
        return {
            "collection": collection_name,
            "count": len(data),
            "data": data
        }
    except Exception as e:
        logger.error(f"Error getting collection data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get collection data: {str(e)}")

@router.delete("/collections/{collection_name}")
async def clear_collection(collection_name: str):
    """
    Clear all data from a specific collection.
    
    Args:
        collection_name: Name of the collection
    """
    try:
        count = mongodb.delete_many(collection_name, {})
        return {
            "collection": collection_name,
            "deleted_count": count,
            "status": "Collection cleared successfully"
        }
    except Exception as e:
        logger.error(f"Error clearing collection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear collection: {str(e)}")

@router.get("/health")
async def database_health_check():
    """
    Check database connection health.
    """
    try:
        # Try to ping the MongoDB server
        mongodb.client.admin.command('ping')
        return {"status": "healthy", "message": "Connected to MongoDB"}
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Database health check failed: {str(e)}") 