import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, USER_ROLES } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import TasksScreen from '../screens/TasksScreen';
import WorkersScreen from '../screens/WorkersScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import MaterialsScreen from '../screens/MaterialsScreen';
import MaterialDetailsScreen from '../screens/MaterialDetailsScreen';
import BulkMaterialEntryScreen from '../screens/BulkMaterialEntryScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Other screens...
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import WorkerDetailsScreen from '../screens/WorkerDetailsScreen';
import MilestonesScreen from '../screens/MilestonesScreen';
import MilestoneDetailsScreen from '../screens/MilestoneDetailsScreen';
import AddProjectScreen from '../screens/AddProjectScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import AddWorkerScreen from '../screens/AddWorkerScreen';
import AddMilestoneScreen from '../screens/AddMilestoneScreen';
import AssignWorkerScreen from '../screens/AssignWorkerScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import QRDisplayScreen from '../screens/QRDisplayScreen';
import AttendanceDetailsScreen from '../screens/AttendanceDetailsScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ role }) {
    const isAdmin = role === USER_ROLES.ADMIN;
    const isProjectManager = role === USER_ROLES.PROJECT_MANAGER;
    const isSupervisor = role === USER_ROLES.SUPERVISOR;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,

                tabBarActiveTintColor: COLORS.primary,

                tabBarIcon: ({ color, size }) => {
                    let icon = 'home';

                    switch (route.name) {
                        case 'Home':
                            icon = 'grid';
                            break;

                        case 'Projects':
                            icon = 'briefcase';
                            break;

                        case 'Tasks':
                            icon = 'clipboard';
                            break;

                        case 'Workers':
                            icon = 'people';
                            break;

                        case 'Attendance':
                            icon = 'calendar';
                            break;

                        case 'Analytics':
                            icon = 'stats-chart';
                            break;

                        case 'Materials':
                            icon = 'cube';
                            break;

                        case 'Profile':
                            icon = 'person';
                            break;
                    }

                    return (
                        <Ionicons
                            name={icon}
                            size={size}
                            color={color}
                        />
                    );
                },
            })}
        >
            {(isAdmin || isProjectManager || isSupervisor) && <Tab.Screen name="Home" component={DashboardScreen} />}
            {(isAdmin || isProjectManager) && <Tab.Screen name="Projects" component={ProjectsScreen} />}
            {(isAdmin || isSupervisor) && <Tab.Screen name="Tasks" component={TasksScreen} />}
            {(isAdmin || isSupervisor) && <Tab.Screen name="Workers" component={WorkersScreen} />}
            {(isAdmin || isSupervisor) && <Tab.Screen name="Attendance" component={AttendanceScreen} />}
            {(isAdmin || isProjectManager || isSupervisor) && <Tab.Screen name="Analytics" component={AnalyticsScreen} />}
            {(isAdmin || isProjectManager || isSupervisor) && <Tab.Screen name="Materials" component={MaterialsScreen} />}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

function WorkerTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarIcon: ({ color, size }) => {
                    const icon = route.name === 'Profile' ? 'person' : 'qr-code';
                    return <Ionicons name={icon} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Scan"
                component={QRScannerScreen}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
            />
        </Tab.Navigator>
    );
}
function LoadingStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="Splash"
                component={SplashScreen}
            />
        </Stack.Navigator>
    );
}

function AuthStack({ initialRouteName = 'SignUp' }) {
    return (
        <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="SignIn"
                component={SignInScreen}
            />

            <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
            />
        </Stack.Navigator>
    );
}

function AppStackWithRole() {
    const { role } = useAuth();
    
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="MainTabs"
            >
                {() => <MainTabs role={role} />}
            </Stack.Screen>

            <Stack.Screen
                name="ProjectDetails"
                component={ProjectDetailsScreen}
            />

            <Stack.Screen
                name="TaskDetails"
                component={TaskDetailsScreen}
            />

            <Stack.Screen
                name="WorkerDetails"
                component={WorkerDetailsScreen}
            />

            <Stack.Screen
                name="Milestones"
                component={MilestonesScreen}
            />

            <Stack.Screen
                name="MilestoneDetails"
                component={MilestoneDetailsScreen}
            />

            <Stack.Screen
                name="AddProject"
                component={AddProjectScreen}
            />

            <Stack.Screen
                name="AddTask"
                component={AddTaskScreen}
            />

            <Stack.Screen
                name="AddWorker"
                component={AddWorkerScreen}
            />

            <Stack.Screen
                name="AddMilestone"
                component={AddMilestoneScreen}
            />

            <Stack.Screen
                name="AssignWorker"
                component={AssignWorkerScreen}
            />

            <Stack.Screen
                name="QRScanner"
                component={QRScannerScreen}
            />

            <Stack.Screen
                name="QRDisplay"
                component={QRDisplayScreen}
            />

            <Stack.Screen
                name="AttendanceDetails"
                component={AttendanceDetailsScreen}
            />

            <Stack.Screen
                name="AttendanceHistory"
                component={AttendanceHistoryScreen}
            />

            <Stack.Screen
                name="MaterialDetails"
                component={MaterialDetailsScreen}
            />

            <Stack.Screen
                name="BulkMaterialEntry"
                component={BulkMaterialEntryScreen}
            />

        
        </Stack.Navigator>
    );
}

function AdminNavigator() {
    return <AppStackWithRole />;
}

function ProjectManagerNavigator() {
    return <AppStackWithRole />;
}

function SupervisorNavigator() {
    return <AppStackWithRole />;
}

function WorkerNavigator() {
    return <WorkerTabs />;
}

export default function AppNavigator() {

    const { appLoading, authenticated, role, token, authStartScreen } = useAuth();

    console.log("Navigator State");

    console.log({
        appLoading,
        authenticated,
        role,
    });

    if (appLoading) {

        return <LoadingStack />;

    }

    if (!authenticated || !token) {

        return <AuthStack initialRouteName={authStartScreen} />;

    }

    if (role === USER_ROLES.ADMIN) {
        return <AdminNavigator />;
    }

    if (role === USER_ROLES.PROJECT_MANAGER) {
        return <ProjectManagerNavigator />;
    }

    if (role === USER_ROLES.SUPERVISOR) {
        return <SupervisorNavigator />;
    }

    if (role === USER_ROLES.WORKER) {
        return <WorkerNavigator />;
    }

    return <AuthStack initialRouteName="SignIn" />;
}
