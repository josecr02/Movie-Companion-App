import { icons } from "@/constants/icons";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const TabIcon = ({ focused, icon, title }: any) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
    <Image
      source={icon}
      style={{
        tintColor: focused ? '#FFD700' : '#A8B5DB',
        width: 24,
        height: 24,
        marginBottom: 2,
      }}
    />
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={{
        color: focused ? '#FFD700' : '#A8B5DB',
        // fontWeight: focused ? 'bold' : 'normal',
        fontSize: 13,
        textAlign: 'center',
        width: '100%',
        flexShrink: 1,
      }}
    >
      {title}
    </Text>
  </View>
);



import IndexScreen from './index';
import ProfileScreen from './profile';
import SavedScreen from './saved';
import SearchScreen from './search';

const Tab = createMaterialTopTabNavigator();

const _layout = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarShowIcon: true,
        tabBarIndicatorStyle: { backgroundColor: '#FFD700', height: 3 },
        tabBarStyle: {
          backgroundColor: '#0f0D23',
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: insets.top,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          minWidth: 0,
        },
        swipeEnabled: true,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={IndexScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.home} title="Home" />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.search} title="Search" />,
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.save} title="Saved" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.person} title="Profile" />,
        }}
      />
    </Tab.Navigator>
  );
};

export default _layout