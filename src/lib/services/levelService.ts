class LevelService {
  private isFetching = false;

  async getLevels(): Promise<any> {
    const response = await fetch('/api/levels');
    return response.json();
  }
}

export const levelService = new LevelService();
