 import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function MNISTApp() {
    const [image, setImage] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [result, setResult] = useState(null);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
            setResult(null);
        }
    };

    const predictImage = async () => {
        if (!image) return;
        
        setPredicting(true);
        try {
            const response = await fetch('http://localhost:5000/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: image })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
        }
        setPredicting(false);
    };

    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } },
        React.createElement('h1', null, '手写数字识别'),
        
        React.createElement('input', {
            type: 'file',
            accept: 'image/*',
            onChange: handleImageUpload,
            style: { margin: '20px' }
        }),
        
        image && React.createElement('div', null,
            React.createElement('img', {
                src: image,
                alt: 'Preview',
                style: { width: '200px', margin: '10px' }
            }),
            React.createElement('br'),
            React.createElement('button', {
                onClick: predictImage,
                disabled: predicting,
                style: { padding: '10px 20px', fontSize: '16px' }
            }, predicting ? '识别中...' : '开始识别')
        ),
        
        result && result.success && React.createElement('div', { style: { marginTop: '20px' } },
            React.createElement('h2', null, `识别结果: ${result.prediction}`),
            React.createElement('div', null, '概率分布:'),
            result.probabilities.map((prob, index) =>
                React.createElement('div', { key: index },
                    `数字 ${index}: ${(prob * 100).toFixed(1)}%`
                )
            )
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(MNISTApp));
