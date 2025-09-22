import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Facebook, Chrome, ArrowLeft, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export const AuthScreen = ({ onBack, onComplete }: AuthScreenProps) => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 1500);
  };

  const handleSocialAuth = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 1000);
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
              onClick={onBack}
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
                  {isLogin ? "SIGN IN" : "WELCOME!"}
                </CardTitle>
                {!isLogin && (
                  <p className="text-muted-foreground mt-2">
                    Begin your journey to mental wellness
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                {!isLogin ? (
                  /* Sign Up Flow - matching PDF design */
                  <>
                    {/* Social Authentication Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleSocialAuth('email')}
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

                    {/* Terms and Privacy - matching PDF style */}
                    <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
                      By clicking Continue, you agree to our{" "}
                      <button className="text-primary underline hover:no-underline">Terms</button>{" "}
                      and acknowledge that you have read our{" "}
                      <button className="text-primary underline hover:no-underline">Privacy Policy</button>, 
                      which explains how to opt out of offers and promos.
                    </p>

                    <Separator className="bg-border/50" />

                    {/* Login Link */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Already have an Account?
                      </p>
                      <Button
                        onClick={() => setIsLogin(true)}
                        variant="link"
                        className="font-semibold text-primary hover:text-primary/80"
                      >
                        Login
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Sign In Form - cleaner design inspired by PDF */
                  <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="py-3 bg-background/50 border-border/50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 font-semibold rounded-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Login"}
                      </Button>
                    </form>

                    <div className="text-center">
                      <Button
                        onClick={() => setIsLogin(false)}
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Don't have an account? Sign up
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};