// src/navigationTypes.ts

export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  Verify: undefined;
  verifyEmail: { email: string };
  Home: undefined;
  TecnicoDashboard: undefined;
  Config: undefined;
  ChangePassword: undefined;
  TwoFactorAuth: undefined;
  Chat: undefined;
  HistorialPorArea: undefined;
};
