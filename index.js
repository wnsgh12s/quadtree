let canvas = document.querySelector('canvas')
let ctx = canvas.getContext('2d')

canvas.width = innerWidth;
canvas.height = innerHeight

class Quadtree {
  constructor(boundary,maxObject,maxLevel,level){
    this.boundary = boundary;
    this.maxObject = maxObject || 10;
    this.maxLevel = maxLevel || 4;
    this.level = level || 0; 
    this.nodes = []
    this.objects =[]
  }

  split() {
        var nextLevel   = this.level + 1,
        subWidth    = this.boundary.w/2,
        subHeight   = this.boundary.h/2,
        x           = this.boundary.x,
        y           = this.boundary.y;        
 
    //top right node
    this.nodes[0] = new Quadtree({
        x       : x + subWidth, 
        y       : y, 
        w   : subWidth, 
        h  : subHeight
    }, this.max_objects, this.max_levels, nextLevel);
    
    //top left node
    this.nodes[1] = new Quadtree({
        x       : x, 
        y       : y, 
        w   : subWidth, 
        h  : subHeight
    }, this.max_objects, this.max_levels, nextLevel);
    
    //bottom left node
    this.nodes[2] = new Quadtree({
      x       : x + subWidth, 
      y       : y + subHeight, 
      w   : subWidth, 
      h   : subHeight
  }, this.max_objects, this.max_levels, nextLevel);

    this.nodes[3] = new Quadtree({
        x       : x, 
        y       : y + subHeight, 
        w   : subWidth, 
        h  : subHeight
    }, this.max_objects, this.max_levels, nextLevel);
    
    //bottom right node
    
};

  getIndex(pRect){
    
    let indexes = []

    let verticalPoint = this.boundary.x + this.boundary.w / 2,
        horizonPoint = this.boundary.y + this.boundary.h / 2


    let startTop = pRect.y < horizonPoint,
        endBottom = pRect.y + pRect.h > horizonPoint,
        startLeft = pRect.x  < verticalPoint,
        endRight = pRect.x + pRect.w > verticalPoint
     
    //오른쪽 상단
    
    if(startTop && endRight){
      indexes.push(0)
    }
    //왼쪽상단
    
    if(startTop && startLeft){
      indexes.push(1)
    }
    
    //오른쪽 하단
    
    if(endBottom && endRight){
      indexes.push(2)
    }
    
    //왼쪽 하단
    
    if(endBottom && startLeft){
      indexes.push(3)
    }

    return indexes;
  }

  insert(pRect){ 
    let indexes
    // this.nodes.lenght === 0이면 
    // if(this.nodes.length) === false
    // 그렇기 때문에 아래 조건문은 하위노드가 존재한다면 할일
    if(this.nodes.length){
      //사각형이 존재하는 노드의 위치를 getIndex함수로 받아옴
      indexes = this.getIndex(pRect)
      //사각형이 걸쳐 있을수 있기 때문에 위치를 루프를 돌고 모든 노드를 하위노드에 다시 insert함
      for(let i = 0; i < indexes.length; i++){
        this.nodes[indexes[i]].insert(pRect)
      }
      return;
    }
    //하위노드가 존재하지 않는다면?  this.objects에 인자로 받아온 pRect를 push
    this.objects.push(pRect)
    //오브젝트의 길이가 maxObject보다 크거나 split() 메서드로 인해 하위노드의 level이 maxLevel을 넘어가면 할일
    if(this.objects.length > this.maxObject && this.level < this.maxLevel){
      // 하위 노드가 존재하지 않는다면 하위노드를 추가
      if(!this.nodes.length){
        this.split()
        //모든 오브젝트를 루프를 돌아 하위노드에 추가
        for(let i = 0; i < this.objects.length; i++){
          indexes = this.getIndex(this.objects[i])
          for(let k = 0; k < indexes.length; k++){
            this.nodes[indexes[k]].insert(this.objects[i])
          }

        }
        // 오브젝트를 하위 노드에 추가했다면 비워준다 
        this.objects = [];
      }
    }
  }

  retrieve(pRect){
    let indexex = this.getIndex(pRect),
        returnObjects = this.objects

    //하위노드가 있다면
    if(this.nodes.length){
      for(let i =0; i< indexex.length; i++){
        returnObjects = returnObjects.concat(this.nodes[indexex[i]].retrieve(pRect));
      }
    }
    
        //중복을 제거하는 함수 
        returnObjects = returnObjects.filter(function(item, index) {
          return returnObjects.indexOf(item) >= index;
      });
      return returnObjects;
  }
  clear(){
        
    this.objects = [];
 
    for(var i=0; i < this.nodes.length; i++) {
        if(this.nodes.length) {
            this.nodes[i].clear();
          }
    }

    this.nodes = [];
  };
  
  show(){
    ctx.strokeStyle='red'
    ctx.strokeRect(this.boundary.x,this.boundary.y,this.boundary.w,this.boundary.h)
    this.objects.forEach(e=>{
      ctx.strokeStyle='red'
      ctx.strokeRect(e.x,e.y,e.w,e.h)
    })
    if(this.nodes.length){
      this.nodes.forEach(e=>{
        e.show()
      })
    }
  }

  fill(){

  }
}

class Rectangule {
  constructor(x,y,w,h,vx,vy){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = vx;
    this.vy = vy;
  }

  move(){
    this.x += this.vx
    this.y += this.vy
    this.y += this.vy
  }
}

//범위안의 랜덤한 숫자를 뱉는 함수
function random(min,max){
  return Math.floor(Math.random()*(max-min)+min) 
}
// 쿼드트리 인스턴스 생성
let mytree = new Quadtree(
  {
    x:0,
    y:0,
    w:canvas.width,
    h:canvas.height
  }
)

function collision(rec1,rec2){
  return(
    rec1.x + rec1.w > rec2.x &&
    rec1.x < rec2.x + rec2.w &&
    rec1.y + rec1.h > rec2.y &&
    rec1.y < rec2.y + rec2.h 
    )
}

// 클릭하면 할 일
let box = []
for(let i=0;i<100;i++){
  let object = new Rectangule(random(0,canvas.width-10),random(0,canvas.height-10),10,10,1,1)
  box.push(object)
}

function animate(){
  requestAnimationFrame(animate)
  ctx.clearRect(0,0,canvas.width,canvas.height)
  mytree.clear()
  box.forEach(e=>{
    mytree.insert(e)
    e.move()
    if(e.x + e.w > canvas.width){
      e.vx = -e.vx
    }
    if(e.h + e.y > canvas.height){
      e.vy = -e.vy
    }
    if(e.y < 0){
      e.vy = -e.vy
    }
    if(e.x < 0 ){
      e.vx = -e.vx
    }
    let box2 = mytree.retrieve(e)
    for(let j = 0; j < box2.length; j++){
      box2[j]
        if(
          e !== box2[j] &&
          e.x < box2[j].x + box2[j].w &&
          e.x + e.w > box2[j].x &&
          e.y < box2[j].y + box2[j].h &&
          e.y + e.h > box2[j].y 
          ){
          box2[j].vx = -box2[j].vx;
          box2[j].vy = -box2[j].vy
          e.vx = -e.vx;
          e.vy = -e.vy
          e.x = e.x + 1
        }
        
    }
    
  })
  mytree.show()
  
}
animate()
