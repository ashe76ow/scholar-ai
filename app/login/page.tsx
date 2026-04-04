import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Log in | ScholarAI",
  description: "Log in to your ScholarAI account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <AuthForm type="login" />
    </div>
  );
}
