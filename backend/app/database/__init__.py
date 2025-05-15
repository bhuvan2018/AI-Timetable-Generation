from .csv_loader import CSVDataLoader
from .mongodb import mongodb

def load_csv_data():
    """Helper function to load all CSV data using CSVDataLoader."""
    loader = CSVDataLoader()
    return loader.load_all_data()

__all__ = ["load_csv_data", "mongodb", "CSVDataLoader"] 