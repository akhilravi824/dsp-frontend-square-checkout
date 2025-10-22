import { progressApi } from '$lib/api/progress';
import { levelsStore } from '$lib/stores/levels';
import { calculateOverallStats, mergeAllLevelsData } from '$lib/utils/progress';

class ProgressService {
  public progressLoading = false;

  async getProgress(userProfile, data) {
    try {
      const response = await progressApi.getProgress();
      const apiData = response.data;
      const subscription_id = userProfile?.square_subscription_id;
      const lockRest = subscription_id === null && apiData.freeTries === 0 ? true : false;
      const units = subscription_id !== null ? userProfile?.signup_data.units : '';
      const updatedMergedData = mergeAllLevelsData(data, apiData, units, lockRest);
      const updateStoreData = {
        ...apiData,
        levels: updatedMergedData
      };

      const overallStats = calculateOverallStats(updateStoreData);
      levelsStore.set({
        ...updateStoreData,
        overallStats: overallStats
      });
    } catch (error) {
      console.error('Error getting progress data:', error);
    } finally {
      this.progressLoading = false;
    }
  }
}

export const progressService = new ProgressService();
