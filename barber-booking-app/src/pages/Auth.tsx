import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Pull the current user from context

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  // ROUTE GUARD: If a logged-in user tries to access the auth page (e.g. via back button), redirect them immediately
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setMessage({ text: "Logged in successfully!", type: "success" });

        // Redirect to the home page, using replace: true so they can't hit 'back' to return to login
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone: phone } },
        });
        if (error) throw error;

        setMessage({
          text: "Registration successful! You can now log in.",
          type: "success",
        });
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full p-4 rounded-xl backdrop-blur-sm bg-white/50 border border-white/80 text-saffron-cherry placeholder:text-saffron-cherry/50 focus:border-rose-red focus:bg-white/80 focus:ring-1 focus:ring-rose-red/30 outline-none transition-all shadow-sm font-medium";

  // Prevent flashing the login form for a split second while redirecting
  if (user) return null;

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4 sm:px-6 py-12 text-saffron-cherry">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-saffron-cherry tracking-tight">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClasses}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
            required
          />

          {message && (
            <p
              className={`text-sm font-bold text-center mt-2 ${
                message.type === "error" ? "text-rose-red" : "text-green-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full p-4 rounded-xl bg-rose-red text-white font-bold tracking-wide hover:bg-[#C91A44] hover:shadow-rose-glow transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage(null);
          }}
          className="mt-6 w-full text-sm font-semibold text-saffron-cherry/70 hover:text-rose-red transition-colors"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
