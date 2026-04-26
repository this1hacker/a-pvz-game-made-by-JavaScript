// sprites.js

var container = document.getElementById('container');

// --- 网格配置参数 (来自 untitled.js) ---
var GLOBAL_OFFSET_X = 50; 
var START_X = 45 + GLOBAL_OFFSET_X; // 95
var GRID_ROWS = 5;
var GRID_COLS = 9;
var CELL_WIDTH = 80;                
var CELL_HEIGHT = 100;              

// 【视觉修正】植物行坐标，确保与背景图草坪对齐
// 对应原逻辑: 210, 310, 410, 510, 610
var ROW_TOPS = [210, 310, 410, 510, 610];

// 用于记录网格占用状态 (防止重叠)
// 注意：这个变量需要在游戏初始化时重置，或者在这里定义全局变量
if (typeof window.gridState === 'undefined') {
    window.gridState = [];
    for (var i = 0; i < GRID_ROWS; i++) {
        window.gridState[i] = new Array(GRID_COLS).fill(null);
    }
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
    // 【新增】如果铲子激活，禁止创建植物
    if (typeof isShovelActive !== 'undefined' && isShovelActive) {
        return null;
    }

    var plant = document.createElement("img"); 
    plant.type = type; 
    plant.attack = []; 
    
    // 设置初始属性和图片
    if (type == 1) { 
        plant.src = "images/SunFlower.gif";
        plant.blood = 500; 
    } else if (type == 2) {
        plant.src = "images/PeaShooter.gif";
        plant.blood = 500; 
    } else if (type == 3) {
        plant.src = "images/SnowPea.gif";
        plant.blood = 500; 
    } else if (type == 4) {
        plant.src = "images/Repeater.gif";
        plant.blood = 500; 
    } else if (type == 5) {
        plant.src = "images/CherryBomb.gif";
        plant.blood = 500; 
    } else if (type == 6) {
        plant.src = "images/Chomper.gif";
        plant.blood = 500; 
    } else if (type == 7) {
        plant.src = "images/WallNut.gif";
        plant.blood = 3000; 
        plant.maxBlood = 3000;
        plant.damageStage = 0; 
    } else if (type == 8) {
        plant.src = "images/Garlic.gif";
        plant.blood = 500; 
    } else if (type == 9) {
        plant.src = "images/Torchwood.gif";
        plant.blood = 500; 
    } else if (type == 10) {
        plant.src = "images/Spikeweed.gif";
        plant.blood = 500; 
    } else if (type == 11) {
        plant.src = "images/TwinSunflower.gif";
        plant.blood = 500; 
     } else if (type == 12) {
        plant.src = "images/PotatoMineNotReady.gif";
        plant.blood = 500; 
        // 【修改】移除这里的 setTimeout，不在创建时开始计时
        plant.isReady = false; 
    } else if (type == 13) {
        plant.src = "images/Squash.gif";
        plant.blood = 500; 
    }

    plant.style.position = "absolute"; 
    plant.style.zIndex = 10; 
    plant.style.display = 'none'; // 初始隐藏，直到鼠标移动
    
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
            if (window.gridState[pos.row][pos.col]) {
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
            if (window.gridState[pos.row][pos.col]) {
                if(plant.parentNode) container.removeChild(plant);
                return;
            }

            // 【核心修改】在真正放置前，检查并扣除阳光
            // 注意：PLANT_PRICES 定义在 HTML 的全局作用域中，这里可以直接访问
            var price = PLANT_PRICES[type];
            if (typeof sunValue !== 'undefined' && typeof updateSunDisplay === 'function') {
                if (sunValue < price) {
                    // 阳光不足，移除预览植物，不执行放置
                    console.log("阳光不足，无法种植！需要: " + price);
                    if(plant.parentNode) container.removeChild(plant);
                    
                    // 可选：添加一个视觉提示，比如闪红屏幕或播放音效
                    return; 
                }
                
                // 阳光充足，正式扣除
                sunValue -= price;
                updateSunDisplay();
            }

            // 正式放置
            plant.style.left = pos.left + "px";
            plant.style.top = pos.top + "px";
            plant.style.opacity = 1; 
            plant.style.cursor = "default";
            plant.style.display = 'block';

            // 记录植物所在的行列信息
            plant.route = pos.row; // 用于子弹和僵尸的行判断
            plant.col = pos.col;   // 用于网格管理

            // 更新网格状态
            window.gridState[pos.row][pos.col] = plant;
            
            // 调用回调函数 (例如开始射击定时器)
            if (onclick) onclick(plant);
        }
    }
     // 【修改】向日葵产阳光逻辑
    if (type == 1 || type == 11) {
        // 统一间隔为 10秒 (10000ms)
        var interval = 10000;
        
        plant.sunTimer = setInterval(function() {
            // 检查植物是否还存在于页面中
            if (!plant.parentNode) {
                clearInterval(plant.sunTimer);
                return;
            }

            // 普通向日葵(type 1)产生 1 个阳光
            produceSunFromPlant(plant);

            // 双子向日葵(type 11)额外再产生 1 个阳光 (总共2个)
            if (type == 11) {
                // 稍微延迟 200ms 产生第二个阳光，避免完全重叠，视觉效果更好
                setTimeout(function() {
                    if (plant.parentNode) {
                        produceSunFromPlant(plant);
                    }
                }, 200);
            }

        }, interval);
    }

    container.appendChild(plant); 
    return plant; 
}

