// 获取DOM元素
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const gridSizeSlider = document.getElementById('gridSize');
const gridSizeNum = document.getElementById('gridSizeNum');
const gridSizeValue = document.getElementById('gridSizeValue');
const thresholdSlider = document.getElementById('threshold');
const thresholdNum = document.getElementById('thresholdNum');
const thresholdValue = document.getElementById('thresholdValue');
const textInput = document.getElementById('textInput');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');

function isValidGridSize(value) {
    const num = Number(value);
    return Number.isInteger(num) && num >= 1;
}

function isValidThreshold(value) {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 100;
}

gridSizeSlider.addEventListener('input', (e) => {
    gridSizeNum.value = e.target.value;
    gridSizeValue.textContent = e.target.value;
});

gridSizeNum.addEventListener('input', (e) => {
    if (e.target.value === '') {
        gridSizeValue.textContent = '?';
        return;
    }
    
    const value = e.target.value;
    
    if (isValidGridSize(value)) {
        const num = parseInt(value);
        gridSizeValue.textContent = num;
        if (num >= 4 && num <= 128) {
            gridSizeSlider.value = num;
        }
    } else {
        gridSizeValue.textContent = '?';
    }
});

gridSizeNum.addEventListener('blur', (e) => {
    if (e.target.value === '') {
        e.target.value = 32;
        gridSizeSlider.value = 32;
        gridSizeValue.textContent = 32;
    }
});

gridSizeNum.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (e.target.value === '') {
            e.target.value = 32;
            gridSizeSlider.value = 32;
            gridSizeValue.textContent = 32;
        }
        
        if (!isValidGridSize(e.target.value)) {
            alert('网格大小必须是大于等于 1 的整数！');
            return;
        }
        
        generatePixelFont();
    }
});

thresholdSlider.addEventListener('input', (e) => {
    thresholdNum.value = e.target.value;
    thresholdValue.textContent = e.target.value;
});

thresholdNum.addEventListener('input', (e) => {
    if (e.target.value === '') {
        thresholdValue.textContent = '?';
        return;
    }
    
    const value = e.target.value;
    
    if (isValidThreshold(value)) {
        const num = parseFloat(value);
        thresholdValue.textContent = num;
        thresholdSlider.value = num;
    } else {
        thresholdValue.textContent = '?';
    }
});

thresholdNum.addEventListener('blur', (e) => {
    if (e.target.value === '') {
        e.target.value = 50;
        thresholdSlider.value = 50;
        thresholdValue.textContent = 50;
    }
});

thresholdNum.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // return when ''
        if (e.target.value === '') {
            e.target.value = 50;
            thresholdSlider.value = 50;
            thresholdValue.textContent = 50;
        }
        
        if (!isValidThreshold(e.target.value)) {
            alert('亮度阈值必须是 0-100 之间的数字！');
            return;
        }
        
        generatePixelFont();
    }
});

textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generatePixelFont();
    }
});

function generateCharacterPixelData(char, gridSize, charSize) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = charSize;
    tempCanvas.height = charSize;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, charSize, charSize);

    const fontSize = Math.floor(charSize * 0.9);
    tempCtx.font = `bold ${fontSize}px Arial, "Microsoft YaHei", sans-serif`;
    tempCtx.fillStyle = 'black';
    
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    const offsetY = charSize*0.05;
    tempCtx.fillText(char, charSize / 2, charSize / 2 + offsetY);

    const imageData = tempCtx.getImageData(0, 0, charSize, charSize);
    const data = imageData.data;

    const cellSize = charSize / gridSize;

    const pixelData = [];

    for (let row = 0; row < gridSize; row++) {
        pixelData[row] = [];
        for (let col = 0; col < gridSize; col++) {
            let totalBrightness = 0;
            let pixelCount = 0;

            // average brightness
            const startX = Math.floor(col * cellSize);
            const startY = Math.floor(row * cellSize);
            const endX = Math.floor((col + 1) * cellSize);
            const endY = Math.floor((row + 1) * cellSize);

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    const index = (y * charSize + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    
                    // calculate brightness
                    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255 * 100;
                    totalBrightness += brightness;
                    pixelCount++;
                }
            }

            const avgBrightness = totalBrightness / pixelCount;
            pixelData[row][col] = avgBrightness;
        }
    }

    return pixelData;
}

function generatePixelFont() {
    const text = textInput.value.trim();
    if (!text) {
        alert('请输入文字！');
        return;
    }

    const gridSizeValue = gridSizeNum.value;
    if (!isValidGridSize(gridSizeValue)) {
        alert('网格大小必须是大于等于 1 的整数！');
        return;
    }
    const gridSize = parseInt(gridSizeValue);

    const thresholdValue = thresholdNum.value;
    if (!isValidThreshold(thresholdValue)) {
        alert('亮度阈值必须是 0-100 之间的数！');
        return;
    }
    const threshold = parseFloat(thresholdValue);

    const charRenderSize = 500;
    
    const charDisplaySize = gridSize * 8;
    const charSpacing = 10;

    const totalWidth = text.length * charDisplaySize + (text.length - 1) * charSpacing;
    const totalHeight = charDisplaySize;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // each char
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const pixelData = generateCharacterPixelData(char, gridSize, charRenderSize);
        
        // start point
        const offsetX = i * (charDisplaySize + charSpacing);
        const cellSize = charDisplaySize / gridSize;

        // pixel grids
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const avgBrightness = pixelData[row][col];
                
                ctx.fillStyle = avgBrightness > threshold ? 'white' : 'black';
                
                const x = offsetX + col * cellSize;
                const y = row * cellSize;
                ctx.fillRect(x, y, Math.ceil(cellSize), Math.ceil(cellSize));
            }
        }

        // grid line
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        for (let j = 0; j <= gridSize; j++) {
            const pos = j * cellSize;
            // vertical
            ctx.beginPath();
            ctx.moveTo(offsetX + pos, 0);
            ctx.lineTo(offsetX + pos, charDisplaySize);
            ctx.stroke();
            // horizental
            ctx.beginPath();
            ctx.moveTo(offsetX, pos);
            ctx.lineTo(offsetX + charDisplaySize, pos);
            ctx.stroke();
        }
    }
}

function downloadImage() {
    if (canvas.width === 0) {
        alert('请先生成内容！');
        return;
    }

    const link = document.createElement('a');
    link.download = `pixelized_${textInput.value}_${gridSizeNum.value}x${gridSizeNum.value}_${thresholdNum.value}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    textInput.value = '';
}

generateBtn.addEventListener('click', generatePixelFont);
downloadBtn.addEventListener('click', downloadImage);
clearBtn.addEventListener('click', clearCanvas);

window.addEventListener('load', () => {
    generatePixelFont();
});
