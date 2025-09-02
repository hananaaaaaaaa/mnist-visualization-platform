// 上传相关的工具函数
export const validateImage = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        return '请上传图片文件';
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        return '图片大小不能超过5MB';
    }
    
    return null;
};

export const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const compressImage = (dataUrl, maxWidth = 400, maxHeight = 400) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // 计算缩放比例
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = dataUrl;
    });
};
