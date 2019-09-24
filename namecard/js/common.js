var  regexps = {
    mobileOrTel: /(^(13[0-9]|19[0-9]|15[012356789]|17[0678]|18[0-9]|14[57])[0-9]{8}$)|(^(^0\d{2}-?\d{8}$)|(^0\d{3}-?\d{7,8}$)|(^\(0\d{2}\)-?\d{8}$)|(^\(0\d{3}\)-?\d{7}$)$)/,
}

var commonData = {
    photoWZ:{},
    footerWZ:{},
    fontSize1:12,
    name:'客户经理: ',
    phone:'联系方式: ',
    netwName:"网点名称: ",
    netwAddress:"网点地址: "
}

function isios() {
    var u = navigator.userAgent;
    return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
}

function initImg(src,callback) {
    ctx1.save();
    var img = new Image();
    img.onload = function () {
        c1.width=c1.width*ratio;
        c1.height = c1.height*ratio;
        ctx1.drawImage(img,0,0,c1.width,c1.height)
        ctx1.restore();
        callback()
    }
    img.src = src;
}

function getOrientation(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
        var view = new DataView(e.target.result);
        photosrc =reader.result;
        if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
        var length = view.byteLength, offset = 2;
        while (offset < length) {
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++)
                    if (view.getUint16(offset + (i * 12), little) == 0x0112)
                        return callback(view.getUint16(offset + (i * 12) + 8, little));
            }
            else if ((marker & 0xFF00) != 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
        return callback(-1);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
}

function zphoto(file) {
    setTimeout(function () {
        if(isios()){
            getOrientation(file, function(orientation) {
                ctx1.clearRect(0,0,c1.width,c1.height);
                console.log('upimg',upimg.width,upimg.height)
                var rat = c1.height/upimg.height;
                upimg.width = upimg.width*rat;
                if(orientation==-2||orientation==-1||orientation==1){
                    console.log('orientation',orientation)
                    ctx1.drawImage(upimg,0,0,upimg.width,c1.height)
                } else {
                    ctx1.save();
                    ctx1.translate(c1.width/2/ratio,c1.height/2/ratio);//设置画布上的(0,0)位置，也就是旋转的中心点
                    ctx1.rotate(180*Math.PI/180);
                    ctx1.drawImage(upimg,-c1.width/2,-c1.height/2 ,c1.width,c1.height);
                    ctx1.restore();
                }
            });
        } else {
            ctx1.drawImage(upimg,0,0,c1.width,c1.height)
        }
    },50)
}

function handlefile() {
    $('#upfile').on('change',function(){
        $('#divc1').hide();
        $("#c1").css({
            'display':'block'
        });
        $("#imgBtn").css({
            'visibility':'visible'
        })
        $("#addImg").css({
            'visibility':'hidden'
        })
        c1.style.width = PHOTOSIZE.width+'px';
        c1.style.height= PHOTOSIZE.height+'px';
        c1.width =PHOTOSIZE.width//*ratio;
        c1.height = PHOTOSIZE.height//*ratio;
        var that = this;
        upimgurl = getObjectURL(this.files[0]);
        upimg = new Image();
        upimg.src = upimgurl;
        upimg.onload = function(){
            ctx1.clearRect(0,0,c1.width,c1.height);
            zphoto(that.files[0]);
            var Stage = AlloyPaper.Stage, Bitmap = AlloyPaper.Bitmap,Loader=AlloyPaper.Loader;
            var stage = new Stage("#c1");
            stage.autoUpdate=false;
            var ld = new Loader();
            ld.loadRes2([
                { id: "test", src: upimgurl },
            ]);
            ld.complete(function () {
                var bmp = new Bitmap(ld.get("test"));
                bmp.originX = 0.5;
                bmp.originY = 0.5;
                bmp.x = stage.width / 2;
                bmp.y = stage.height / 2;
                stage.add(bmp);

                //stage.update();
                updateStage();
                var initScale = 1;
                new AlloyFinger(bmp, {
                    multipointStart: function () {
                        initScale = bmp.scaleX;
                    },
                    rotate: function (evt) {
                        bmp.rotation += evt.angle;
                        //stage.update();
                        updateStage();
                    },
                    pinch: function (evt) {
                        bmp.scaleX = bmp.scaleY = initScale * evt.scale;
                        //stage.update();
                        updateStage();
                    },
                    pressMove: function (evt) {
                        bmp.x += evt.deltaX;
                        bmp.y += evt.deltaY;
                        evt.preventDefault();
                        //stage.update();
                        updateStage();
                    }

                });
            });
            //将上传的图片画入canvas圆中
            function updateStage(){
                ctx1.beginPath();
                ctx1.save();
                stage.update();
                ctx1.restore();
            }
        };
    });
}
