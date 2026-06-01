import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Id } from '../types/models';

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
  RoverDetail: { roverId: Id };
  RoverForm: { roverId?: Id } | undefined;
  SessionStatus: { sessionId: Id };
  NewOccurrence: { roverId: Id };
};
