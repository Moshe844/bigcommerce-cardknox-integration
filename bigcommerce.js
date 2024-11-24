import { sendPaymentToServer } from './cardknox.js';
import  createCheckoutService  from '@bigcommerce/script-loader';

(async function () {
    const checkoutService = createCheckoutService();

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // Load the checkout page
            const state = await checkoutService.loadCheckout();
            console.log('Checkout State:', state);

            // Listen for the payment button click
            const checkoutButton = document.querySelector('#checkout-payment-continue');

            if (checkoutButton) {
                checkoutButton.addEventListener('click', async (e) => {
                    e.preventDefault();

                    // Collect payment data from BigCommerce's form
                    const paymentData = {
                        cardNumber: document.querySelector('#card-number').value,
                        cardExp: document.querySelector('#card-expiry').value,
                        cardCvv: document.querySelector('#card-cvv').value,
                        amount: state.data.getOrder().grandTotal, // Get the total from BigCommerce
                    };

                    try {
                        // Send payment to the server
                        const result = await sendPaymentToServer(paymentData);

                        if (result.success) {
                            console.log('Payment Successful:', result.transactionId);
                            alert('Payment successful! Transaction ID: ' + result.transactionId);

                            // Submit the BigCommerce order
                            await checkoutService.submitOrder({ payment: { methodId: 'custom', gatewayId: 'cardknox' } });
                        } else {
                            console.error('Payment Failed:', result.message);
                            alert('Payment failed: ' + result.message);
                        }
                    } catch (error) {
                        console.error('Error sending payment to server:', error);
                        alert('An error occurred while processing your payment. Please try again.');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading checkout:', error);
        }
    });
})();
