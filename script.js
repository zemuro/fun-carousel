const DEFAULT_DATA = {
    "YouTube": ["Vitek Play", "Юджин", "Фиксай", "Компот", "EdisonPts", "Поззи"],
    "Видеоигры": [
        "Cities: Skylines II", "Mini Motorways", "Mini Metro", "Tiny Glade", 
        "Besiege", "Poly Bridge", "Euro Truck Simulator 2", "Satisfactory", 
        "Shapez 2", "Planet Coaster", "Kerbal Space Program", "SpaceEngine", 
        "Universe Sandbox", "SPORE", "No Man's Sky", "Baba Is You", 
        "Monument Valley", "Undertale", "Cuphead", "Geometry Dash", 
        "Little Kitty Big City", "Plants vs. Zombies", "WorldBox", 
        "Minecraft", "Roblox", "Brawl Stars", "Terraria", "Among Us"
    ],
    "Посмотреть": [
        "Adventure Time", "Stranger Things", "Гравити Фолз", "Наруто", 
        "Человек-паук", "Мандалорец", "Уэнсдэй", "Гарри Поттер", "Мстители"
    ],
    "Творчество": [
        "Рисовать линерами", "Рисовать гуашью", "Лепить из пластилина", 
        "Поиграть на пианино", "Pixel Art", "Собрать LEGO"
    ]
};

const savedData = localStorage.getItem('funCarouselData');
let data;
try {
    data = savedData ? JSON.parse(savedData) : null;
} catch (e) {
    console.error("Ошибка загрузки данных", e);
}

// Если данных нет или список категорий пуст - берем стандартные
if (!data || Object.keys(data).length === 0) {
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
}

let currentCategory = null;

// ЗВУКОВОЙ ДВИЖОК (Web Audio API)
const AudioFX = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    
    playClick() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.1);
    },

    playTick() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.05);
    },

    playWin() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.5);
    }
};

// Цвета
// Цвета в стиле Neon Cyber (приглушенные основные, яркие неоновые акценты)
const colors = [
    "rgba(255, 0, 122, 0.3)", // Неоновый розовый
    "rgba(0, 212, 255, 0.3)", // Кибер-голубой
    "rgba(112, 0, 255, 0.3)", // Фиолетовый
    "rgba(0, 255, 157, 0.3)", // Изумрудный
    "rgba(255, 108, 0, 0.3)", // Оранжевый неон
    "rgba(0, 255, 204, 0.3)"  // Бирюза
];

const strokeColors = ["#ff007a", "#00d4ff", "#7000ff", "#00ff9d", "#ff6c00", "#00ffcc"];

// Функция отрисовки
function drawWheel(canvas, labels) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 20;
    
    ctx.clearRect(0, 0, size, size);
    
    if (!labels || labels.length === 0) {
        ctx.fillStyle = "#1e293b";
        ctx.beginPath(); ctx.arc(center, center, radius, 0, Math.PI * 2); ctx.fill();
        return;
    }

    const sliceAngle = (Math.PI * 2) / labels.length;

    labels.forEach((label, i) => {
        const startAngle = i * sliceAngle;
        const endAngle = startAngle + sliceAngle;
        
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        
        // Эффект свечения сегмента
        ctx.shadowBlur = 15;
        ctx.shadowColor = strokeColors[i % strokeColors.length];
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        
        // Яркая неоновая граница
        ctx.strokeStyle = strokeColors[i % strokeColors.length];
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.shadowBlur = 0; // Убираем тень для текста, чтобы был четким
        ctx.translate(center, center);
        ctx.rotate(startAngle + sliceAngle / 2);
        
        // Адаптивный шрифт для длинных надписей
        let fontSize = labels.length > 20 ? 12 : labels.length > 12 ? 16 : 22;
        ctx.font = `900 ${fontSize}px sans-serif`;
        
        // Дополнительная проверка: если текст слишком длинный для радиуса, уменьшаем еще сильнее
        const maxTextWidth = radius * 0.75; // Текст не должен занимать более 75% радиуса
        let textWidth = ctx.measureText(label).width;
        while (textWidth > maxTextWidth && fontSize > 8) {
            fontSize -= 1;
            ctx.font = `900 ${fontSize}px sans-serif`;
            textWidth = ctx.measureText(label).width;
        }

        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.lineWidth = 3;
        ctx.strokeText(label, radius - 20, 0); // Отступ 20px от края
        ctx.fillText(label, radius - 20, 0); 
        ctx.restore();
    });
}

