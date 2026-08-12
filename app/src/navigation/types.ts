export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  AddTransaction: undefined;
  Settings: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
