import createCheckoutService from '@bigcommerce/checkout-sdk';

async function sendPaymentToServer(paymentData) {
    const response = await fetch('https://bigcommerce-server.onrender.com/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
    });

    return response.json();
}

(async function () {
    const checkoutService = createCheckoutService();

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // Load the BigCommerce checkout state
            const state = await checkoutService.loadCheckout();
            console.log('Checkout State:', state);

            const checkoutButton = document.querySelector('#checkout-payment-continue');
            if (checkoutButton) {
                checkoutButton.addEventListener('click', async (e) => {
                    e.preventDefault();

                    // Ensure the selected payment method is "Test Payment Provider"
                    const selectedPaymentMethod = state.data.getSelectedPaymentMethod();
                    if (selectedPaymentMethod && selectedPaymentMethod.id === 'manual') {
                        // Collect custom credit card data
                        const paymentData = {
                            cardNumber: document.querySelector('#card-number').value,
                            cardExp: document.querySelector('#card-expiry').value,
                            cardCvv: document.querySelector('#card-cvv').value,
                            amount: state.data.getOrder().grandTotal,
                            orderId: state.data.getOrder().id,
                        };

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
                    } else {
                        alert('Please select the Cardknox payment method.');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading checkout:', error);
        }
    });
})();
