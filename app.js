import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Upload, Card, Button, Progress, Row, Col, Alert } from 'antd';
import { UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import './style.css';

const { Dragger } = Upload;

function MNISTApp() {
    const [image, setImage] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            setError('请上传图片文件');
            return false;
        }
        setError(null);
        return true;
    };

    const handleUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target.result);
            setResult(null);
        };
        reader.readAsDataURL(file);
        return false; // 阻止自动上传
    };

    const predictImage = async () => {
        if (!image) {
            setError('请先上传图片');
            return;
        }

        setPredicting(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: image })
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || '预测失败');
            }
        } catch (err) {
            setError('网络错误，请检查后端服务');
        }
        setPredicting(false);
    };

    const clearAll = () => {
        setImage(null);
        setResult(null);
        setError(null);
    };

    return React.createElement('div', { className: 'mnist-container' },
        React.createElement(Card, {
            title: '手写数字识别系统',
            style: { maxWidth: 800, margin: '50px auto' }
        },
            React.createElement('div', { className: 'upload-section' },
                React.createElement(Dragger, {
                    name: 'image',
                    multiple: false,
                    beforeUpload: beforeUpload,
                    onChange: (info) => handleUpload(info.file),
                    showUploadList: false,
                    accept: 'image/*'
                },
                    React.createElement('div', { className: 'upload-content' },
                        React.createElement(UploadOutlined, { style: { fontSize: '48px', color: '#1890ff' } }),
                        React.createElement('p', { className: 'ant-upload-text' }, '点击或拖拽图片到此处上传'),
                        React.createElement('p', { className: 'ant-upload-hint' }, '支持JPG、PNG等格式，建议上传手写数字图片')
                    )
                )
            ),

            error && React.createElement(Alert, {
                message: error,
                type: 'error',
                style: { marginTop: 16 }
            }),

            image && React.createElement('div', { className: 'preview-section' },
                React.createElement('h3', null, '图片预览:'),
                React.createElement('img', {
                    src: image,
                    alt: '上传的图片',
                    style: {
                        maxWidth: '200px',
                        maxHeight: '200px',
                        border: '2px solid #ddd',
                        borderRadius: '4px'
                    }
                }),

                React.createElement('div', { style: { marginTop: 16 } },
                    React.createElement(Button, {
                        type: 'primary',
                        onClick: predictImage,
                        loading: predicting,
                        disabled: !image
                    }, '识别数字'),

                    React.createElement(Button, {
                        onClick: clearAll,
                        style: { marginLeft: 8 }
                    }, '清除')
                )
            ),

            result && React.createElement('div', { className: 'result-section' },
                React.createElement('h3', null, '识别结果:'),
                React.createElement('div', { className: 'prediction-result' },
                    React.createElement('div', {
                        style: {
                            fontSize: '48px',
                            fontWeight: 'bold',
                            color: '#1890ff',
                            textAlign: 'center'
                        }
                    }, result.prediction)
                ),

                React.createElement('h4', null, '概率分布:'),
                React.createElement(Row, { gutter: [8, 8] },
                    [...Array(10).keys()].map(digit =>
                        React.createElement(Col, { span: 12, key: digit },
                            React.createElement('div', { className: 'probability-item' },
                                React.createElement('span', null, `数字 ${digit}:`),
                                React.createElement(Progress, {
                                    percent: Math.round(result.probabilities[digit] * 100),
                                    size: 'small',
                                    status: digit === result.prediction ? 'success' : 'normal'
                                })
                            )
                        )
                    )
                )
            )
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(MNISTApp));
