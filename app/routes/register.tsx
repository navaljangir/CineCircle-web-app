import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect } from "react-router";
import { Form, Link, useActionData, useNavigation } from "react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Chrome, Facebook } from "lucide-react";
import { register } from "~/services/authService";
import { getUserProfile } from "~/services/userService";
import { ApiError } from "~/lib/errors";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ThemeToggle } from "~/components/ThemeToggle";

export function meta() {
  return [
    { title: "Register - CineCircle" },
    { name: "description", content: "Create your CineCircle account" },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is already logged in
  try {
    await getUserProfile(request);
    return redirect("/dashboard");
  } catch (error) {
    // User is not logged in, continue to register page
    return data({});
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const agreeToTerms = formData.get("agreeToTerms") === "on";

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return data(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (name.trim().length < 2) {
    return data(
      { error: "Name must be at least 2 characters long" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return data(
      { error: "Please enter a valid email address" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return data(
      { error: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return data(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  if (!agreeToTerms) {
    return data(
      { error: "You must agree to the Terms of Service and Privacy Policy" },
      { status: 400 }
    );
  }

  try {
    const result = await register({ name, email, password, confirmPassword }, request);
    
    // Set cookies or handle authentication tokens here if needed
    // For now, we'll redirect to dashboard
    return redirect("/dashboard");
    
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof ApiError) {
      return data(
        { error: error.message || "Registration failed" },
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

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
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
            Create your account to get started
          </p>
        </div>

        {/* Register Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to create your account
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

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

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
                    placeholder="Enter your password (min. 8 characters)"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    className="w-full pr-10"
                    minLength={8}
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    className="w-full pr-10"
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="agreeToTerms" 
                  name="agreeToTerms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                  disabled={isSubmitting}
                  required
                />
                <Label 
                  htmlFor="agreeToTerms" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:text-primary/80 underline">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Create Account Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
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
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
