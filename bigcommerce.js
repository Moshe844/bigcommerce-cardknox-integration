import createCheckoutService from '@bigcommerce/checkout-sdk';

// Send payment data to the backend server
async function sendPaymentToServer(paymentData) {
    const response = await fetch('https://bigcommerce-server.onrender.com/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),  // Ensure data is properly formatted as JSON
    });

    return response.json();
}

(async function () {
    const checkoutService = createCheckoutService();

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // Load the BigCommerce checkout state (we're not using it directly anymore)
            const state = await checkoutService.loadCheckout();
            console.log('Checkout State:', state);

            const checkoutButton = document.querySelector('#checkout-payment-continue');
            if (checkoutButton) {
                checkoutButton.addEventListener('click', async (e) => {
                    e.preventDefault();

                    // Hard-code static payment data (similar to how the card data is hard-coded)
                    const paymentData = {
                        cardNumber: "4111 1111 1111 1111",  // Static test card number
                        cardExp: "12/25",  // Static expiration date (MM/YY)
                        cardCvv: "123",  // Static CVV code
                        amount: "10.00",  // Static amount (formatted correctly)
                        orderId: "12345",  // Static order ID
                    };

                    console.log('Sending Payment Data:', paymentData);  // Log data before sending

                    try {
                        // Send payment data to your backend server for processing via Cardknox
                        const result = await sendPaymentToServer(paymentData);

                        if (result.success) {
                            console.log('Payment Successful:', result.transactionId);

                            // Submit the order to BigCommerce
                            await checkoutService.submitOrder({
                                payment: {
                                    methodId: 'manual', // Use "manual" since we’re using Test Payment
                                    gatewayId: 'cardknox', // Custom identifier for Cardknox
                                },
                            });

                            alert('Order submitted successfully!');
                        } else {
                            console.error('Payment Failed:', result.message);
                            alert('Payment failed: ' + result.message);
                        }
                    } catch (error) {
                        console.error('Error during payment processing:', error);
                        alert('An error occurred. Please try again.');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading checkout:', error);
        }
    });
})();
