
var items = document.getElementsByClassName("middle")
console.log(items)
for(var i=0; i < items.length; i++){
    items[i].onclick = function(e){
       var pathToURL = this.getAttribute("dataUrl")
       window.location.href = "../" + pathToURL
    }
}