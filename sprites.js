var container = document.getElementById('container');
function createPlant(type, onclick){
    var plant = document.createElement("img"); //创建一个img元素
    plant.type = type; //为img元素添加一个type属性，值为传入的type参数
    plant.attack = []; //为img元素添加一个attack属性，值为一个空数组
    if (type == 1) { //根据传入的type参数设置img元素的src属性
        plant.src = "images/SunFlower.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 2) {
        plant.src = "images/PeaShooter.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 3) {
        plant.src = "images/SnowPea.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 4) {
        plant.src = "images/Repeater.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 5) {
        plant.src = "images/CherryBomb.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 6) {
        plant.src = "images/Chomper.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 7) {
        plant.src = "images/WallNut.gif";
        plant.blood = 3000; //为img元素添加一个blood属性，值为3000
    } else if (type == 8) {
        plant.src = "images/Garlic.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 9) {
        plant.src = "images/Torchwood.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 10) {
        plant.src = "images/Spikeweed.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 11) {
        plant.src = "images/TwinSunflower.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 12) {
        plant.src = "images/SunFlowerG.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    } else if (type == 13) {
        plant.src = "images/Squash.gif";
        plant.blood = 500; //为img元素添加一个blood属性，值为500
    }
    plant.style.position = "absolute"; //设置img元素的position属性为absolute
    document.oncontextmenu = function(event){
        event.preventDefault(); //阻止默认的右键菜单弹出
    }
    document.onmousemove = function(event){ //为document对象添加一个mousemove事件监听器，当鼠标移动时执行以下代码
        plant.style.left = event.clientX - 40 + "px"; //将img元素的left属性设置为鼠标的x坐标减去50像素
        plant.style.top = event.clientY - 40 + "px"; //将img元素的top属性设置为鼠标的y坐标减去50像素
    }
    document.onmousedown = function(event){ 
        document.onmousemove = null; //取消鼠标移动事件监听器
        document.onmousedown = null; //取消鼠标按下事件监听器

        if (event.button == 2) { //如果鼠标按下的是右键
            container.removeChild(plant); //将img元素从container元素中移除
        } else if (event.button == 0) { //如果鼠标按下的是左键
            var top = plant.offsetTop;
            if (top < 120 || top > 615){
                container.removeChild(plant); //如果img元素的top属性小于0或大于615，则将其从container元素中移除
            }
            // 处理边界 (原基准 + 120px)
            // 原: 90, 190, 290, 390, 490
            // 新: 210, 310, 410, 510, 610
            if (top >= 120 && top <= 215) {
                plant.style.top = '210px';
                plant.route = 0; //为img元素添加一个route属性，值为0
            } else if (top > 215 && top <= 315) {
                plant.route = 1;
                plant.style.top = '310px';
            } else if (top > 315 && top <= 415) {
                plant.route = 2;
                plant.style.top = '410px';
            } else if (top > 415 && top <= 515) {
                plant.route = 3;
                plant.style.top = '510px';
            } else if (top > 515 && top <= 615) {
                plant.route = 4;
                plant.style.top = '610px';
            }
            onclick(plant); //调用传入的onclick函数，并将img元素作为参数传入
        }
    }
    container.appendChild(plant); //将img元素添加到container元素中
    return plant; //返回创建的img元素
}
function creatdBullet(plant, disappear){
    var bullet = document.createElement("img");
    bullet.type = plant.type; //为子弹添加一个type属性，值为植物的type属性
    bullet.route = plant.route; //为子弹添加一个route属性，值为植物的route属性
    if (bullet.type == 2) { //根据子弹的type属性设置src属性
        bullet.src = "images/Bullet.gif"; //豌豆射手的子弹
    } else if (bullet.type == 3) {
        bullet.src = "images/SnowBullet.gif"; //冰豌豆射手的子弹
    } else if (bullet.type == 4) {
        bullet.src = "images/Bullet.gif"; //双发射手子弹
    }
    bullet.style.position = "absolute";
    bullet.style.left = plant.offsetLeft + 30 + "px"; //将子弹的left属性设置为植物的offsetLeft属性加30像素，使子弹从植物的前面发出
    bullet.style.top = plant.offsetTop + "px"; //将子弹的top属性设置为植物的offsetTop属性，使子弹从植物的中间发出
    bullet.step = function(){ //为子弹添加一个step方法，用于更新子弹的位置
        if (bullet.src.endsWith("Bullet.gif") && 
            bullet.offsetLeft < 1000) { //如果子弹的src属性以"Bullet.gif"结尾且未到达边界
            bullet.style.left = bullet.offsetLeft + 5 + "px"; //将子弹的left属性增加5像素，使子弹向右移动
        } else { //子弹碎片或到达边界
            disappear(bullet); //调用disappear函数，使子弹消失
        }
        
    };
    container.appendChild(bullet); //将子弹添加到container元素中
    return bullet; //返回创建的子弹精灵
}
function createZombie(id) {
    var zombie = document.createElement("img"); 
    zombie.id = id; 
    zombie.src = "images/Zombie.gif"; 
    zombie.blood = 10; 
    zombie.style.position = "absolute"; 
    zombie.route = parseInt(Math.random() * 5); 
    
    // 原基准数组: [30, 130, 230, 330, 430]
    // 下移120px后: [150, 250, 350, 450, 550]
    zombie.style.top = [150, 250, 350, 450, 550][zombie.route] + "px"; 
    
    zombie.style.left = "850px"; 
    zombie.counter = 0; 
    zombie.step = function(){
        zombie.counter++; 
        if (zombie.counter < 5) {  
            return
        }
        zombie.counter = 0; //每5次调用step方法，僵尸移动一次
        if((zombie.src.endsWith("Zombie.gif") && zombie.offsetLeft > -200)){ 
            zombie.style.left = zombie.offsetLeft - 1 + "px"; 
        } //如果僵尸的src属性以"Zombie.gif"结尾且未到达边界，或者僵尸的src属性为"images/ZombieLostHead.gif"，则将僵尸的left属性减少1像素，使僵尸向左移动
        
    }
    container.appendChild(zombie); 
    return zombie; 
}
function creatdHead(zombie){ //创建僵尸头部精灵
    var head = document.createElement("img");
    head.src = "images/ZombieHead.gif"; //设置头部精灵的图片来源
    head.style.position = "absolute"; //设置头部精灵的定位方式为绝对定位
    head.style.left = zombie.offsetLeft + 50 + "px"; //将头部精灵的left属性设置为僵尸的offsetLeft属性，使头部与僵尸保持水平对齐
    head.style.top = zombie.offsetTop + "px"; //将头部精灵的top属性设置为僵尸的offsetTop属性，使头部与僵尸保持垂直对齐
    container.appendChild(head); //将头部精灵添加到container元素中
    return head; //返回创建的头部精灵
}