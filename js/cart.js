function addToCart(buttonElement) {
    const name = buttonElement.getAttribute('data-name');
    const price = parseFloat(buttonElement.getAttribute('data-price'));
    const image = buttonElement.getAttribute('data-image');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name, price, image });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function displayCart() {
    let cartItems = document.getElementById('cartItems');
    let totalPrice = 0;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    /*
     * Clear existing items
     */
    cartItems.innerHTML = '';

    cart.forEach((item, index) => {
        let itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width:100px;"> 
            <span>${item.name} - $${item.price.toFixed(2)}</span>
            <button onclick="removeFromCart(${index})">Remove</button> 
        `;
        cartItems.appendChild(itemElement);

        totalPrice += item.price;
    });

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
    }

    document.getElementById('totalPrice').innerText = `$${totalPrice.toFixed(2)}`;
    updateCartCount();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = cart.length;
    document.getElementById('cartCount').textContent = count;
}

function validateAndCheckout() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardMM = document.getElementById('cardMM').value.trim();
    const cardYYYY = document.getElementById('cardYYYY').value.trim();
    const cardCVV = document.getElementById('cardCVV').value.trim();

    /*
     * Validate the phone number (example assumes the Polish format)
     */
    const phoneRegex = /^[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
        alert('Proszę podać poprawny numer telefonu.');
        return;
    }

    /*
     * Validate the address (more elaborate checks could be added here)
     */
    if (address.length < 5) {
        alert('Proszę podać poprawny adres.');
        return;
    }

    const cardNumberRegex = /^[0-9]{16}$/;
    if (!cardNumberRegex.test(cardNumber)) {
        alert('Proszę podać poprawny numer karty.');
        return;
    }

    /*
     * Validate the card expiry date
     */
    if (!(cardMM >= 1 && cardMM <= 12 && cardYYYY >= new Date().getFullYear())) {
        alert('Proszę podać poprawną datę ważności karty.');
        return;
    }

    const cvvRegex = /^[0-9]{3}$/;
    if (!cvvRegex.test(cardCVV)) {
        alert('Proszę podać poprawny kod CVV.');
        return;
    }

    alert('Zakupy zrealizowane. Więcej informacji na mailu/sms.');

    /*
     * Payment handling, sending data to the server, etc. can be added here.
     */

    localStorage.removeItem('cart');
    displayCart();
    updateCartCount();
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
});
