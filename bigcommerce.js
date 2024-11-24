import createCheckoutService from '@bigcommerce/checkout-sdk';

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

                    // Ensure the selected payment method is "Credit Card"
                    const selectedPaymentMethod = state.data.getSelectedPaymentMethod();
                    if (selectedPaymentMethod && selectedPaymentMethod.id === 'credit_card') {
                        // Collect payment data from the credit card form
                        const paymentData = {
                            cardNumber: document.querySelector('#cc-number').value,
                            cardExp: document.querySelector('#cc-exp').value,
                            cardCvv: document.querySelector('#cc-cvv').value,
                            amount: state.data.getOrder().grandTotal,
                            orderId: state.data.getOrder().id,
                        };

                        try {
                            // Send payment data to your backend server for processing via Cardknox
                            const response = await fetch('https://bigcommerce-server.onrender.com/api/payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(paymentData),
                            });

                            const result = await response.json();

                            if (result.success) {
                                console.log('Payment Successful:', result.transactionId);

                                // Submit the order to BigCommerce
                                await checkoutService.submitOrder({
                                    payment: {
                                        methodId: 'credit_card',
                                        gatewayId: 'custom_gateway', // Optional custom identifier for the gateway
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
                        alert('Please select the Credit Card payment method.');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading checkout:', error);
        }
    });
})();
