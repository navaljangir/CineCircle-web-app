import { Outlet } from "react-router";
import { Header } from "~/components/header";

export default function HeaderLayout() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}