function spin(canvas, labels, onComplete) {
    let rotation = 0;
    let speed = Math.random() * 0.25 + 0.35;
    const friction = 0.988;
    let lastSector = -1;
    const sliceAngle = (Math.PI * 2) / labels.length;
    
    function animate() {
        rotation += speed;
        speed *= friction;
        canvas.style.transform = `rotate(${rotation}rad)`;
        
        // Логика щелчков (определяем текущий сектор под стрелкой)
        const actualRotation = rotation % (Math.PI * 2);
        const currentSector = Math.floor((Math.PI * 2 - actualRotation - Math.PI/2) / sliceAngle) % labels.length;
        
        if (currentSector !== lastSector) {
            AudioFX.playTick();
            lastSector = currentSector;
        }

        if (speed > 0.001) {
            requestAnimationFrame(animate);
        } else {
            const index = Math.floor((Math.PI * 2 - actualRotation - Math.PI/2) / sliceAngle) % labels.length;
            const finalIndex = index < 0 ? index + labels.length : index;
            onComplete(labels[finalIndex]);
        }
    }
    animate();
}

// ЛОГИКА ГЛАВНОЙ СТРАНИЦЫ
function init() {
    if (!document.getElementById('category-wheel')) return;

    const catWheel = document.getElementById('category-wheel');
    const itemWheel = document.getElementById('item-wheel');
    const catCard = document.getElementById('cat-card');
    const itemCard = document.getElementById('item-card');
    const spinCatBtn = document.getElementById('spin-category');
    const spinItemBtn = document.getElementById('spin-item');
    const catResult = document.getElementById('category-result');
    const itemResult = document.getElementById('item-result');

    drawWheel(catWheel, Object.keys(data));

    spinCatBtn.onclick = () => {
        AudioFX.playClick();
        spinCatBtn.disabled = true;
        catCard.classList.add('active-focus');
        itemCard.classList.add('disabled');
        catResult.innerText = "КРУТИМ...";
        
        spin(catWheel, Object.keys(data), (result) => {
            currentCategory = result;
            catResult.innerText = result;
            spinCatBtn.disabled = false;
            catCard.classList.remove('active-focus');
            
            drawWheel(itemWheel, data[result]);
            itemCard.classList.remove('disabled');
            itemCard.classList.add('active-focus');
            spinItemBtn.disabled = false;
            
            AudioFX.playWin();
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        });
    };

    spinItemBtn.onclick = () => {
        AudioFX.playClick();
        spinItemBtn.disabled = true;
        itemResult.innerText = "ВЫБИРАЕМ...";
        
        spin(itemWheel, data[currentCategory], (result) => {
            itemResult.innerText = result;
            spinItemBtn.disabled = false;
            itemCard.classList.remove('active-focus'); // Убираем зум после остановки
            AudioFX.playWin();
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        });
    };
    
    const drawAll = () => {
        drawWheel(catWheel, Object.keys(data));
        drawWheel(itemWheel, currentCategory ? data[currentCategory] : []);
    };

    drawAll();
} // ЗАКРЫВАЕМ INIT

