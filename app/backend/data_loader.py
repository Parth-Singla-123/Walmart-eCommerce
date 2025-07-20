import pandas as pd

def load_products(csv_path="products.csv"):
    """
    Load product catalog from CSV and return list of dictionaries.
    """
    df = pd.read_csv(csv_path)
    products = df.to_dict(orient="records")
    return products
