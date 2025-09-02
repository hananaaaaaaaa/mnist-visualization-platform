// 通用工具函数
export const formatProbability = (prob) => {
    return Math.round(prob * 10000) / 100; // 保留两位小数
};

export const getProbabilityColor = (prob, isMax = false) => {
    if (isMax) {
        return '#52c41a'; // 绿色表示最高概率
    }
    if (prob > 0.7) {
        return '#1890ff'; // 蓝色表示高概率
    }
    if (prob > 0.3) {
        return '#faad14'; // 黄色表示中等概率
    }
    return '#d9d9d9'; // 灰色表示低概率
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 生成模拟数据用于测试
export const generateMockData = () => {
    const probabilities = Array(10).fill(0).map(() => Math.random() * 0.3);
    const maxIndex = Math.floor(Math.random() * 10);
    probabilities[maxIndex] = 0.7 + Math.random() * 0.3;
    
    // 归一化
    const sum = probabilities.reduce((a, b) => a + b, 0);
    const normalized = probabilities.map(p => p / sum);
    
    return {
        prediction: maxIndex,
        probabilities: normalized,
        success: true
    };
};
