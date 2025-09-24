// src/navigationTypes.ts

export type RootStackParamList = {
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: { email: string };
  Login: undefined;
  Home: undefined;
  Config: undefined;
  ChangePassword: undefined;
  Verify2FA: { userId: number; userEmail: string; userName: string };
  VerifyEmailScreen: { email: string };
};
