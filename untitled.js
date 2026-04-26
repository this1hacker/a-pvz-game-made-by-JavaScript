var container = document.getElementById('container');

// --- 网格配置参数 ---
var GLOBAL_OFFSET_X = 50; 
var START_X = 45 + GLOBAL_OFFSET_X; // 95

var GRID_ROWS = 5;
var GRID_COLS = 9;
var CELL_WIDTH = 80;                
var CELL_HEIGHT = 100;              

// 【视觉修正】植物行坐标，确保与背景图草坪对齐
// 对应 sprites.js 中的逻辑: 210, 310, 410, 510, 610
var ROW_TOPS = [210, 310, 410, 510, 610];

// 用于记录网格占用状态 (防止重叠)
var gridState = [];
for (var i = 0; i < GRID_ROWS; i++) {
    gridState[i] = new Array(GRID_COLS).fill(null);
}

/**
 * 核心函数：将任意坐标吸附到最近的网格中心
 */
function snapToGrid(x, y) {
    var row = -1;
    // 判断行：允许上下 50px 的误差范围来捕捉鼠标所在的行
    for (var r = 0; r < GRID_ROWS; r++) {
        if (y >= ROW_TOPS[r] - 50 && y <= ROW_TOPS[r] + 50) {
            row = r;
            break;
        }
    }

    var col = -1;
    if (row !== -1) {
        // 计算列
        col = Math.floor((x - START_X) / CELL_WIDTH);
        // 边界限制
        if (col < 0) col = 0;
        if (col >= GRID_COLS) col = GRID_COLS - 1;
    }

    var plantWidthHalf = 40; // 假设植物图片宽度约为 80px，居中需要减去一半
    var finalLeft = -1;
    var finalTop = -1;

    if (row !== -1 && col !== -1) {
        // 计算网格中心的 left 值
        finalLeft = START_X + col * CELL_WIDTH + (CELL_WIDTH / 2) - plantWidthHalf;
        finalTop = ROW_TOPS[row]; 
    }

    return {
        left: finalLeft,
        top: finalTop,
        row: row,
        col: col,
        valid: (row !== -1)
    };
}

function createPlant(type, onclick){
    var plant = document.createElement("img"); 
    plant.type = type; 
    
    // 设置图片源
    if (type == 1) { plant.src = "images/SunFlower.gif"; } 
    else if (type == 2) { plant.src = "images/PeaShooter.gif"; } 
    else if (type == 3) { plant.src = "images/SnowPea.gif"; } 
    else if (type == 4) { plant.src = "images/Repeater.gif"; } 
    else if (type == 5) { plant.src = "images/CherryBomb.gif"; } 
    else if (type == 6) { plant.src = "images/Chomper.gif"; } 
    else if (type == 7) { plant.src = "images/TallNut.gif"; } 
    else if (type == 8) { plant.src = "images/Garlic.gif"; } 
    else if (type == 9) { plant.src = "images/Torchwood.gif"; } 
    else if (type == 10) { plant.src = "images/Spikeweed.gif"; } 
    else if (type == 11) { plant.src = "images/TwinSunflower.gif"; } 
    else if (type == 12) { plant.src = "images/SunFlowerG.gif"; } 
    else if (type == 13) { plant.src = "images/Squash.gif"; }

    plant.style.position = "absolute"; 
    plant.style.zIndex = 10; 
    plant.style.display = 'none'; // 初始隐藏
    
    document.oncontextmenu = function(event){
        event.preventDefault(); 
    }

    // --- 鼠标移动：预览位置 ---
    document.onmousemove = function(event){ 
        plant.style.display = 'block';

        var rect = container.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        var pos = snapToGrid(x, y);

        if (pos.valid) {
            plant.style.left = pos.left + "px";
            plant.style.top = pos.top + "px";
            
            // 视觉反馈：如果该格子已被占用，显示半透明
            if (gridState[pos.row][pos.col]) {
                plant.style.opacity = 0.5;
                plant.style.cursor = "no-drop";
            } else {
                plant.style.opacity = 1;
                plant.style.cursor = "pointer";
            }
        } else {
            // 无效区域
            plant.style.left = (x - 40) + "px";
            plant.style.top = (y - 40) + "px";
            plant.style.opacity = 0.5;
            plant.style.cursor = "no-drop";
        }
    }

    // --- 鼠标按下：确定放置 ---
    document.onmousedown = function(event){ 
        document.onmousemove = null; 
        document.onmousedown = null;

        var rect = container.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        
        var pos = snapToGrid(x, y);

        if (event.button == 2) { // 右键取消
            if(plant.parentNode) container.removeChild(plant); 
        } else if (event.button == 0) { // 左键放置
            
            if (!pos.valid) {
                if(plant.parentNode) container.removeChild(plant);
                return;
            }

            // 检查该格子是否已被占用
            if (gridState[pos.row][pos.col]) {
                if(plant.parentNode) container.removeChild(plant);
                return;
            }

            // 正式放置
            plant.style.left = pos.left + "px";
            plant.style.top = pos.top + "px";
            plant.style.opacity = 1; 
            plant.style.cursor = "default";
            plant.style.display = 'block';

            // 记录植物所在的行列信息
            plant.route = pos.row;
            plant.col = pos.col;

            // 更新网格状态
            gridState[pos.row][pos.col] = plant;
            
            // 调用回调函数
            if (onclick) onclick(plant);
        }
    }
    
    container.appendChild(plant); 
    return plant; 
}

