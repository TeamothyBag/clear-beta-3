import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  Facebook, 
  Chrome, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  User, 
  Calendar,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { validationUtils, formatUtils } from "../utils";
import { LoginData, RegisterData } from "../types/api";

interface AuthScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export const AuthScreen = ({ onBack, onComplete }: AuthScreenProps) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register' | 'forgot-password'>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Form state
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: undefined,
    termsAccepted: false,
    privacyPolicyAccepted: false,
    marketingConsent: false
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { login, register, state: authState } = useAuth();
  const { addNotification } = useNotifications();

  // Helper function to render form errors
  const renderError = (field: string) => {
    if (errors[field] && touched[field]) {
      return (
        <Alert className="py-2">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-sm">{errors[field]}</AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  // Validation functions
  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validationUtils.isRequired(loginData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validationUtils.isValidEmail(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validationUtils.isRequired(loginData.password)) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validationUtils.isRequired(registerData.firstName)) {
      newErrors.firstName = 'First name is required';
    } else if (!validationUtils.isValidName(registerData.firstName)) {
      newErrors.firstName = 'Please enter a valid first name';
    }

    if (!validationUtils.isRequired(registerData.lastName)) {
      newErrors.lastName = 'Last name is required';
    } else if (!validationUtils.isValidName(registerData.lastName)) {
      newErrors.lastName = 'Please enter a valid last name';
    }

    if (!validationUtils.isRequired(registerData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validationUtils.isValidEmail(registerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordValidation = validationUtils.isValidPassword(registerData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (confirmPassword !== registerData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (registerData.dateOfBirth && !validationUtils.isValidAge(registerData.dateOfBirth)) {
      newErrors.dateOfBirth = 'You must be at least 13 years old to use this service';
    }

    if (!registerData.termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    if (!registerData.privacyPolicyAccepted) {
      newErrors.privacy = 'You must accept the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    try {
      await login(loginData);
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'Successfully signed in to your account',
        priority: 'medium'
      });
      onComplete();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Sign In Failed',
        message: error.message || 'Failed to sign in. Please try again.',
        priority: 'high'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsLoading(true);
    try {
      await register(registerData);
      addNotification({
        type: 'success',
        title: 'Account Created!',
        message: 'Welcome to Cleared Mind. Please check your email to verify your account.',
        priority: 'medium'
      });
      onComplete();
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Failed to create account. Please try again.',
        priority: 'high'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validationUtils.isValidEmail(forgotEmail)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    try {
      // Note: We'll need to add forgotPassword to AuthContext
      // await forgotPassword(forgotEmail);
      setEmailSent(true);
      addNotification({
        type: 'success',
        title: 'Reset Email Sent',
        message: 'Please check your email for password reset instructions',
        priority: 'medium'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: error.message || 'Failed to send reset email. Please try again.',
        priority: 'high'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    try {
      // Social auth implementation would go here
      addNotification({
        type: 'info',
        title: 'Social Auth',
        message: `${formatUtils.capitalize(provider)} authentication is coming soon!`,
        priority: 'low'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Authentication Failed',
        message: error.message || 'Social authentication failed',
        priority: 'high'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    
    if (mode === 'login') {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else if (mode === 'register') {
      setRegisterData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 relative overflow-hidden">
      {/* Subtle botanical background elements matching welcome screen */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-accent/30 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-success/25 rounded-full blur-xl" />
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header matching PDF style */}
        <header className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => mode === 'welcome' ? onBack() : setMode('welcome')}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {/* Smaller CLEARED MIND branding */}
            <div className="flex flex-col items-center space-y-1">
              <div className="w-8 h-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full" />
                <div className="absolute inset-1 border border-primary/60 rounded-full" />
                <div className="absolute inset-2 bg-primary rounded-full" />
              </div>
              <h1 className="font-caslon text-lg font-medium text-foreground tracking-wide">
                CLEARED MIND
              </h1>
            </div>
            <div className="w-16" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <Card className="therapeutic-card bg-card/95 backdrop-blur-sm border-border/30">
              <CardHeader className="text-center pb-6">
                <CardTitle className="font-caslon text-3xl text-foreground">
                  {mode === 'welcome' && "WELCOME!"}
                  {mode === 'login' && "SIGN IN"}
                  {mode === 'register' && "CREATE ACCOUNT"}
                  {mode === 'forgot-password' && "RESET PASSWORD"}
                </CardTitle>
                {mode === 'welcome' && (
                  <p className="text-muted-foreground mt-2">
                    Begin your journey to mental wellness
                  </p>
                )}
                {mode === 'forgot-password' && emailSent && (
                  <div className="mt-4 p-4 bg-success/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-success mx-auto mb-2" />
                    <p className="text-sm text-success">Email sent successfully!</p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Show any auth-level errors */}
                {authState.error && (
                  <Alert className="border-destructive/50 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{authState.error}</AlertDescription>
                  </Alert>
                )}

                {mode === 'welcome' && (
                  /* Welcome Screen - Social Auth Options */
                  <>
                    <div className="space-y-3">
                      <Button
                        onClick={() => setMode('register')}
                        variant="outline"
                        className="w-full py-3 font-medium border-border/50 hover:bg-muted/50"
                        disabled={isLoading}
                      >
                        <Mail className="w-5 h-5 mr-3" />
                        Continue with Email
                      </Button>
                      
                      <Button
                        onClick={() => handleSocialAuth('facebook')}
                        variant="outline"
                        className="w-full py-3 font-medium border-border/50 hover:bg-muted/50"
                        disabled={isLoading}
                      >
                        <Facebook className="w-5 h-5 mr-3 text-blue-600" />
                        Continue with Facebook
                      </Button>
                      
                      <Button
                        onClick={() => handleSocialAuth('google')}
                        variant="outline"
                        className="w-full py-3 font-medium border-border/50 hover:bg-muted/50"
                        disabled={isLoading}
                      >
                        <Chrome className="w-5 h-5 mr-3 text-red-500" />
                        Continue with Google
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
                      By clicking Continue, you agree to our{" "}
                      <button className="text-primary underline hover:no-underline">Terms</button>{" "}
                      and acknowledge that you have read our{" "}
                      <button className="text-primary underline hover:no-underline">Privacy Policy</button>.
                    </p>

                    <Separator className="bg-border/50" />

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Already have an account?
                      </p>
                      <Button
                        onClick={() => setMode('login')}
                        variant="link"
                        className="font-semibold text-primary hover:text-primary/80"
                      >
                        Login
                      </Button>
                    </div>
                  </>
                )}

                {mode === 'login' && (
                  /* Login Form */
                  <>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="py-3 bg-background/50 border-border/50"
                        />
                        {renderError('email')}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={loginData.password}
                            onChange={(e) => handleFieldChange('password', e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="py-3 pr-10 bg-background/50 border-border/50"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {renderError('password')}
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 font-semibold rounded-lg"
                        disabled={isLoading || authState.isLoading}
                      >
                        {isLoading || authState.isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </form>

                    <div className="text-center space-y-2">
                      <Button
                        onClick={() => setMode('forgot-password')}
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Forgot your password?
                      </Button>
                      <Button
                        onClick={() => setMode('welcome')}
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Don't have an account? Sign up
                      </Button>
                    </div>
                  </>
                )}

                {mode === 'register' && (
                  /* Registration Form */
                  <>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={registerData.firstName}
                            onChange={(e) => handleFieldChange('firstName', e.target.value)}
                            placeholder="First name"
                            required
                            className="py-3 bg-background/50 border-border/50"
                          />
                          {renderError('firstName')}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={registerData.lastName}
                            onChange={(e) => handleFieldChange('lastName', e.target.value)}
                            placeholder="Last name"
                            required
                            className="py-3 bg-background/50 border-border/50"
                          />
                          {renderError('lastName')}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={registerData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="py-3 bg-background/50 border-border/50"
                        />
                        {renderError('email')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-foreground">Date of Birth (Optional)</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={registerData.dateOfBirth ? registerData.dateOfBirth.toISOString().split('T')[0] : ''}
                          onChange={(e) => handleFieldChange('dateOfBirth', e.target.value ? new Date(e.target.value) : undefined)}
                          className="py-3 bg-background/50 border-border/50"
                        />
                        {renderError('dateOfBirth')}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={registerData.password}
                            onChange={(e) => handleFieldChange('password', e.target.value)}
                            placeholder="Create a strong password"
                            required
                            className="py-3 pr-10 bg-background/50 border-border/50"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {renderError('password')}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setTouched(prev => ({ ...prev, confirmPassword: true }));
                            }}
                            placeholder="Confirm your password"
                            required
                            className="py-3 pr-10 bg-background/50 border-border/50"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {renderError('confirmPassword')}
                      </div>

                      {/* Terms and Privacy Checkboxes */}
                      <div className="space-y-3">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registerData.termsAccepted}
                            onChange={(e) => handleFieldChange('termsAccepted', e.target.checked)}
                            className="mt-1 w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm text-muted-foreground">
                            I agree to the{" "}
                            <button type="button" className="text-primary underline hover:no-underline">
                              Terms of Service
                            </button>
                          </span>
                        </label>
                        {renderError('terms')}

                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registerData.privacyPolicyAccepted}
                            onChange={(e) => handleFieldChange('privacyPolicyAccepted', e.target.checked)}
                            className="mt-1 w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm text-muted-foreground">
                            I have read and accept the{" "}
                            <button type="button" className="text-primary underline hover:no-underline">
                              Privacy Policy
                            </button>
                          </span>
                        </label>
                        {renderError('privacy')}

                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registerData.marketingConsent || false}
                            onChange={(e) => handleFieldChange('marketingConsent', e.target.checked)}
                            className="mt-1 w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm text-muted-foreground">
                            I would like to receive wellness tips and updates (optional)
                          </span>
                        </label>
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 font-semibold rounded-lg"
                        disabled={isLoading || authState.isLoading}
                      >
                        {isLoading || authState.isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>

                    <div className="text-center">
                      <Button
                        onClick={() => setMode('login')}
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Already have an account? Sign in
                      </Button>
                    </div>
                  </>
                )}

                {mode === 'forgot-password' && !emailSent && (
                  /* Forgot Password Form */
                  <>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgotEmail" className="text-foreground">Email Address</Label>
                        <Input
                          id="forgotEmail"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            setErrors({});
                          }}
                          placeholder="Enter your email address"
                          required
                          className="py-3 bg-background/50 border-border/50"
                        />
                        {renderError('email')}
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 font-semibold rounded-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending Reset Email...
                          </>
                        ) : (
                          "Send Reset Email"
                        )}
                      </Button>
                    </form>

                    <div className="text-center">
                      <Button
                        onClick={() => setMode('login')}
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </>
                )}

                {mode === 'forgot-password' && emailSent && (
                  /* Password Reset Success */
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      We've sent a password reset link to your email address. 
                      Please check your inbox and follow the instructions.
                    </p>
                    <Button
                      onClick={() => {
                        setEmailSent(false);
                        setMode('login');
                      }}
                      className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 font-semibold rounded-lg"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthScreen;