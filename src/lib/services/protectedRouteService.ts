import { authApi } from '$lib/api/auth';
import { profileService } from './profileService';

class ProtectedRouteService {
  private isFetching = false;
  public loggedIn = false;

  async checkAuthorization() {
    const isAuthenticated = await this.verifyUser();
    if (!isAuthenticated) {
      profileService.unverified();
      return false;
    }
    return true;
  }

  async verifyUser(): Promise<boolean> {
    try {
      const response = await authApi.verify();
      this.loggedIn = response.authenticated;
      return response.authenticated;
    } catch (error) {
      console.error('Error verifying user:', error);
      return false;
    }
  }
}

export const protectedRouteService = new ProtectedRouteService();
