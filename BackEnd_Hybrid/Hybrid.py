from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from surprise import Dataset, Reader, SVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

# Đọc dữ liệu
dataProduct = pd.read_csv("./Books.csv")
dataRating = pd.read_csv("./Ratings.csv")
dataUsers = pd.read_csv("./Users.csv")  # Đọc dữ liệu Users.csv

app = Flask(__name__)
CORS(app)  # Cấu hình CORS cho tất cả các route trong ứng dụng

# Kiểm tra các giá trị null
print(dataRating.isnull().sum())
print(dataProduct.isnull().sum())

# Chuẩn bị dữ liệu cho Content-based Filtering
content_df = dataProduct[['ISBN', 'Book-Title', 'Book-Author']].copy()
content_df['Content'] = content_df.apply(lambda row: ' '.join(row.dropna().astype(str)), axis=1)
tfidf_vectorizer = TfidfVectorizer()
content_matrix = tfidf_vectorizer.fit_transform(content_df['Content'])
content_similarity = linear_kernel(content_matrix, content_matrix)

# Chuẩn bị dữ liệu cho Collaborative Filtering
reader = Reader(rating_scale=(0, 10))
data = Dataset.load_from_df(dataRating[['User-ID', 'ISBN', 'Rating']], reader)
algo = SVD(random_state=10)
trainset = data.build_full_trainset()
algo.fit(trainset)

# Hàm lấy gợi ý dựa trên nội dung
def get_content_based_recommendations(product_id, top_n):
    index = content_df[content_df['ISBN'] == product_id].index[0]
    similarity_scores = content_similarity[index]
    similar_indices = similarity_scores.argsort()[::-1][1:top_n + 1]
    recommendations = content_df.loc[similar_indices, 'ISBN'].values
    return recommendations

# Hàm lấy gợi ý dựa trên cộng tác
def get_collaborative_filtering_recommendations(user_id, top_n):
    testset = trainset.build_anti_testset()
    testset = filter(lambda x: x[0] == user_id, testset)
    predictions = algo.test(list(testset))
    predictions.sort(key=lambda x: x.est, reverse=True)
    recommendations = [prediction.iid for prediction in predictions[:top_n]]
    return recommendations

# Hàm lấy gợi ý kết hợp
def get_hybrid_recommendations(user_id, product_id, top_n, content_weight=0.5, collaborative_weight=0.5):
    content_recommendations = get_content_based_recommendations(product_id, top_n)
    collaborative_recommendations = get_collaborative_filtering_recommendations(user_id, top_n)
    combined_recommendations = {}
    for idx, product in enumerate(content_recommendations):
        if product not in combined_recommendations:
            combined_recommendations[product] = 0
        combined_recommendations[product] += (top_n - idx) * content_weight
    
    for idx, product in enumerate(collaborative_recommendations):
        if product not in combined_recommendations:
            combined_recommendations[product] = 0
        combined_recommendations[product] += (top_n - idx) * collaborative_weight

    sorted_recommendations = sorted(combined_recommendations.items(), key=lambda x: x[1], reverse=True)
    
    hybrid_recommendations = [product for product, score in sorted_recommendations[:top_n]]
    
    return hybrid_recommendations

# Route để lấy gợi ý
@app.route('/api/recommendation', methods=['GET'])
def get_data():
    product_id = request.args.get('productId')
    user_id = request.args.get('userId')
    if not product_id or not user_id:
        return jsonify({"Error": "Both productId and userId are required."})
    user_id = int(user_id)
    if product_id not in content_df['ISBN'].values:
        return jsonify({"Error": "ProductID does not exist"})
    if user_id not in dataRating['User-ID'].values:
        return jsonify({"Error": "UserID does not exist"})
    recommendations = get_hybrid_recommendations(user_id, product_id, 10)
    recommendation_info = dataProduct[dataProduct['ISBN'].isin(recommendations)].to_dict(orient='records')
    data = {'Recommendations': recommendations, "Recommendation_info": recommendation_info}
    return jsonify(data)

# Route để lấy danh sách Book
@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        books = dataProduct[['ISBN', 'Book-Title', 'Book-Author', 'Year-Of-Publication', 'Publisher', 'Image-URL-L']].to_dict(orient='records')
        return jsonify({"Books": books})
    except Exception as e:
        return jsonify({"Error": str(e)}), 500
    
# Route để lấy sách theo ISBN
@app.route('/api/books/<isbn>', methods=['GET'])
def get_book_by_isbn(isbn):
    try:
        book = dataProduct[dataProduct['ISBN'] == isbn]
        if not book.empty:
            book_info = book[['ISBN', 'Book-Title', 'Book-Author', 'Year-Of-Publication', 'Publisher', 'Image-URL-L']].to_dict(orient='records')[0]
            return jsonify({"Book": book_info})
        else:
            return jsonify({"Error": "Book not found"}), 404
    except Exception as e:
        return jsonify({"Error": str(e)}), 500

# Route để lấy danh sách userId
@app.route('/api/user_ids', methods=['GET'])
def get_user_ids():
    try:
        user_ids = dataUsers['User-ID'].tolist()
        return jsonify({"User_IDs": user_ids})
    except Exception as e:
        return jsonify({"Error": str(e)}), 500

# Route để gợi ý sách dựa trên ISBN của sách yêu thích
@app.route('/api/recommend_by_favorite_book', methods=['GET'])
def recommend_by_favorite_book():
    try:
        product_id = request.args.get('productID')
        if not product_id:
            return jsonify({"Error": "Không có productID"}), 400
        
        # Lấy thông tin sách yêu cầu
        book = dataProduct[dataProduct['ISBN'] == product_id]
        if book.empty:
            return jsonify({"Error": "Không tìm thấy sách"}), 404
        
        book_author = book.iloc[0]['Book-Author']
        book_year = book.iloc[0]['Year-Of-Publication']
        
        # Tìm sách có cùng tác giả
        same_author_books = dataProduct[
            (dataProduct['Book-Author'] == book_author) & 
            (dataProduct['ISBN'] != product_id)
        ].head(2)
        
        # Tìm sách có cùng năm xuất bản
        same_year_books = dataProduct[
            (dataProduct['Year-Of-Publication'] == book_year) & 
            (dataProduct['ISBN'] != product_id)
        ].head(2)

        # Kết hợp sách cùng tác giả và cùng năm xuất bản
        recommended_books = pd.concat([same_author_books, same_year_books]).drop_duplicates().head(4)
        
        # Loại trừ sách hiện tại khỏi danh sách đề xuất
        # recommended_books = recommended_books[recommended_books['ISBN'] != product_id]
        
        # Chọn các cột liên quan và chuyển đổi thành dictionary
        recommended_books = recommended_books[['ISBN', 'Book-Title', 'Book-Author', 'Year-Of-Publication', 'Publisher', 'Image-URL-L']].to_dict(orient='records')
                
        return jsonify({"RecommendedBooks": recommended_books})
    except Exception as e:
        return jsonify({"Error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=8080)