function creatdBullet(plant, disappear){
    var bullet = document.createElement("img");
    bullet.type = plant.type; 
    bullet.route = plant.route; // 继承植物的行号
    
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

// sprites.js

/**
 * 创建僵尸函数
 * @param {number} id - 僵尸ID
 * @param {function} gameover - 游戏结束回调
 * @param {number} forcedStatus - (可选) 强制指定的僵尸类型状态 (0-2:普通, 3-4:路障, 5:铁桶)。如果不传则随机。
 */
function createZombie(id, gameover, forcedStatus) { 
    var zombie = document.createElement("img"); 
    zombie.id = id; 
    
    // 【核心修改】根据传入的 forcedStatus 决定 status，否则随机
    if (forcedStatus !== undefined && forcedStatus !== null) {
        zombie.status = forcedStatus;
    } else {
        zombie.status = parseInt(Math.random() * 6); 
    }
    
    // 根据 status 设置初始图片和血量
    if ([0, 1, 2].indexOf(zombie.status) != -1){ 
        zombie.src = "images/Zombie.gif"; 
        zombie.blood = 10; 
    } else if ([3, 4].indexOf(zombie.status) != -1){  
        zombie.src = "images/ConeheadZombie.gif"; 
        zombie.blood = 25; 
    } else if (zombie.status == 5){ 
        zombie.src = "images/BucketheadZombie.gif"; 
        zombie.blood = 55; 
    }
    
    zombie.style.position = "absolute"; 
    
    // 行号依然随机，或者你也可以在这里传入 forcedRoute
    zombie.route = parseInt(Math.random() * 5); 
    
    // 【关键修改】初始化冰冻状态属性
    zombie.isFrozen = false;      
    zombie.freezeTimer = 0;       
    zombie.baseSpeed = 6;         // 记录基础速度，用于恢复
    
    // 【保持原样】僵尸行坐标
    zombie.style.top = [150, 250, 350, 450, 550][zombie.route] + "px"; 
    
    zombie.style.left = "850px"; 
    zombie.counter = 0; 
    zombie.speed = 6; // 初始移动间隔帧数
    
    zombie.step = function(){
        zombie.counter++; 
        // 注意：speed 越大，counter 需要积累越多才能移动，即速度越慢
        if (zombie.counter < zombie.speed) {
            return
        }
        zombie.counter = 0; 
        
        // 【修复】只有当僵尸处于“行走”状态时才移动
        var isWalking = zombie.src.endsWith("Zombie.gif") && 
                        !zombie.src.includes("Attack") && 
                        !zombie.src.includes("Die") && 
                        !zombie.src.includes("LostHead");

        if (isWalking && zombie.offsetLeft > -200) { 
            zombie.style.left = zombie.offsetLeft - 1 + "px"; 
        } 
        
        if (zombie.offsetLeft < -150){ 
            if(gameover) gameover();
        }
    }
    container.appendChild(zombie); 
    return zombie; 
}

function creatdHead(zombie){ 
    var head = document.createElement("img");
    head.src = "images/ZombieHead.gif"; 
    head.style.position = "absolute"; 
    head.style.left = zombie.offsetLeft + 50 + "px"; 
    head.style.top = zombie.offsetTop + "px"; 
    container.appendChild(head); 
    return head; 
}

// 【新增】处理植物产生阳光的函数
function produceSunFromPlant(plant) {
    var sun = document.createElement("img");
    sun.src = "images/Sun.gif";
    sun.className = "falling-sun"; // 复用样式
    
    // 初始位置：植物中心上方
    var startLeft = plant.offsetLeft + 10; // 微调居中
    var startTop = plant.offsetTop - 10;   // 植物上方
    
    sun.style.left = startLeft + "px";
    sun.style.top = startTop + "px";
    
    // 插入到 container 中
    container.appendChild(sun);

    // 1. 先向上浮动一小段距离，模拟“产出”
    setTimeout(function() {
        sun.style.top = (startTop - 40) + "px";
    }, 50);

    // 2. 短暂停留后，飞向阳光计数器
    setTimeout(function() {
        collectSunAutomatically(sun);
    }, 1000);
}

// 【新增】自动收集阳光（飞向计数器并加分）
function collectSunAutomatically(sunElement) {
    if (!sunElement.parentNode) return;

    // 计算目标位置（阳光计数器相对于 container 的坐标）
    // 注意：sunValue 和 updateSunDisplay 定义在 04-pvz.html 的全局作用域中
    // 这里我们需要计算飞行的终点坐标
    
    var halfWidth = window.innerWidth / 2;
    var halfHeight = window.innerHeight / 2;
    
    // 目标相对于视口 (Viewport) 的坐标 (与 HTML 中 fixed 定位一致)
    var targetViewportLeft = halfWidth - 450 + 10; 
    var targetViewportTop = halfHeight - 240 + 10; 

    // 获取 container 相对于视口的位置
    var containerRect = container.getBoundingClientRect();

    // 计算目标相对于 container 的坐标
    var finalLeft = targetViewportLeft - containerRect.left;
    var finalTop = targetViewportTop - containerRect.top;

    // 应用飞行动画类
    sunElement.classList.add('sun-collecting');
    sunElement.style.left = finalLeft + "px";
    sunElement.style.top = finalTop + "px";

    // 动画结束后增加阳光值并移除元素
    setTimeout(function() {
        // 增加阳光 (访问全局变量)
        if (typeof sunValue !== 'undefined') {
            sunValue += 25;
            if (typeof updateSunDisplay === 'function') {
                updateSunDisplay();
            }
        }
        
        // 移除元素
        if (sunElement.parentNode) {
            sunElement.parentNode.removeChild(sunElement);
        }
    }, 500); // 对应 CSS transition 时间
}
/**
 * 【新增】移除植物核心逻辑
 */
/**
 * 【新增】移除植物核心逻辑
 */
function removePlant(plant) {
    if (!plant) return;

    // 1. 清除定时器
    if (plant.timer) clearInterval(plant.timer); 
    if (plant.sunTimer) clearInterval(plant.sunTimer); 

    // 2. 从 plants 数组中移除
    var index = plants.indexOf(plant);
    if (index > -1) {
        plants.splice(index, 1);
    }

    // 3. 从网格状态中移除
    if (plant.route !== undefined && plant.col !== undefined) {
        window.gridState[plant.route][plant.col] = null;
    }

    // 4. 处理正在攻击该植物的僵尸
    if (plant.attack && plant.attack.length > 0) {
        for (var zombie of plant.attack) {
            if (zombie && zombie.blood > 0) {
                if (zombie.blood <= 10) {
                    zombie.src = "images/Zombie.gif";
                } else if (zombie.status == 5) {
                    zombie.src = "images/BucketheadZombie.gif";
                } else if (zombie.status == 3 || zombie.status == 4) {
                    zombie.src = "images/ConeheadZombie.gif";
                }
                
                if (!zombie.isFrozen) {
                    zombie.speed = zombie.baseSpeed;
                    zombie.style.filter = "none";
                }
            }
        }
    }

    // 5. 从 DOM 中移除
    if (plant.parentNode) {
        container.removeChild(plant);
    }
}

/**
 * 【新增】初始化铲子交互逻辑
 */
function initShovelInteraction() {
    var shovel = document.getElementById('shovel');
    if (!shovel) return;

    // 保存铲子的初始样式，以便恢复
    var initialRight = shovel.style.right;
    var initialTop = shovel.style.top;
    var initialLeft = shovel.style.left;
    var initialPosition = shovel.style.position;

    // 1. 铲子跟随鼠标移动
    document.addEventListener('mousemove', function(event) {
        if (typeof isShovelActive !== 'undefined' && isShovelActive) {
            var rect = container.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            
            // 只有鼠标在容器内时才跟随
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                shovel.style.position = 'absolute';
                shovel.style.left = (x - 30) + 'px'; 
                shovel.style.top = (y - 30) + 'px';
                shovel.style.right = 'auto'; 
                shovel.style.zIndex = 100; 
                
                // 【关键修复】让铲子不阻挡鼠标点击事件，这样才能点到下面的植物
                shovel.style.pointerEvents = 'none'; 
            }
        } else {
            // 如果铲子未激活，确保它可以被点击（用于关闭铲子模式）
            shovel.style.pointerEvents = 'auto';
        }
    });

    // 2. 点击铲除植物 或 关闭铲子
    document.addEventListener('click', function(event) {
        // 如果铲子没激活，直接返回
        if (typeof isShovelActive === 'undefined' || !isShovelActive) {
            return;
        }

        var target = event.target;

        // 情况 A: 点击到了植物 -> 铲除
        var clickedPlant = null;
        for (var i = 0; i < plants.length; i++) {
            if (plants[i] === target) {
                clickedPlant = plants[i];
                break;
            }
        }

        if (clickedPlant) {
            removePlant(clickedPlant);
            // 铲除后，通常游戏里铲子会保持激活状态以便连续铲除。
            // 如果你希望铲除一次就自动关闭，可以在这里调用 toggleShovel();
        } 
        // 情况 B: 点击到了空白处 或 铲子本身 -> 关闭铲子模式
        else {
            // 如果点击的不是植物，我们选择关闭铲子模式，防止卡死
            // 注意：因为铲子设置了 pointer-events: none，点击铲子位置实际上会穿透到背景或空白处
            toggleShovel();
        }
    }, true); 
}