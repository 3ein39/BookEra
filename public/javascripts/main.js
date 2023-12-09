document.getElementById('cart-icon').addEventListener('click', function() {
    document.getElementById('cart-pane').classList.toggle('open');
});

// close it when ESC is pressed or when the user clicks outside of the cart pane
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 27) {
        document.getElementById('cart-pane').classList.remove('open');
    }
});
document.addEventListener('click', function(e) {
    if (!document.getElementById('cart-pane').contains(e.target) && !document.getElementById('cart-icon').contains(e.target)) {
        document.getElementById('cart-pane').classList.remove('open');
    }
});
