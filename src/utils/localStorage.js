/**
 * Utility functions for localStorage management
 */

/**
 * Clean up old rocks/tasks data from localStorage
 * Only keep essential quarter info and auth data
 */
export const cleanupOldStorageData = () => {
    try {
        // Remove old data that should now be fetched dynamically
        const keysToRemove = [
            'finalResponseData',
            'rocks', 
            'tasks'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('Cleaned up old localStorage data:', keysToRemove);
    } catch (error) {
        console.error('Error cleaning up localStorage:', error);
    }
};

/**
 * Get current quarter info from localStorage
 */
export const getCurrentQuarterInfo = () => {
    try {
        return {
            quarterId: localStorage.getItem('currentQuarterId'),
            quarterName: localStorage.getItem('currentQuarterName'),
            quarterYear: localStorage.getItem('currentQuarterYear'),
            quarterTitle: localStorage.getItem('currentQuarterTitle')
        };
    } catch (error) {
        console.error('Error getting quarter info:', error);
        return {};
    }
};

/**
 * Check if we have a valid quarter selected
 */
export const hasValidQuarter = () => {
    const { quarterId } = getCurrentQuarterInfo();
    return !!quarterId;
};
