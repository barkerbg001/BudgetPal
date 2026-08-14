export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  History: undefined;
  AddTransaction: undefined;
  Settings: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
