import { subscriptionApi } from '../api/subscription';
import { showError, showSuccess } from '../stores/toastStore';
import { updateSubscriptionStore } from '../stores/updateSubscriptionStore';
import { get } from 'svelte/store';
import { getUserSubscription, mergeSubscriptions } from '../utils/subscriptions';

interface CmsPlan {
  _ref: string;
  _type: string;
  _weak?: boolean;
  _key: string;
}

interface Plan {
  variationId: string;
  label: string;
  title: string;
  copy: string;
  price: string;
  totalPrice: string;
  interval: string;
  details: any;
  perks: string[];
  billingDetails?: string;
}

interface UserSubscription {
  square_subscription_variation_id: string;
}

class UpdateSubscriptionService {
  private isFetchingPlans = false;
  private isFetchingUserSub = false;

  async initSubscriptions(cmsPlans?: CmsPlan[]): Promise<Plan[]> {
    const currentState = get(updateSubscriptionStore);

    // If plans already exist, return them
    if (currentState.allPlans.length > 0) {
      return currentState.allPlans;
    }

    // Prevent race conditions
    if (this.isFetchingPlans) {
      return this.waitForPlansToLoad();
    }

    this.isFetchingPlans = true;
    updateSubscriptionStore.setLoading(true);

    try {
      // Check if we need to fetch from API
      const allSubscriptionResponse = await subscriptionApi.getAllPlans();
      console.log('allSubscriptionResponse', allSubscriptionResponse);

      if (!allSubscriptionResponse.success) {
        showError('Failed to fetch subscription plans. Please try again.');
        return [];
      }

      // Store the API response
      const apiData = allSubscriptionResponse.objects[0];

      // Merge with CMS plans if provided
      const allPlans = cmsPlans && apiData ? mergeSubscriptions(cmsPlans as any, apiData) : apiData?.variations || [];

      updateSubscriptionStore.setAllPlans(allPlans);
      updateSubscriptionStore.setSquarePlanId(apiData.id);
      return allPlans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      showError('Failed to load subscription plans');
      return [];
    } finally {
      this.isFetchingPlans = false;
      updateSubscriptionStore.setLoading(false);
    }
  }

  async getUserSubscription(): Promise<UserSubscription | null> {
    if (this.isFetchingUserSub) {
      return this.waitForUserSubToLoad();
    }

    this.isFetchingUserSub = true;

    try {
      const response = await subscriptionApi.getUserSubscriptions();
      console.log('response user subscriptions', response);

      if (!response.success) {
        showError('Failed to fetch user subscriptions. Please try again.');
        return null;
      }

      updateSubscriptionStore.setUserSubscription(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      showError('Failed to load user subscription');
      return null;
    } finally {
      this.isFetchingUserSub = false;
    }
  }

  async findUserPlan(): Promise<Plan | null> {
    const currentState = get(updateSubscriptionStore);
    const allPlans = currentState.allPlans.length > 0 ? currentState.allPlans : await this.initSubscriptions();

    if (!allPlans.length) {
      return null;
    }
    const userSub = currentState.userSubscription || (await this.getUserSubscription());
    // If user has a subscription, try to find the matching plan
    if (userSub) {
      const userPlan = getUserSubscription(allPlans, userSub.square_subscription_variation_id);
      if (userPlan) {
        updateSubscriptionStore.setUserPlan(userPlan);
        return userPlan;
      }
    }

    // If no user subscription or no matching plan found, return trial plan
    const trialPlan = allPlans.find((plan) => plan.variationId === '');
    if (trialPlan) {
      updateSubscriptionStore.setUserPlan(trialPlan);
      return trialPlan;
    }

    return null;
  }

  // Note: swapSubscription API method doesn't exist yet
  // This method is prepared for when the API is ready
  async swapSubscription(userSubscriptionId: string, newPlan: Plan, userCustomerId: string): Promise<boolean> {
    try {
      // TODO: Implement when API method is available
      // const response = await subscriptionApi.swapSubscription(newPlan.variationId);
      const response = await subscriptionApi.swapPlan(userSubscriptionId, newPlan.variationId, userCustomerId);

      console.log('swapSubscription response', response);
      if (!response.success) {
        throw new Error(response.message);
      }

      // For now, just update the user plan state
      updateSubscriptionStore.setUserPlan(newPlan);
      return response;
    } catch (error) {
      console.error('Error updating selection:', error);
      return false;
    }
  }

  private async waitForPlansToLoad(): Promise<Plan[]> {
    return new Promise((resolve) => {
      const unsubscribe = updateSubscriptionStore.subscribe((state) => {
        if (!state.isLoading && state.allPlans.length > 0) {
          unsubscribe();
          resolve(state.allPlans);
        }
      });
    });
  }

  private async waitForUserSubToLoad(): Promise<UserSubscription | null> {
    return new Promise((resolve) => {
      const unsubscribe = updateSubscriptionStore.subscribe((state) => {
        if (!this.isFetchingUserSub) {
          unsubscribe();
          resolve(state.userSubscription);
        }
      });
    });
  }

  getSpecificPlan(planId: string): Plan | null {
    const allPlans = get(updateSubscriptionStore).allPlans;
    return allPlans.find((plan) => plan.variationId === planId) || null;
  }

  // Helper methods
  isLoading(): boolean {
    const state = get(updateSubscriptionStore);
    return state.isLoading;
  }

  getUserPlan(): Plan | null {
    const state = get(updateSubscriptionStore);
    return state.userPlan;
  }

  getAllPlans(): Plan[] {
    const state = get(updateSubscriptionStore);
    return state.allPlans;
  }

  hasActiveSubscription(): boolean {
    const state = get(updateSubscriptionStore);
    return state.userSubscription !== null;
  }
}

export const updateSubscriptionService = new UpdateSubscriptionService();
