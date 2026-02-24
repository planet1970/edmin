import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import SplashManager from './pages/SplashManager';
import OnboardingManager from './pages/OnboardingManager';
import HomeScreenManager from './pages/HomeScreenManager';
import WebHomeScreenManager from './pages/WebHomeScreenManager';
import CategoriesManager from './pages/CategoriesManager';
import DatabaseManager from './pages/DatabaseManager';
import PageContentManager from './pages/PageContentManager';
import UserManager from './pages/UserManager';
import UserTypeManager from './pages/UserTypeManager';
import MyPagesManager from './pages/MyPagesManager';
import Login from './pages/Login';
import SubCategoryManager from './pages/SubCategoryManager';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import DbTableViewer from './pages/DbTableViewer';
import PageDesign from './pages/PageDesign';
import PageLinkManager from './pages/PageLinkManager';
// import HistoricalPlaceList from './pages/HistoricalPlaceList'; // Removed as integrated into HistoricalPlace

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex min-h-screen bg-secondary font-sans text-gray-900">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col min-w-0 transition-all duration-300">
            <TopBar />
            <main className="flex-1 mt-20 p-6 overflow-x-hidden overflow-y-auto">
                {children}
            </main>
        </div>
    </div>
);

const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />

                                        <Route path="/home-screen" element={<HomeScreenManager />} />
                                        <Route path="/web-home" element={<WebHomeScreenManager />} />
                                        <Route path="/categories" element={<CategoriesManager />} />
                                        <Route path="/sub-categories" element={<SubCategoryManager />} />
                                        <Route path="/page-content" element={<PageContentManager />} />
                                        <Route path="/page-design" element={<PageDesign />} />
                                        <Route path="/page-links" element={<PageLinkManager />} />
                                        <Route path="/database-definitions" element={<DatabaseManager />} />
                                        <Route path="/splash" element={<SplashManager />} />
                                        <Route path="/database-manager/:tableName" element={<DbTableViewer />} />
                                        <Route path="/onboarding" element={<OnboardingManager />} />
                                        <Route path="/users" element={<UserManager />} />
                                        <Route path="/user-types" element={<UserTypeManager />} />
                                        <Route path="/my-pages" element={<MyPagesManager />} />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;
