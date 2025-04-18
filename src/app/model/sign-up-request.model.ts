export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword?: string; // Added for frontend form validation
}