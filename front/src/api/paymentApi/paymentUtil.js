import PortOne from "@portone/browser-sdk/v2";


export const requestPayment = async (orderData) => {
    
    try {
        return await PortOne.requestPayment({
            storeId: "store-23f6498b-4582-4677-8d04-a3da559439f0", // 고객사 storeId로 변경해주세요.
            channelKey: (orderData.channelKey), // 콘솔 결제 연동 화면에서 채널 연동 시 생성된 채널 키를 입력해주세요.
            paymentId: `${crypto.randomUUID()}`,
            orderName: (orderData.orderName),
            totalAmount: (Number(orderData.totalAmount)),
            currency: "KRW",
            payMethod: (orderData.payMethod),
            customer: {
                fullName: (orderData.customerName),
                phoneNumber: (orderData.customerPhone),
                email: (orderData.customerEmail),
            },
        });
    }catch(error){
        console.error("결제 요청 실패: " ,error)
        throw error;
    }
 
}