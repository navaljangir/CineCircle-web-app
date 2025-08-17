import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/Home.tsx"),
    route('/login', "routes/Login.tsx"),
    route('/register', "routes/Register.tsx"),
    route('/dashboard', "routes/Dashboard.tsx"),
    // Catch-all route for well-known URLs (Chrome DevTools, security.txt, etc.)
    route('/.well-known/*', "routes/_well-known.tsx"),
    // route('contact',  "routes/contact.tsx")
] satisfies RouteConfig;
