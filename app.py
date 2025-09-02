from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from neural_network import NeuralNetwork
from image_processor import process_image
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

# 加载训练好的模型
nn = NeuralNetwork(784, 128, 10)
nn.load_model('mnist_model.pkl')

@app.route('/api/predict', methods=['POST'])
def predict():
    """处理图片预测"""
    try:
        # 获取上传的图片
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': '没有收到图片数据'}), 400
        
        # 解码base64图片
        image_data = data['image'].split(',')[1]  # 去掉data:image/png;base64,前缀
        image_bytes = base64.b64decode(image_data)
        
        # 转换为PIL图像
        image = Image.open(io.BytesIO(image_bytes))
        
        # 处理图像
        processed_image = process_image(image)
        
        # 预测
        prediction, probabilities = nn.predict_with_probability(processed_image)
        
        return jsonify({
            'prediction': int(prediction),
            'probabilities': probabilities.tolist(),
            'success': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({'status': 'healthy', 'model_loaded': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
