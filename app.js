import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Upload, Card, Button, Progress, Row, Col, Alert, Spin, Modal } from 'antd';
import { UploadOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { validateImage, readFileAsDataURL, compressImage } from './upload.js';
import { formatProbability, getProbabilityColor } from './utils.js';
import './style.css';

const { Dragger } = Upload;

function MNISTApp() {
    const [image, setImage] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);

    const beforeUpload = (file) => {
        const errorMsg = validateImage(file);
        if (errorMsg) {
            setError(errorMsg);
            return false;
        }
        setError(null);
        return true;
    };

    const handleUpload = async (file) => {
        try {
            setPredicting(true);
            const dataUrl = await readFileAsDataURL(file);
            setOriginalImage(dataUrl);
            
            // 压缩图片
            const compressedImage = await compressImage(dataUrl);
            setImage(compressedImage);
            setResult(null);
            
        } catch (err) {
            setError('图片读取失败');
        } finally {
            setPredicting(false);
        }
        return false;
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
            setError('网络错误，请检查后端服务是否启动');
            console.error('预测错误:', err);
        }
        setPredicting(false);
    };

    const clearAll = () => {
        setImage(null);
        setOriginalImage(null);
        setResult(null);
        setError(null);
    };

    const showPreview = () => {
        setPreviewVisible(true);
    };

    const hidePreview = () => {
        setPreviewVisible(false);
    };

    return React.createElement('div', { className: 'mnist-container' },
        React.createElement(Card, {
            title: React.createElement('h1', { style: { margin: 0 } }, '✍️ 手写数字识别系统'),
            style: { maxWidth: 800, margin: '50px auto' }
        },
            React.createElement('p', { 
                style: { color: '#666', marginBottom: 24, textAlign: 'center' } 
            }, '上传手写数字图片，AI将自动识别数字'),

            React.createElement('div', { className: 'upload-section' },
                React.createElement(Dragger, {
                    name: 'image',
                    multiple: false,
                    beforeUpload: beforeUpload,
                    onChange: (info) => {
                        const file = info.file;
                        if (file.status === 'removed') return;
                        handleUpload(file.originFileObj);
                    },
                    showUploadList: false,
                    accept: 'image/*',
                    disabled: predicting
                },
                    React.createElement('div', { className: 'upload-content' },
                        predicting ? 
                            React.createElement(Spin, { size: 'large' }) :
                            React.createElement(UploadOutlined, { style: { fontSize: '48px', color: '#1890ff' } }),
                        React.createElement('p', { className: 'ant-upload-text' }, 
                            predicting ? '处理中...' : '点击或拖拽图片到此处上传'
                        ),
                        React.createElement('p', { className: 'ant-upload-hint' }, 
                            '支持JPG、PNG等格式，建议上传清晰的手写数字图片'
                        )
                    )
                )
            ),

            error && React.createElement(Alert, {
                message: error,
                type: 'error',
                style: { marginTop: 16 },
                closable: true,
                onClose: () => setError(null)
            }),

            image && React.createElement('div', { className: 'preview-section' },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
                    React.createElement('h3', { style: { margin: 0 } }, '图片预览'),
                    React.createElement(Button, {
                        icon: React.createElement(EyeOutlined),
                        size: 'small',
                        onClick: showPreview
                    }, '查看原图')
                ),
                
                React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('img', {
                        src: image,
                        alt: '上传的图片',
                        style: {
                            maxWidth: '200px',
                            maxHeight: '200px',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }
                    })
                ),

                React.createElement('div', { style: { marginTop: 20, textAlign: 'center' } },
                    React.createElement(Button, {
                        type: 'primary',
                        size: 'large',
                        onClick: predictImage,
                        loading: predicting,
                        disabled: !image,
                        style: { marginRight: 12 }
                    }, '识别数字'),

                    React.createElement(Button, {
                        onClick: clearAll,
                        size: 'large'
                    }, '清除重试')
                )
            ),

            result && React.createElement('div', { className: 'result-section' },
                React.createElement('h3', { style: { textAlign: 'center', color: '#1890ff' } }, '识别结果'),
                
                React.createElement('div', { className: 'prediction-result' },
                    React.createElement('div', {
                        style: {
                            fontSize: '72px',
                            fontWeight: 'bold',
                            color: getProbabilityColor(1, true),
                            textAlign: 'center',
                            margin: '20px 0'
                        }
                    }, result.prediction),
                    React.createElement('p', { 
                        style: { textAlign: 'center', color: '#666', margin: 0 } 
                    }, `置信度: ${formatProbability(result.probabilities[result.prediction])}%`)
                ),

                React.createElement('h4', null, '详细概率分布:'),
                React.createElement(Row, { gutter: [16, 16] },
                    [...Array(10).keys()].map(digit =>
                        React.createElement(Col, { span: 12, key: digit },
                            React.createElement('div', { 
                                className: 'probability-item',
                                style: { 
                                    backgroundColor: digit === result.prediction ? '#f6ffed' : '#fff',
                                    border: digit === result.prediction ? '1px solid #b7eb8f' : '1px solid #f0f0f0'
                                }
                            },
                                React.createElement('div', { 
                                    style: { 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        marginBottom: 4 
                                    } 
                                },
                                    React.createElement('span', { 
                                        style: { 
                                            fontWeight: digit === result.prediction ? 'bold' : 'normal',
                                            color: digit === result.prediction ? '#52c41a' : '#000'
                                        }
                                    }, `数字 ${digit}`),
                                    React.createElement('span', null, `${formatProbability(result.probabilities[digit])}%`)
                                ),
                                React.createElement(Progress, {
                                    percent: formatProbability(result.probabilities[digit]),
                                    size: 'small',
                                    strokeColor: getProbabilityColor(result.probabilities[digit], digit === result.prediction),
                                    showInfo: false
                                })
                            )
                        )
                    )
                )
            ),

            React.createElement(Modal, {
                title: '原始图片预览',
                open: previewVisible,
                onCancel: hidePreview,
                footer: null,
                width: 400
            },
                originalImage && React.createElement('img', {
                    src: originalImage,
                    alt: '原始图片',
                    style: { width: '100%', borderRadius: '4px' }
                })
            )
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(MNISTApp));
