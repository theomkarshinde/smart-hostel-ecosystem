import api from './api';

const paymentService = {
    createOrder: async (amount, paymentType) => {
        try {
            const response = await api.post('/payments/create-order', {
                amount,
                paymentType
            });
            return response.data;
        } catch (error) {
            console.error("Error creating payment order:", error);
            throw error;
        }
    },
    
    confirmPayment: async (paymentData) => {
        try {
            const response = await api.post('/payments/confirm', paymentData);
            return response.data;
        } catch (error) {
            console.error("Error confirming payment:", error);
            throw error;
        }
    }
};

export default paymentService;
