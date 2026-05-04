// TODO: Replace with your new backend QR service
// This service needs to be updated to match your new backend API structure

export const qrService = {
    generate(body: any) {
        console.log('qrService.generate called with:', body);
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },
    status(sessionId: string) {
        console.log('qrService.status called with:', sessionId);
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    }
};
