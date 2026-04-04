import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Sign up | ScholarAI",
  description: "Create a new ScholarAI account.",
};

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <AuthForm type="signup" />
    </div>
  );
}
