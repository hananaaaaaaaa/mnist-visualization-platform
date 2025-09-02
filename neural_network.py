import numpy as np
import pickle

class NeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        self.W1 = np.random.randn(hidden_size, input_size) * 0.01
        self.b1 = np.zeros((hidden_size, 1))
        self.W2 = np.random.randn(output_size, hidden_size) * 0.01
        self.b2 = np.zeros((output_size, 1))
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def sigmoid_derivative(self, x):
        return x * (1 - x)
    
    def softmax(self, x):
        exp_x = np.exp(x - np.max(x, axis=0, keepdims=True))
        return exp_x / np.sum(exp_x, axis=0, keepdims=True)
    
    def forward(self, X):
        self.Z1 = np.dot(self.W1, X) + self.b1
        self.A1 = self.sigmoid(self.Z1)
        self.Z2 = np.dot(self.W2, self.A1) + self.b2
        self.A2 = self.softmax(self.Z2)
        return self.A2
    
    def predict(self, X):
        A2 = self.forward(X)
        return np.argmax(A2, axis=0)
    
    def predict_with_probability(self, X):
        """返回预测结果和概率分布"""
        A2 = self.forward(X)
        prediction = np.argmax(A2, axis=0)[0]
        probabilities = A2.flatten()
        return prediction, probabilities
    
    def save_model(self, filename):
        model_data = {
            'W1': self.W1,
            'b1': self.b1,
            'W2': self.W2,
            'b2': self.b2
        }
        with open(filename, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self, filename):
        with open(filename, 'rb') as f:
            model_data = pickle.load(f)
        self.W1 = model_data['W1']
        self.b1 = model_data['b1']
        self.W2 = model_data['W2']
        self.b2 = model_data['b2']
