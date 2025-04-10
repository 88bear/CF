from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# 模擬不同身份對應的推薦產品 (以包為例)
product_map = {
    "white_collar_m": ["Professional Briefcase", "Luxury Laptop Bag"],
    "white_collar_f": ["Designer Handbag", "Elegant Tote Bag"],
    "blue_collar_m": ["Durable Workpack", "Utility Messenger Bag"],
    "blue_collar_f": ["Casual Sling Bag", "Non-Slip Crossbody"],
    "elderly_m": ["Simple Tote", "Glasses Case Bag"],
    "elderly_f": ["Classic Shoulder Bag", "Comfort Purse"],
    "student_m": ["Spacious Backpack", "Casual Side Bag"],
    "student_f": ["Stylish Backpack", "Compact Sling Bag"],
    "household_m": ["Men's Utility Bag", "Everyday Messenger Bag"],
    "household_f": ["Elegant Purse", "Eco-Friendly Tote"]
}

# 正向且模稜兩可的提示範本，並帶入使用者身份與推薦產品資訊
prompt_templates = [
    "As a {identity}, you have a unique sense of style that always shines through. A {product} is a wonderful match for your dynamic lifestyle.",
    "For someone like you ({identity}), a {product} blends functionality with sophistication perfectly.",
    "Your taste as a {identity} indicates that you appreciate quality and subtle elegance. Consider a {product} to enhance your daily experiences."
]

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    # 從前端取得御守、身份以及抽卡選取的圖片路徑
    omamori = data.get('omamori')
    identity = data.get('identity')
    selected_card = data.get('selectedCard')

    # 根據身份取得推薦產品，若無對應則使用預設商品
    recommended_products = product_map.get(identity, ["Universal Bag"])
    
    # 根據抽卡結果，可附加額外推薦 (範例)
    if "card1" in selected_card:
        recommended_products.append("Limited Edition Bag")
    elif "card2" in selected_card:
        recommended_products.append("Seasonal Special Bag")
    
    # 隨機挑選一款產品，供生成提示語使用
    product_for_prompt = random.choice(recommended_products)
    
    # 格式化身份文字（例如將 "student_m" 轉為 "Student M"）
    identity_readable = identity.replace("_", " ").title()
    
    # 隨機採用一個提示範本，生成個性化提示語
    prompt = random.choice(prompt_templates).format(identity=identity_readable, product=product_for_prompt)

    return jsonify({
        "omamori": omamori,
        "identity": identity,
        "selectedCard": selected_card,
        "products": recommended_products,
        "prompt": prompt
    })

# 新增情緒評估資料接收端點
@app.route('/api/emotional_feedback', methods=['POST'])
def emotional_feedback():
    data = request.get_json()
    
    # 獲取情緒評估資料
    valence = data.get('valence')
    arousal = data.get('arousal')
    dominance = data.get('dominance')
    omamori = data.get('omamori')
    identity = data.get('identity')
    
    # 這裡可以保存資料到資料庫或進行其他處理
    # 在實際應用中，你可能希望將這些資料與用戶ID和推薦結果一起存儲
    
    print(f"情緒評估接收: 身份={identity}, 御守={omamori}, 愉悅度={valence}, 喚起度={arousal}, 主導感={dominance}")
    
    # 返回確認訊息
    return jsonify({
        "status": "success",
        "message": "Emotional feedback received successfully",
        "data": {
            "valence": valence,
            "arousal": arousal,
            "dominance": dominance
        }
    })

if __name__ == '__main__':
    app.run(debug=True)