function creatdBullet(plant, disappear){
    // 只有射手类植物才产生子弹
    if (plant.type != 2 && plant.type != 3 && plant.type != 4) {
        return null; 
    }

    var bullet = document.createElement("img");
    bullet.type = plant.type; 
    
    // 【关键整合】从 sprites.js 整合：必须给子弹赋予 route，否则碰撞检测失效
    bullet.route = plant.route; 
    
    if (bullet.type == 2) { 
        bullet.src = "images/Bullet.gif"; 
    } else if (bullet.type == 3) {
        bullet.src = "images/SnowBullet.gif"; 
    } else if (bullet.type == 4) {
        bullet.src = "images/Bullet.gif"; 
    }
    
    bullet.style.position = "absolute";
    bullet.style.left = plant.offsetLeft + 30 + "px"; 
    bullet.style.top = plant.offsetTop + "px"; 
    
    bullet.step = function(){ 
        if (bullet.src.endsWith("Bullet.gif") && 
            bullet.offsetLeft < 1000) { 
            bullet.style.left = bullet.offsetLeft + 5 + "px"; 
        } else { 
            if(disappear) disappear(bullet); 
        }
    };
    
    container.appendChild(bullet); 
    return bullet; 
}

function createZombie(id) {
    var zombie = document.createElement("img"); 
    zombie.id = id; 
    zombie.src = "images/Zombie.gif"; 
    zombie.blood = 10; 
    zombie.style.position = "absolute"; 
    
    // 随机生成路线 (0-4)
    zombie.route = parseInt(Math.random() * 5); 
    
    // 【保持原样】僵尸行坐标
    // 注意：这里僵尸在 150, 250... 而植物在 210, 310...
    // 视觉上会有垂直偏差，但这是为了配合背景图且不改僵尸参数的妥协结果
    zombie.style.top = [150, 250, 350, 450, 550][zombie.route] + "px"; 
    
    // 僵尸从右侧生成
    zombie.style.left = "850px"; 
    
    zombie.counter = 0; 
    zombie.step = function(){
        zombie.counter++; 
        if (zombie.counter < 5) {  
            return
        }
        zombie.counter = 0; 
        zombie.style.left = zombie.offsetLeft - 1 + "px"; 
        
        // 超出左边界移除
        if (zombie.offsetLeft < -100) {
             if(zombie.parentNode) container.removeChild(zombie);
        }
    }
    container.appendChild(zombie); 
    return zombie; 
}