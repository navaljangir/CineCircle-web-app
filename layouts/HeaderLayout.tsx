import { Outlet } from "react-router";
import { Header } from "~/components/header";

export default function HeaderLayout() {
    return (
        <div className="min-h-screen bg-background flex flex-col"> 
            <Header />
            <main className="py-6 h-full w-full">
                <Outlet />
            </main>
        </div>
    );
}