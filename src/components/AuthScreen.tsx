import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Facebook, Chrome, ArrowLeft, Eye, EyeOff } from "lucide-react";
import heroForest from "@/assets/hero-forest.jpg";

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
    <div 
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${heroForest})` }}
    >
      {/* Healing overlay */}
      <div className="absolute inset-0 healing-overlay" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-caslon text-2xl font-medium text-white">
              CLEARED MIND
            </h1>
            <div className="w-16" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <Card className="therapeutic-card bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
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
                  /* Sign Up Flow */
                  <>
                    {/* Social Authentication */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleSocialAuth('email')}
                        variant="outline"
                        className="w-full py-3 font-medium"
                        disabled={isLoading}
                      >
                        <Mail className="w-5 h-5 mr-3" />
                        Continue with Email
                      </Button>
                      
                      <Button
                        onClick={() => handleSocialAuth('facebook')}
                        variant="outline"
                        className="w-full py-3 font-medium"
                        disabled={isLoading}
                      >
                        <Facebook className="w-5 h-5 mr-3 text-blue-600" />
                        Continue with Facebook
                      </Button>
                      
                      <Button
                        onClick={() => handleSocialAuth('google')}
                        variant="outline"
                        className="w-full py-3 font-medium"
                        disabled={isLoading}
                      >
                        <Chrome className="w-5 h-5 mr-3 text-red-500" />
                        Continue with Google
                      </Button>
                    </div>

                    {/* Terms and Privacy */}
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      By clicking Continue, you agree to our{" "}
                      <button className="text-primary underline">Terms</button>{" "}
                      and acknowledge that you have read our{" "}
                      <button className="text-primary underline">Privacy Policy</button>, 
                      which explains how to opt out of offers and promos.
                    </p>

                    <Separator />

                    {/* Login Link */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Already have an Account?
                      </p>
                      <Button
                        onClick={() => setIsLogin(true)}
                        variant="link"
                        className="font-semibold text-primary"
                      >
                        Login
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Sign In Form */
                  <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="py-3"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="py-3 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
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
                        className="w-full calming-button py-3 font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Login"}
                      </Button>
                    </form>

                    <div className="text-center">
                      <Button
                        onClick={() => setIsLogin(false)}
                        variant="link"
                        className="text-sm text-muted-foreground"
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