import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Rovers: undefined;
  History: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  RoverDetail: { roverId: number };
  RoverForm: { roverId?: number } | undefined;
  SessionStatus: { sessionId: number };
  NewOccurrence: { roverId: number };
};
