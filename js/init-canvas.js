!function(){
    let $ = (element)=>{ return document.querySelector(element) }
    let canvas = $('#drawingBoard .draw')
    let context = canvas.getContext('2d')
    let CanvasBgcolor = '#f1f3f4'
    let data = {
        switch : false,
        sizeOpen : true,
        colorOpen: true,
        color: '#000000',
        eraseColor: CanvasBgcolor,
        line: 1,
        eraseLine: 20,
        page: {
            width : window.screen.availWidth,
            height : window.screen.availHeight
        },
        thickness:[2,4,8,16],
        paint:['#000000','#808080','#1a8cff','#ff1a40','#2bd965','#ffdd33'],
        background:CanvasBgcolor
    }

    /* 设置工具栏 */
    let tool = {
        init(){
            this.tool = (element)=>{ return $('#drawingBoard .tool .title').querySelector(element) }
            this.open = true
            this.pen = this.tool('.pen > svg')
            this.eraser = this.tool('.eraser > svg')
            this.size = this.tool('.size > svg')
            this.sizeList = $('#drawingBoard .option .size-list')
            this.colorList = this.tool('.color-list')
            this.delete = this.tool('.delete')
            this.download = this.tool('.download')
            this.color = $('#drawingBoard .tool .color svg')
            this.option = $('#drawingBoard .option')
            this.bindEvents()
        },
        bindEvents() {
            let current = this
            current.colorList.classList.add('active')
            this.pen.onclick = function () {
                data.switch = false
                current.eraser.classList.remove('active')
                current.pen.classList.add('active')
            }
            this.eraser.onclick = function () {
                data.switch = true
                current.pen.classList.remove('active')
                current.eraser.classList.add('active')
            }
            this.delete.onclick = function(){
                context.fillStyle = data.background;
                context.fillRect(0, 0, data.page.width, data.page.height);
            }
            this.download.onclick = function(){
                let url = canvas.toDataURL('image/jpg')
                let a = document.createElement('a')
                document.body.appendChild(a)
                a.href = url
                a.download = 'MyCanvas'
                a.target = '_blank'
                a.click()
            }
            this.color.onclick = function(e){
                data.colorOpen = !data.colorOpen
                if(data.colorOpen){
                    e.target.classList.add('active')
                    current.colorList.classList.add('active')
                }else {
                    e.target.classList.remove('active')
                    current.colorList.classList.remove('active')
                }
                
            }
            this.selectSize()
            this.selectColor()
        },
        selectSize(){
            let current = this
            function removeSizeClass(){
                current.option.classList.remove('active')
                current.size.classList.remove('active')
            }
            function addSizeClass() {
                current.option.classList.add('active')
                current.size.classList.add('active')
            }
            this.size.addEventListener('click', function(e) {
                data.sizeOpen = !(data.sizeOpen)
                if(data.sizeOpen){
                    removeSizeClass()
                }else {
                    addSizeClass()
                }
                e.stopPropagation()
            })
            document.addEventListener('click',function(){
                data.sizeOpen = true
                removeSizeClass()
            })
            this.sizeList.addEventListener('click', function(e){
                e.stopPropagation()
            })
            this.sizeList.querySelector('svg.close').addEventListener('click', function(){
                data.sizeOpen = true
                removeSizeClass()
            })
            let li = this.sizeList.querySelectorAll('ul > li')
            for(let i = 0; i < li.length; i++){
                li[i].querySelector('svg').style.width = (data.thickness[i]) + 'px'
                li[i].querySelector('svg').style.height = (data.thickness[i]) + 'px'
                li[i].querySelector('a').addEventListener('click', (e)=>{
                    data.line = data.thickness[i]/2
                    for(let i = 0; i < li.length; i++){
                        li[i].querySelector('a').classList.remove('active')
                    }
                    li[i].querySelector('a').classList.add('active')
                })
            }
        },
        selectColor(){
            let li = this.colorList.querySelectorAll('ul > li')
            for(let i = 0; i < li.length; i++){
                li[i].querySelector('a').style.backgroundColor = data.paint[i]
                li[i].querySelector('a').addEventListener('click',function(e){
                    data.color = data.paint[i]
                    for(let i = 0; i < li.length; i++){
                        li[i].querySelector('a').classList.remove('active')
                    }
                    li[i].querySelector('a').classList.add('active')
                })
            }
        }
    }
    
    /* 设置画布以及画线函数 */
    let drawContent = {
        init(){
            this.autoSetCanvasSize()
            this.listenToDevice()
        },
        background(){
            context.fillStyle = data.background;
            context.fillRect(0, 0, data.page.width, data.page.height);
        },
        autoSetCanvasSize(){
            let pageWidth = data.page.width
            let pageHeight = data.page.height
            canvas.width = pageWidth
            canvas.height = pageHeight
            this.background()
            let backups = context.getImageData(0, 0, canvas.width, canvas.height)
            window.onresize = function(){
                backups = context.getImageData(0, 0, canvas.width, canvas.height)
                canvas.width = pageWidth
                canvas.height = pageHeight
                context.putImageData(backups, 0, 0)
            }
        },
        drawDot(x, y){
            let color = data.switch ? data.eraseColor : data.color
            let width = data.switch ? data.eraseLine : data.line
            context.beginPath()
            context.fillStyle = color;
            context.arc(x, y, width, 0, Math.PI*2)
            context.fill()
        },
        drawLine(x1, y1, x2, y2){
            let color = data.switch ? data.eraseColor : data.color
            let width = data.switch ? data.eraseLine*2 : data.line*2
            context.beginPath();
            context.strokeStyle = color
            context.moveTo(x1, y1);
            context.lineWidth = width
            context.lineTo(x2, y2);
            context.stroke();
        },
        listenToDevice(){
            let current = this
            let using = false
            let lastPoint = { x:undefined, y:undefined }
            if(document.body.ontouchstart !== undefined){
                canvas.ontouchstart = function (e) {
                    using = true
                    let x = e.touches[0].clientX
                    let y = e.touches[0].clientY
                    current.drawDot(x, y)
                    lastPoint = { 'x': x, 'y': y }
                }
                canvas.ontouchmove = function (e) {
                    if (using) {
                        let x = e.touches[0].clientX
                        let y = e.touches[0].clientY
                        let newPoint = { 'x': x, 'y': y }
                        current.drawDot(x, y)
                        current.drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
                        lastPoint = newPoint
                    }
                }
                canvas.ontouchend = function () {
                    using = false
                }
            }else{
                canvas.onmousedown = function (e) {
                    using = true
                    let x = e.clientX
                    let y = e.clientY
                    current.drawDot(x, y)
                    lastPoint = { 'x': x, 'y': y }
                }
                canvas.onmousemove = function (e) {
                    if (using) {
                        let x = e.clientX
                        let y = e.clientY
                        let newPoint = { 'x': x, 'y': y }
                        current.drawDot(x, y)
                        current.drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
                        lastPoint = newPoint
                    }
                }
                canvas.onmouseup = function () {
                    using = false
                }
            }
            
        }
    }
    tool.init()
    drawContent.init()
}.call()