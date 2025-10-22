interface SignUpSuccessResponse {
  success: true;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      created_at: string;
    };
  };
}
