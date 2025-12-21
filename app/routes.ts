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
            route('/series/:title', "routes/SeriesDetail.tsx"),
            route('/content/:id', "routes/ContentDetail.tsx"),
            route('/movies', "routes/Movies.tsx"),
            route('/movies/:id', "routes/MovieDetail.tsx"),
            route('/admin/movie-upload', "routes/admin.movie-upload.tsx"),
        ]),
        
        route('/.well-known/*', "routes/_well-known.tsx"),
    ]),
] satisfies RouteConfig;
