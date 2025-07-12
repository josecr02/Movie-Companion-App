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
import InTheatresScreen from './intheatres';
import MatchScreen from './match';
import ProfileScreen from './profile';
import SavedScreen from './saved';
import SearchScreen from './search';
import SharedScreen from './shared';
const Tab = createMaterialTopTabNavigator();

const Layout = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarShowIcon: true,
        tabBarIndicatorStyle: { backgroundColor: '#FFD700', height: 3 },
        tabBarStyle: {
          backgroundColor: '#0D1B2A',
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
        name="InTheatres"
        component={InTheatresScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.tickets} title="Theaters" />,
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
        name="Shared"
        component={SharedScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.person} title="Shared" />,
        }}
      />
      <Tab.Screen
        name="Match"
        component={MatchScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.tickets} title="Match" />,
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

export default Layout;