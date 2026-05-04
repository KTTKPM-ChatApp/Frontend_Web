// TODO: Replace with your new backend friend service
// This service needs to be updated to match your new backend API structure

export const friendService = {
    getFriends() {
        console.log('getFriends called - implement for new backend');
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },

    getPendingRequests() {
        console.log('getPendingRequests called - implement for new backend');
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },

    getSentRequests() {
        console.log('getSentRequests called - implement for new backend');
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },

    sendRequest(body: any) {
        console.log('sendRequest called with:', body);
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },

    respondRequest(requestId: string, body: any) {
        console.log('respondRequest called with:', { requestId, body });
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },

    cancelRequest(requestId: string) {
        console.log('cancelRequest called with:', requestId);
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },

    removeFriend(friendId: string) {
        console.log('removeFriend called with:', friendId);
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },

    blockUser(userId: string) {
        console.log('blockUser called with:', userId);
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },

    unblockUser(userId: string) {
        console.log('unblockUser called with:', userId);
        return Promise.resolve({ statusCode: 501, ok: false, payload: { message: 'Not implemented - update for new backend' } });
    },
};