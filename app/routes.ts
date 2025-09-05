import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("../layouts/AppLayout.tsx", [
        // Routes without header
        route('/login', "routes/Login.tsx"),
        route('/register', "routes/Register.tsx"),
        
        // Routes with header
        layout("../layouts/HeaderLayout.tsx", [
            index("routes/Home.tsx"),
            route('/dashboard', "routes/Dashboard.tsx"),
            route('/series', "routes/Series.tsx"),
            route('/series/:id', "routes/SeriesDetail.tsx"),
            route('/content/:id', "routes/ContentDetail.tsx"),
        ]),
        
        // Catch-all route for well-known URLs (Chrome DevTools, security.txt, etc.)
        route('/.well-known/*', "routes/_well-known.tsx"),
    ]),
] satisfies RouteConfig;
