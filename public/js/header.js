function myFunction() {
    var x = document.getElementById("main-menu");
    if (x.className === "menu") {
        x.className += " responsive";
    } else {
        x.className = "menu";
    }
}