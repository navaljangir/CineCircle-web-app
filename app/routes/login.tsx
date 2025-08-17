import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect } from "react-router";
import { Form, Link, useActionData, useNavigation } from "react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Chrome, Facebook } from "lucide-react";
import { login } from "~/services/authService";
import { setAuthInStore } from "~/lib/loaders";
import { getUserProfile } from "~/services/userService";
import { ApiError } from "~/lib/errors";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ThemeToggle } from "~/components/ThemeToggle";
import { AUTH_COOKIE } from "~/lib/constants";

export function meta() {
  return [
    { title: "Login - CineCircle" },
    { name: "description", content: "Sign in to your CineCircle account" },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is already logged in
  try {
    await getUserProfile(request);
    return redirect("/dashboard");
  } catch (error) {
    // User is not logged in, continue to login page
    return null;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rememberMe = formData.get("rememberMe") === "on";

  // Validation
  if (!email || !password) {
    return data(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return data(
      { error: "Please enter a valid email address" },
      { status: 400 }
    );
  }

  try {
    const result = await login({ email, password, rememberMe }, request);
    console.log('result' , result)
    
    // Redirect to dashboard
    return redirect("/dashboard", {
    headers: {
      "Set-Cookie": `${AUTH_COOKIE}=${result.accessToken}; HttpOnly; Path=/`
    }
  });
    
  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof ApiError) {
      return data(
        { error: error.message || "Login failed" },
        { status: error.status }
      );
    }
    
    return data(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export function shouldRevalidate() {
  return false;
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-primary">CineCircle</h1>
            <ThemeToggle />
          </div>
          <p className="text-muted-foreground text-center">
            Welcome back! Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form method="post" className="space-y-4">
              {/* Error Message */}
              {actionData?.error && (
                <div className="p-4 rounded-lg bg-destructive/15 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">{actionData.error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    name="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={isSubmitting}
                  />
                  <Label 
                    htmlFor="rememberMe" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Social Login */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    type="button"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
          
          <CardFooter>
            <p className="text-center text-sm text-muted-foreground w-full">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