// ЛОГИКА АДМИНКИ
if (document.getElementById('data-list')) {
    const updateAdmin = () => {
        const select = document.getElementById('category-select');
        const dataList = document.getElementById('data-list');
        if (!select || !dataList) return;

        select.innerHTML = ""; dataList.innerHTML = "";
        
        const categories = Object.keys(data);
        if (categories.length === 0) {
            dataList.innerHTML = "<p style='opacity:0.5'>Список пуст. Добавьте категорию или восстановите стандартные настройки.</p>";
        }

        categories.forEach(cat => {
            const opt = document.createElement('option'); opt.value = cat; opt.innerText = cat;
            select.appendChild(opt);
            
            const group = document.createElement('div');
            group.className = 'category-item';
            group.innerHTML = `
                <div class="category-header">
                    <h3>${cat}</h3>
                    <button class="danger-btn" style="width:auto; padding: 5px 15px;" onclick="deleteCategory('${cat}')">Удалить</button>
                </div>
                <div class="item-list">${(data[cat] || []).map(item => `
                    <div class="item-tag">
                        <span>${item}</span>
                        <span class="delete-item" onclick="deleteItem('${cat}', '${item}')">×</span>
                    </div>
                `).join('')}</div>
            `;
            dataList.appendChild(group);
        });
    };

    const saveData = () => {
        localStorage.setItem('funCarouselData', JSON.stringify(data));
        updateAdmin();
    };

    window.deleteCategory = (cat) => { 
        if(confirm(`Удалить категорию "${cat}"?`)) {
            delete data[cat]; 
            saveData(); 
        }
    };
    
    window.deleteItem = (cat, item) => { 
        data[cat] = data[cat].filter(i => i !== item); 
        saveData(); 
    };

    window.resetToDefault = () => {
        if(confirm("Восстановить стандартные категории? Ваши текущие данные будут заменены.")) {
            data = JSON.parse(JSON.stringify(DEFAULT_DATA));
            saveData();
        }
    };

    document.getElementById('add-category-btn').onclick = () => {
        const val = document.getElementById('new-category-name').value.trim();
        if (val && !data[val]) { 
            data[val] = []; 
            document.getElementById('new-category-name').value = ""; 
            saveData(); 
        }
    };

    document.getElementById('add-item-btn').onclick = () => {
        const cat = document.getElementById('category-select').value;
        const val = document.getElementById('new-item-name').value.trim();
        if (cat && val && !data[cat].includes(val)) { 
            data[cat].push(val); 
            document.getElementById('new-item-name').value = ""; 
            saveData(); 
        }
    };

    updateAdmin();
}

// ЗВЕЗДНЫЙ ТОННЕЛЬ
const tunnelCanvas = document.getElementById('star-tunnel');
if (tunnelCanvas) {
    const tCtx = tunnelCanvas.getContext('2d');
    let stars = [];
    const starCount = 400;
    
    function resize() {
        tunnelCanvas.width = window.innerWidth;
        tunnelCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: (Math.random() - 0.5) * 2000,
            y: (Math.random() - 0.5) * 2000,
            z: Math.random() * 2000
        });
    }

    function animateTunnel() {
        tCtx.fillStyle = 'black';
        tCtx.fillRect(0, 0, tunnelCanvas.width, tunnelCanvas.height);
        
        const cx = tunnelCanvas.width / 2;
        const cy = tunnelCanvas.height / 2;

        stars.forEach(s => {
            s.z -= 15;
            if (s.z <= 0) s.z = 2000;

            const x = s.x / (s.z / 1000) + cx;
            const y = s.y / (s.z / 1000) + cy;
            const size = (1 - s.z / 2000) * 3;

            if (x > 0 && x < tunnelCanvas.width && y > 0 && y < tunnelCanvas.height) {
                tCtx.fillStyle = `rgba(255, 255, 255, ${1 - s.z / 2000})`;
                tCtx.beginPath();
                tCtx.arc(x, y, size, 0, Math.PI * 2);
                tCtx.fill();
            }
        });
        requestAnimationFrame(animateTunnel);
    }
    animateTunnel();
}

init();
// ФУНКЦИИ ИМПОРТА И ЭКСПОРТА
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "carousel_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (confirm("Вы уверены? Это заменит все текущие занятия.")) {
                data = importedData;
                saveData();
                renderAdmin();
                alert("Данные успешно загружены!");
            }
        } catch (err) {
            alert("Ошибка при чтении файла! Проверьте формат.");
        }
    };
    reader.readAsText(file);
}
