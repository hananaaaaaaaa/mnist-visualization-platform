import numpy as np
from PIL import Image, ImageFilter, ImageOps

def process_image(image):
    """处理上传的图片，转换为MNIST格式"""
    # 转换为灰度图
    if image.mode != 'L':
        image = image.convert('L')
    
    # 调整大小为28x28
    image = image.resize((28, 28), Image.LANCZOS)
    
    # 反色（MNIST是白底黑字，通常上传的是黑底白字）
    image = ImageOps.invert(image)
    
    # 增强对比度
    image = image.point(lambda x: 0 if x < 128 else 255)
    
    # 转换为numpy数组
    img_array = np.array(image, dtype=np.float32)
    
    # 归一化到0-1
    img_array = img_array / 255.0
    
    # 展平并调整形状为(784, 1)
    img_array = img_array.reshape(784, 1)
    
    return img_array

def create_sample_image():
    """创建示例图像用于测试"""
    from PIL import ImageDraw
    
    # 创建黑色背景
    img = Image.new('L', (280, 280), 0)
    draw = ImageDraw.Draw(img)
    
    # 绘制白色数字
    draw.text((100, 100), "5", fill=255, font_size=200)
    
    return img
