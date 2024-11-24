// Since the API key and Cardknox interaction are handled on the server, we no longer need to call Cardknox directly from the client-side.
export function sendPaymentToServer(paymentData) {
    return fetch('https://bigcommerce-server.onrender.com/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
    }).then((response) => response.json());
}
