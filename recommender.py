import pandas as pd
import numpy as np
import pickle
import json
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix, save_npz, load_npz, lil_matrix

# Paths
SVD_PATH = "ml models/svd_model.pkl"
USER_ENC_PATH = "ml models/user_enc.pkl"
ITEM_ENC_PATH = "ml models/item_enc.pkl"
SPARSE_MATRIX_PATH = "ml models/sparse_matrix.npz"
POPULAR_PRODUCTS_PATH = "ml models/popular_products.json"

# Globals
svd = None
user_enc = None
item_enc = None
sparse_matrix = None
popular_products = []

def build_model():
    global svd, user_enc, item_enc, sparse_matrix, popular_products

    # Load orders and products (small files)
    orders = pd.read_csv("dataset/orders.csv", usecols=['order_id', 'user_id'])
    products = pd.read_csv("dataset/products.csv", usecols=['product_id', 'product_name'])

    # Encode users and products
    user_enc = LabelEncoder()
    user_enc.fit(orders['user_id'])
    item_enc = LabelEncoder()
    item_enc.fit(products['product_name'])

    # Process large order_products file in chunks
    chunk_size = 1_000_000
    sparse_matrices = []

    for chunk in pd.read_csv("dataset/order_products__prior.csv", usecols=['order_id', 'product_id'], chunksize=chunk_size):
        merged = chunk.merge(orders, on='order_id').merge(products, on='product_id')
        user_idx = user_enc.transform(merged['user_id'])
        item_idx = item_enc.transform(merged['product_name'])
        values = np.ones(len(merged))
        chunk_matrix = csr_matrix(
            (values, (user_idx, item_idx)),
            shape=(len(user_enc.classes_), len(item_enc.classes_))
        )
        sparse_matrices.append(chunk_matrix)

    sparse_matrix = sum(sparse_matrices)
    save_npz(SPARSE_MATRIX_PATH, sparse_matrix)

    # Train TruncatedSVD
    svd = TruncatedSVD(n_components=50, random_state=42)
    svd.fit(sparse_matrix)

    # Save artifacts
    pickle.dump(svd, open(SVD_PATH, "wb"))
    pickle.dump(user_enc, open(USER_ENC_PATH, "wb"))
    pickle.dump(item_enc, open(ITEM_ENC_PATH, "wb"))

    # Precompute popular products
    popular_products = merged['product_name'].value_counts().head(350).index.tolist()
    with open(POPULAR_PRODUCTS_PATH, "w") as f:
        json.dump(popular_products, f)

def load_model():
    global svd, user_enc, item_enc, sparse_matrix, popular_products

    svd = pickle.load(open(SVD_PATH, "rb"))
    user_enc = pickle.load(open(USER_ENC_PATH, "rb"))
    item_enc = pickle.load(open(ITEM_ENC_PATH, "rb"))
    sparse_matrix = load_npz(SPARSE_MATRIX_PATH)
    with open(POPULAR_PRODUCTS_PATH, "r") as f:
        popular_products = json.load(f)

def get_recommendations(user_id, top_n):
    load_model()

    if user_id not in user_enc.classes_:
        print(f"[INFO] User {user_id} not found. Adding default purchases.")
        update_user_purchase(user_id, ["Bananas"])

        # Reload model after update
        load_model()

    user_idx = user_enc.transform([user_id])[0]
    user_embedding = svd.transform(sparse_matrix[user_idx])

    # Memory-safe similarity computation
    all_embeddings = svd.transform(sparse_matrix)
    similarities = cosine_similarity(user_embedding, all_embeddings).flatten()

    similar_users = similarities.argsort()[::-1][1:20]  # Top similar users (skip self)
    similar_items = sparse_matrix[similar_users].sum(axis=0).A1

    # Exclude items the user already bought
    user_items = sparse_matrix[user_idx].toarray().flatten()
    similar_items[user_items > 0] = 0

    # Get top-N recommendations
    recommended_idx = similar_items.argsort()[::-1][:top_n]
    recommended_items = item_enc.inverse_transform(recommended_idx)

    return list(recommended_items)


def update_user_purchase(user_id, product_names):
    global user_enc, item_enc, sparse_matrix

    # Ensure product_names is a list
    if isinstance(product_names, str):
        product_names = [product_names]

    sparse_matrix = lil_matrix(sparse_matrix)

    if user_id not in user_enc.classes_:
        print(f"[INFO] Adding new user {user_id}")
        user_enc.classes_ = np.append(user_enc.classes_, user_id)
        sparse_matrix.resize((len(user_enc.classes_), sparse_matrix.shape[1]))

    # Mark all products as purchased for the user
    for product_name in product_names:
        if product_name not in item_enc.classes_:
            print(f"[WARN] Product '{product_name}' not in original dataset. Skipping.")
            continue
        user_idx = user_enc.transform([user_id])[0]
        item_idx = item_enc.transform([product_name])[0]
        sparse_matrix[user_idx, item_idx] = 1  # Mark purchase

    sparse_matrix = sparse_matrix.tocsr()

    # Save updates
    pickle.dump(user_enc, open(USER_ENC_PATH, "wb"))
    pickle.dump(item_enc, open(ITEM_ENC_PATH, "wb"))
    save_npz(SPARSE_MATRIX_PATH, sparse_matrix)

